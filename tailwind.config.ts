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
        background: "var(--bg-primary)",
        foreground: "var(--text-primary)",
        brand: {
          primary: "#F6F2ED",    // warm champagne
          secondary: "#EDE7E0",
          dark: "#1A1817",       // soft black
          light: "#F6F2ED",
          gold: "#C9A84C",
          burgundy: "#8B2252",
          blush: "#D4A0A0",
        },
        text: {
          primary: "#1A1817",
          secondary: "#6B6560",
          light: "#F6F2ED",
        },
        border: {
          DEFAULT: "#D4CFC8",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        accent: ["var(--font-accent)", "sans-serif"],
      },
      letterSpacing: {
        tracked: "0.15em",
        "tracked-wide": "0.25em",
      },
    },
  },
  plugins: [],
};
export default config;
