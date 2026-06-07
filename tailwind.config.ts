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
          primary: "#1A1817",       // noir black
          secondary: "#242220",     // charcoal
          light: "#F6F2ED",         // warm light (for contrast sections)
          dark: "#0F0E0D",          // deeper black
          gold: "#C9A84C",
          burgundy: "#8B2252",
          blush: "#D4A0A0",
        },
        text: {
          primary: "#F0EDE8",
          secondary: "#A09B95",
          dark: "#1A1817",
          light: "#F6F2ED",
        },
        border: {
          DEFAULT: "#33302E",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
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
