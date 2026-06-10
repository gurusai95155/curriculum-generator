/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C3FB5',
          hover: '#5B339C',
          light: '#F3EEFB',
        },
        sidebarBg: '#F8F7FF',
        published: '#22C55E',
        draft: '#F59E0B',
        sage: {
          DEFAULT: '#14B8A6',
          hover: '#0D9488',
          light: '#F0FDFA',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
