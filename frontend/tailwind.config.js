/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        botanical: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        ffj: {
          dark: '#1b4332',
          forest: '#2d6a4f',
          medium: '#40916c',
          light: '#52b788',
          mint: '#74c69d',
          pale: '#d8f3dc',
          cream: '#fbf9f4',
          warmBg: '#f3efe6',
          earth: '#6b4f3b',
          amber: '#d97706',
          terracotta: '#c2410c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
      boxShadow: {
        'aadhar': '0 20px 40px -15px rgba(27, 67, 50, 0.15), 0 0 0 1px rgba(27, 67, 50, 0.05)',
        'plaque': '0 25px 50px -12px rgba(27, 67, 50, 0.25)',
      }
    },
  },
  plugins: [],
}
