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
          50: '#e8f0fe',
          100: '#d2e3fc',
          200: '#aecbfa',
          300: '#8ab4f8',
          400: '#669df6',
          500: '#4285f4',
          600: '#1a73e8',
          700: '#1557b0',
          800: '#0d47a1',
          900: '#0b3d91'
        },
        secondary: {
          50: '#e6f4ea',
          100: '#ceead6',
          200: '#9dd5ae',
          300: '#6cc085',
          400: '#3bac5d',
          500: '#34a853',
          600: '#2d8f47',
          700: '#26773c',
          800: '#1e5f30',
          900: '#174625'
        },
        accent: {
          50: '#fcebea',
          100: '#f9d6d4',
          200: '#f3adaa',
          300: '#ed857f',
          400: '#e75c55',
          500: '#ea4335',
          600: '#d33b2c',
          700: '#bb3323',
          800: '#a42b1a',
          900: '#8d2311'
        },
        surface: '#ffffff',
        background: '#f8f9fa',
        'text-primary': '#202124',
        'text-secondary': '#5f6368',
        'text-muted': '#80868b'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'typing': 'typing 1.5s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.3s ease-out',
        'slide-up': 'slideUp 0.2s ease-out'
      },
      keyframes: {
        typing: {
          '0%, 80%, 100%': { opacity: '0.3' },
          '40%': { opacity: '1' }
        },
        bounceIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}