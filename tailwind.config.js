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
          black: 'rgb(var(--magazine-black) / <alpha-value>)',
          white: 'rgb(var(--magazine-white) / <alpha-value>)',
          cream: 'rgb(var(--magazine-cream) / <alpha-value>)',
          sage: 'rgb(var(--magazine-sage) / <alpha-value>)',
          accent: 'rgb(var(--magazine-accent) / <alpha-value>)',
          'accent-light': 'rgb(var(--magazine-accent-light) / <alpha-value>)',
          'accent-dark': 'rgb(var(--magazine-accent-dark) / <alpha-value>)',
          secondary: 'rgb(var(--magazine-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--magazine-tertiary) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Martel', 'Georgia', 'serif'],
        name: ['Nunito', 'sans-serif'],
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
