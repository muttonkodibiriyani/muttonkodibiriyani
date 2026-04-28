import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        aic: {
          bg: "#f6f8fb",
          surface: "#ffffff",
          text: "#0f172a",
          muted: "#475569",
          border: "#d5deea",
          accent: "#0056b8"
        }
      }
    }
  },
  plugins: []
};

export default config;
