/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 50:"#f5f3ff", 100:"#ede9fe", 400:"#a78bfa", 500:"#8b5cf6", 600:"#7c3aed", 700:"#6d28d9", 900:"#4c1d95" },
        accent: { 400:"#fb923c", 500:"#f97316", 600:"#ea580c" },
      },
    },
  },
  plugins: [],
};
