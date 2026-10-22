import fs from "fs";
import path from "path";

function getAllTsxFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== "node_modules" && file !== ".next" && file !== "__tests__") {
        getAllTsxFiles(filePath, fileList);
      }
    } else if (file.endsWith(".tsx")) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const tsxFiles = getAllTsxFiles(path.join(process.cwd(), "src"));
console.log(`Auditing ${tsxFiles.length} TSX component files for SSR / hydration hazards...`);

let issues = 0;

for (const file of tsxFiles) {
  const relPath = path.relative(process.cwd(), file);
  const content = fs.readFileSync(file, "utf-8");

  // Check 1: Direct window / document access outside useEffect or function
  // We look for direct `window.` or `document.` or `localStorage.` in the file
  const lines = content.split("\n");
  let inEffect = false;
  let inFunction = false;

  lines.forEach((line, idx) => {
    // Check if line accesses window or localStorage directly at top level or useState initializer
    if (
      line.includes("localStorage.") ||
      line.includes("sessionStorage.") ||
      line.includes("window.location.") ||
      line.includes("window.innerWidth")
    ) {
      // Check if it's guarded by typeof window !== 'undefined' or inside useEffect
      const isGuarded = line.includes("typeof window") || line.includes("typeof localStorage");
      if (!isGuarded) {
        // If it's inside useState initializer directly:
        if (line.includes("useState(") && (line.includes("localStorage") || line.includes("window"))) {
          console.warn(`[WARN - Hydration Hazard] ${relPath}:${idx + 1} uses window/localStorage in useState initializer: ${line.trim()}`);
          issues++;
        }
      }
    }
  });
}

if (issues === 0) {
  console.log("SUCCESS: No unsafe SSR / hydration access detected in useState initializers!");
} else {
  console.log(`Found ${issues} potential hydration hazards.`);
}
