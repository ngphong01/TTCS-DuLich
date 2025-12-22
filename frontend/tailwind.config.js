module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
    "./index.html"
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        primary: '#06b6d4',     // cyan-500 - turquoise
        secondary: '#14b8a6',   // teal-500 - xanh lá biển
        accent: '#0ea5e9',      // sky-500 - xanh trời
      }
    },
  },
  plugins: [],
};
