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
          bg: "#F8FAFC",
          surface: "#FFFFFF",
          border: "#E2E8F0",
          text: "#0F172A",
          muted: "#475569",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Public Sans", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Libre Bodoni", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
