import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      colors: {
        "surface-page": "#0A0A0F",
        "surface-card": "#12121A",
        "surface-raised": "#1A1A26",
        "surface-subtle": "#14141C",
        "brand-primary": "#6366F1",
        "brand-accent": "#22D3EE",
        "mint-400": "#10B981",
        "mint-500": "#059669",
        "cyan-400": "#22D3EE",
        "text-strong": "#F8FAFC",
        "text-body": "#CBD5E1",
        "text-muted": "#64748B",
        "text-link": "#818CF8",
        "border-subtle": "#1E293B",
        "border-default": "#334155",
        "border-strong": "#475569",
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "10px",
        md: "10px",
        lg: "14px",
        xl: "20px",
        "2xl": "28px",
        "3xl": "40px",
        pill: "9999px",
      },
      boxShadow: {
        sm: "0 2px 8px rgba(0,0,0,0.45)",
        md: "0 4px 20px rgba(0,0,0,0.5)",
        lg: "0 10px 34px rgba(0,0,0,0.55)",
        xl: "0 16px 48px rgba(0,0,0,0.6)",
        "2xl": "0 28px 70px rgba(0,0,0,0.66)",
        "glow-purple": "0 6px 26px rgba(99, 102, 241, 0.40)",
        "glow-cyan": "0 6px 26px rgba(34, 211, 238, 0.36)",
        "glow-mint": "0 6px 26px rgba(16, 185, 129, 0.36)",
      },
    },
  },
  plugins: [],
};
export default config;
