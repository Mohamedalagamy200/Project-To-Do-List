/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.js"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      },
      colors: {
        primary: "#4F46E5",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444"
      }
    }
  }
};
