/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0a0c',
          panel: 'rgba(20, 22, 26, 0.6)',
          panelHover: 'rgba(30, 33, 40, 0.8)',
        },
        accent: {
          green: '#00e676',
          blue: '#2979ff',
          red: '#ff3d00',
        }
      }
    },
  },
  plugins: [],
}
