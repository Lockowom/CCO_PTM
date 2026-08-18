import tokens from './src/styles/tokens.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // Clases construidas dinámicamente (bg-${color}-…) que el purge no ve en el
  // código y por eso no se generaban (StatCard de Users, Heatmap). Se preservan.
  safelist: [
    // StatCard (Users) — glow + icono por glowColor
    { pattern: /(bg|text)-(orange|emerald|rose|amber)-(400|500)/, variants: ['group-hover'] },
    { pattern: /bg-(orange|emerald|rose|amber)-500\/(10|20)/, variants: ['group-hover'] },
    // Heatmap — estado de ubicación por color
    { pattern: /(bg|text|border|ring)-(emerald|blue|red)-(100|200|300|700)/ }
  ],
  theme: {
    extend: {
      screens: {
        xs: '360px'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Inter como fuente por defecto para la UI
        mono: ['JetBrains Mono', 'monospace'], // JetBrains para números y SKUs
        poppins: ['Poppins', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif']
      },
      colors: {
        primary: '#f97316',
        secondary: '#0f172a',
        brand: {
          DEFAULT: '#f97316',
          light: '#fff7ed',
          dark: '#c2410c'
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
          info: '#3b82f6'
        }
      },
      spacing: tokens.spacing,
      boxShadow: {
        ...tokens.boxShadow,
        'neon-green': '0 0 15px rgba(16, 185, 129, 0.4)',
        'neon-orange': '0 0 15px rgba(249, 115, 22, 0.4)'
      },
      animation: {
        'slide-in': 'slideIn 0.15s ease-out',
        'fade-in': 'fadeIn 0.15s ease-out',
        'brand-enter': 'brandEnter 0.42s ease-out both',
        'brand-shine': 'brandShine 1.6s ease-out both'
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        brandEnter: {
          '0%': { opacity: '0', transform: 'translateY(6px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
        },
        brandShine: {
          '0%': { opacity: '0' },
          '40%': { opacity: '0.55' },
          '100%': { opacity: '0' }
        }
      }
    }
  },
  plugins: []
};
