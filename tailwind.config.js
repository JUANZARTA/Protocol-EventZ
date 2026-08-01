/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FBF6E9',
          100: '#F5E9C4',
          200: '#EBD489',
          300: '#DFBE5C',
          400: '#D4AF37',
          500: '#C9A227',
          600: '#B08A1C',
          700: '#8C6C16',
          800: '#6B5211',
          900: '#4A390B',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

