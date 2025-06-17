/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': 'rgb(43, 101, 165)', // #2b65a5
        'primary-hover': 'rgb(0, 147, 69)', // #009345
      }
    },
  },
  plugins: [],
}