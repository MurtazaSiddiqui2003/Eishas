/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Generic theme tokens — each store sets the actual hex values via
        // CSS variables in its own theme.css, so these classes (bg-theme-bg,
        // text-theme-accent, etc.) automatically pick up the right color
        // depending on which store's wrapper div they're rendered inside.
        theme: {
          bg: "var(--bg)",
          ink: "var(--ink)",
          accent: "var(--accent)",
          accent2: "var(--accent-2)",
          gold: "var(--gold)",
        },
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
      },
    },
  },
  plugins: [],
};
