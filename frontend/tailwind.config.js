/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#05070b',
        charcoal: '#161b22',
        crimson: '#d9485f',
        blush: '#ff7a7a',
        cream: '#f6f1e8',
      },
      fontFamily: {
        display: ['"Trebuchet MS"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 45px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
};
