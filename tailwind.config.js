/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        eco: {
          base: "#020617",
          surface: "#111827",
          panel: "#1f2937",
          border: "#334155",
          text: "#f8fafc",
          muted: "#cbd5e1",
          accent: "#10b981",
          accentAlt: "#14b8a6",
        },
      },

      keyframes: {
        "tooltip-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },

      animation: {
        "tooltip-in":
          "tooltip-in 120ms ease-out forwards",
      },

      transitionProperty: {
        theme:
          "background-color, border-color, color, fill, stroke, opacity, box-shadow",
      },
    },
  },

  plugins: [],
};