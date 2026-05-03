/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: '#f97316',
        secondary: '#0f172a',
        wms: {
          dark: '#0f172a',    // bg-slate-900 profundo
          panel: '#1e293b',   // bg-slate-800
          border: '#334155',  // bg-slate-700
          neon: '#10b981',    // Emerald brillante (Success)
          alert: '#f97316',   // Orange original (Alertas)
          danger: '#ef4444',  // Red original
        }
      },
      boxShadow: {
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