import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#07152F",
          blue: "#123B7A",
          orange: "#FF6A1A",
          light: "#F5F7FB"
        }
      }
    },
  },
  plugins: [],
};
export default config;
