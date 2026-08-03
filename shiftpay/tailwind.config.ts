import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        earn: "var(--color-earn)",
        "earn-light": "var(--color-earn-light)",
        "earn-muted": "var(--color-earn-muted)",
        loss: "var(--color-loss)",
        "loss-light": "var(--color-loss-light)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        ink: "var(--color-text)",
        muted: "var(--color-muted)",
      },
      boxShadow: {
        card: "0 8px 24px rgba(21, 128, 61, 0.08)",
        sheet: "0 -18px 50px rgba(15, 23, 42, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
