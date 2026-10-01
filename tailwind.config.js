/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#D85A30",
          dark: "#993C1D",
        },
      },
    },
  },
  plugins: [],
};
