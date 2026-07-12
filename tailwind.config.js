/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1A0B2E",
        grape: "#2D1B4E",
        coral: "#FF5D73",
        gold: "#FFC857",
        cream: "#FFF8F0",
        mint: "#3DDC97",
      },
      fontFamily: {
        fredoka: ["Fredoka", "system-ui", "sans-serif"],
        jakarta: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
