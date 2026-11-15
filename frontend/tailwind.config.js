/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0b0d12',
        panel: '#11141b',
        line: '#20242e',
        accent: '#8b7bff',
      },
    },
  },
  plugins: [],
};
