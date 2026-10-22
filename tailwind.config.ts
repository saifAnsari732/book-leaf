import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bookleaf: {
          50: "#F2F7F4",
          100: "#E1EDE6",
          200: "#C4DDCF",
          300: "#9EC7B3",
          400: "#6FA990",
          500: "#44896E",
          600: "#1A6B52",
          700: "#0F4C3A",
          800: "#0A3B2D",
          900: "#062A22",
          950: "#031813",
        },
        brand: {
          50: "#f0f5fa",
          100: "#dce8f3",
          200: "#bfd5ea",
          300: "#93b8dc",
          400: "#6094ca",
          500: "#3c76b6",
          600: "#1b4d7e",
          700: "#163f68",
          800: "#123456",
          900: "#0e2842",
          950: "#091a2c",
        },
        editorial: {
          bg: "#F9FAF7",
          surface: "#FFFFFF",
          border: "#E7EBE4",
          text: "#1E293B",
          muted: "#64748B",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
