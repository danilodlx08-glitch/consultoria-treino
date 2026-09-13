/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fbf6e8',
          100: '#f4e7c3',
          300: '#e8c96a',
          400: '#d4af37',
          500: '#c9a227',
          600: '#a6851d',
          700: '#7a6316',
        },
        ink: {
          950: '#070707',
          900: '#0c0c0c',
          800: '#121212',
          700: '#1b1b1b',
          600: '#262626',
          500: '#3a3a3a',
        },
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 0 0 1px rgba(212,175,55,0.35), 0 18px 40px rgba(0,0,0,0.45)',
      },
    },
  },
  plugins: [],
}
