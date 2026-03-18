/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      colors: {
        'finance-dark': '#0f172a',
        'finance-blue': '#1e293b',
        'finance-teal': '#14b8a6',
        'finance-light': '#f8fafc',
        'finance-gray': '#94a3b8',
      }
    },
  },
  plugins: [],
}