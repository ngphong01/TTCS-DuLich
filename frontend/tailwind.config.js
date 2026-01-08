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
      },
      screens: {
        'xs': '480px',  // Extra small devices (large phones)
        // Default Tailwind breakpoints:
        // 'sm': '640px'   - Small devices (landscape phones)
        // 'md': '768px'   - Medium devices (tablets)
        // 'lg': '1024px'  - Large devices (desktops)
        // 'xl': '1280px'  - Extra large devices
        // '2xl': '1536px' - 2X Extra large devices
      },
    },
  },
  plugins: [],
};
