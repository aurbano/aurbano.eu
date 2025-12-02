/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './layouts/**/*.html',
    './content/**/*.{md,html}',
  ],
  theme: {
    extend: {
      colors: {
        magazine: {
          black: '#0A0A0A',
          white: '#FDFCF8',
          cream: '#FFF9F0',
          sage: '#F5F7F2',
          accent: '#6B7B4B',
          'accent-light': '#8B9B6B',
          'accent-dark': '#4B5B3B',
          secondary: '#9B8B7B',
          tertiary: '#B5A895',
        },
      },
      fontFamily: {
        sans: ['Raleway', 'sans-serif'],
        display: ['Raleway', 'sans-serif'],
        headline: ['Bebas Neue', 'Impact', 'Arial Black', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      fontSize: {
        '7xl': '5rem',
        '8xl': '6rem',
        '9xl': '7rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
