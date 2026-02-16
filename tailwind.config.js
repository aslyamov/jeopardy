/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.ts',
  ],
  theme: {
    extend: {
      colors: {
        board: '#1a1a6e',
        cell: '#1e3a8a',
        gold: '#facc15',
      },
    },
  },
  plugins: [],
};
