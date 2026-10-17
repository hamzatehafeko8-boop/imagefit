import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "var(--color-ink)",
          light: "#223554",
          dark: "#0F1A2C",
        },
        cobalt: {
          DEFAULT: "var(--color-cobalt)",
          hover: "#3351DC",
          light: "#EEF2FE",
        },
        lime: {
          DEFAULT: "var(--color-lime)",
          dark: "#A8D943",
        },
        cloud: {
          DEFAULT: "var(--color-cloud)",
          dark: "#EAEFF7",
        },
        slate: {
          DEFAULT: "var(--color-slate)",
          light: "#8B97AB",
          dark: "#4B5565",
        },
        border: {
          DEFAULT: "var(--color-border)",
          strong: "var(--color-border-strong)",
        },
        success: {
          DEFAULT: "var(--color-success)",
          light: "#E6F5EE",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          light: "#FEF7EA",
        },
        error: {
          DEFAULT: "var(--color-error)",
          light: "#FDF0F1",
        },
        info: {
          DEFAULT: "var(--color-info)",
          light: "#EFF5FC",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Manrope", "sans-serif"],
        sans: ["var(--font-body)", "Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(21, 35, 59, 0.04), 0 4px 12px 0 rgba(21, 35, 59, 0.03)",
        elevated: "0 4px 6px -1px rgba(21, 35, 59, 0.06), 0 10px 24px -3px rgba(21, 35, 59, 0.08)",
        focus: "0 0 0 3px rgba(68, 99, 245, 0.35)",
      },
      borderRadius: {
        card: "16px",
      },
    },
  },
  plugins: [],
};

export default config;
