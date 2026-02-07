/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#6366f1', // Indigo 500
          hover: '#4f46e5',   // Indigo 600
        },
        hot: '#ef4444',      // Red 500
        warm: '#f59e0b',     // Amber 500
        cold: '#3b82f6',     // Blue 500
        closed: '#10b981',   // Emerald 500
      }
    },
  },
  plugins: [],
}
