/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0b0f19',      // Deep navy/slate background
          card: '#111827',      // Slightly lighter card container background
          border: '#1f2937',    // Border line color
          accent: '#eab308',    // Golden yellow/orange accent color from mockups
          hover: '#ca8a04',     // Darker gold accent on hover
          text: '#9ca3af',      // Default gray body text
          title: '#f3f4f6',     // Bright title text
          blueAccent: '#3b82f6' // Blue indicator color
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}
