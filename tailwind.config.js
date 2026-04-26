/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#fdf8f0',
          100: '#fbefd8',
          200: '#f5d9a8',
          300: '#edc070',
          400: '#e4a340',
          500: '#d9871e',
          600: '#c06c14',
          700: '#9f5212',
          800: '#7d3f15',
          900: '#663514',
        }
      }
    },
  },
  plugins: [],
}

