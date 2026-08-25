/** @type {import('tailwindcss').Config} */

// Builds a Tailwind color object backed by a CSS variable scale, so the whole
// palette can be changed at runtime from the admin Theme panel without a
// rebuild — see src/lib/theme.js + src/components/ThemeStyle.js.
function cssVarScale(name) {
  const stops = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  const scale = {};
  for (const s of stops) {
    scale[s] = ({ opacityValue }) =>
      opacityValue
        ? `rgb(var(--${name}-${s}) / ${opacityValue})`
        : `rgb(var(--${name}-${s}))`;
  }
  return scale;
}

module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette — driven by CSS variables set from the admin Theme
        // panel (falls back to the original orange/navy if unset).
        brand: cssVarScale("brand"),
        navy: cssVarScale("navy"),
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        theme: "var(--radius-base, 0.75rem)",
      },
      container: {
        center: true,
        padding: "1rem",
        screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1180px" },
      },
    },
  },
  plugins: [],
};
