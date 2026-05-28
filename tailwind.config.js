import tokens from './src/styles/tokens.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '360px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Inter como fuente por defecto para la UI
        mono: ['JetBrains Mono', 'monospace'], // JetBrains para números y SKUs
        poppins: ['Poppins', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        primary: '#f97316',
        secondary: '#0f172a',
        brand: {
          DEFAULT: '#f97316',
          light: '#fff7ed',
          dark: '#c2410c',
        },
        wms: {
          void: 'var(--color-void)',
          base: 'var(--color-base)',
          elevated: 'var(--color-elevated)',
          surface: 'var(--color-surface)',
          accent: 'var(--color-accent)',
          dark: '#0f172a',
          panel: '#1e293b',
          border: '#334155',
          neon: '#10b981',
          alert: '#f97316',
          danger: '#ef4444',
          warning: '#f59e0b',
          info: '#3b82f6',
        }
      },
      spacing: tokens.spacing,
      boxShadow: {
        ...tokens.boxShadow,
        'neon-green': '0 0 15px rgba(16, 185, 129, 0.4)',
        'neon-orange': '0 0 15px rgba(249, 115, 22, 0.4)',
      },
      animation: {
        'slide-in': 'slideIn 0.15s ease-out',
        'fade-in': 'fadeIn 0.15s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}