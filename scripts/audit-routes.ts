import fs from "fs";
import path from "path";

function getAllRouteFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllRouteFiles(filePath, fileList);
    } else if (file === "route.ts") {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const apiDir = path.join(process.cwd(), "src", "app", "api");
const routes = getAllRouteFiles(apiDir);

console.log(`Found ${routes.length} API route files.`);

let issuesCount = 0;

for (const route of routes) {
  const relPath = path.relative(process.cwd(), route);
  const content = fs.readFileSync(route, "utf-8");

  // Check 1: Does it parse req.json without catch?
  if (content.includes("req.json()") && !content.includes("catch")) {
    console.warn(`[WARN - Unsafe JSON] ${relPath} uses req.json() without .catch()`);
    issuesCount++;
  }

  // Check 2: Does it have try/catch block?
  if (!content.includes("try {") && !content.includes("try{")) {
    console.warn(`[WARN - Missing Try/Catch] ${relPath} might be missing try/catch wrapper`);
    issuesCount++;
  }
}

if (issuesCount === 0) {
  console.log("SUCCESS: All API routes have try/catch error handling and safe JSON parsing!");
} else {
  console.log(`Found ${issuesCount} potential issues in API routes.`);
}
