/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette derived from the Ressa flyers (orange/navy)
        brand: {
          50: "#fff5ed",
          100: "#ffe8d4",
          200: "#ffcda8",
          300: "#ffa971",
          400: "#ff7a38",
          500: "#fc5a13", // primary orange
          600: "#ed4109",
          700: "#c42f0a",
          800: "#9c2710",
          900: "#7e2310",
        },
        navy: {
          50: "#eef4fb",
          100: "#d9e6f5",
          200: "#b9d0ec",
          300: "#8bb0df",
          400: "#5687cd",
          500: "#3568bb",
          600: "#26519d",
          700: "#21437f",
          800: "#1f3a6a",
          900: "#0f2347", // deep navy
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
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
