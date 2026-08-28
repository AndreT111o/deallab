import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FAF9F6",
        surface: "#FFFFFF",
        "surface-sunken": "#F2F1EC",
        ink: "#15171B",
        "ink-muted": "#5C6066",
        "ink-faint": "#93968F",
        line: "#E4E2DA",
        "line-strong": "#CFCDC2",
        deal: {
          DEFAULT: "#0E5E45",
          soft: "#E5EEE9",
          strong: "#0A4633",
        },
        positive: "#0E5E45",
        negative: "#A3372B",
        "negative-soft": "#F5E7E4",
        "positive-soft": "#E5EEE9",
        amber: "#96661C",
        "amber-soft": "#F3ECDF",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.02em" }],
      },
      boxShadow: {
        card: "0 1px 2px rgba(21, 23, 27, 0.04), 0 1px 12px rgba(21, 23, 27, 0.03)",
        panel: "0 1px 0 rgba(21,23,27,0.04)",
      },
      borderRadius: {
        sm: "3px",
        DEFAULT: "5px",
        md: "6px",
        lg: "8px",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to bottom, rgba(21,23,27,0.06), transparent)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "grow-x": {
          "0%": { width: "0%" },
          "100%": { width: "var(--target-width, 100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "grow-x": "grow-x 0.8s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
