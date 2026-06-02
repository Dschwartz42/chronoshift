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
        parchment: "#FAFAF8",
        charcoal: "#1A1A1A",
        "charcoal-soft": "#2C2C2C",
        "charcoal-muted": "#5A5A5A",
        "accent-red": "#8B1A1A",
        "accent-red-light": "#A52A2A",
        "accent-gold": "#C9A84C",
        "accent-gold-light": "#D4B86A",
        "surface-dark": "#0F0E0D",
        "surface-dark-2": "#1C1A18",
        "surface-dark-3": "#2A2724",
        "border-light": "#E8E4DE",
        "border-dark": "#3A3530",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-8px)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "map-drift": {
          "0%": { transform: "translate(0, 0) scale(1.05)" },
          "33%": { transform: "translate(-8px, -4px) scale(1.08)" },
          "66%": { transform: "translate(4px, -6px) scale(1.06)" },
          "100%": { transform: "translate(0, 0) scale(1.05)" },
        },
        "progress-fill": {
          "0%": { width: "0%" },
          "100%": { width: "var(--progress-width)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out forwards",
        "fade-out": "fade-out 0.3s ease-in forwards",
        "slide-up": "slide-up 0.5s ease-out forwards",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "map-drift": "map-drift 20s ease-in-out infinite",
        "progress-fill": "progress-fill 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
