/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        dark: {
          bg:         '#080810',
          surface:    '#0f0f1a',
          panel:      'rgba(15, 18, 30, 0.7)',
          panelHover: 'rgba(22, 27, 45, 0.85)',
          border:     'rgba(255, 255, 255, 0.06)',
          card:       'rgba(18, 21, 35, 0.8)',
        },
        accent: {
          blue:    '#3b82f6',
          blueLt:  '#60a5fa',
          green:   '#10b981',
          greenLt: '#34d399',
          red:     '#ef4444',
          redLt:   '#f87171',
          violet:  '#8b5cf6',
          amber:   '#f59e0b',
          cyan:    '#06b6d4',
          pink:    '#ec4899',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shimmer':         'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.07) 50%, transparent 60%)',
      },
      animation: {
        'spin-slow':   'spin 3s linear infinite',
        'pulse-soft':  'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':     'shimmer 2.5s infinite',
        'float':       'float 6s ease-in-out infinite',
        'fade-in':     'fadeIn 0.3s ease-out',
        'slide-up':    'slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-down':  'slideDown 0.25s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px) scale(0.98)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'glow-blue':   '0 0 20px rgba(59, 130, 246, 0.35)',
        'glow-green':  '0 0 20px rgba(16, 185, 129, 0.35)',
        'glow-violet': '0 0 20px rgba(139, 92, 246, 0.35)',
        'glow-red':    '0 0 20px rgba(239, 68, 68, 0.35)',
        'card':        '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover':  '0 8px 40px rgba(0, 0, 0, 0.6)',
        'modal':       '0 24px 80px rgba(0, 0, 0, 0.7)',
        'nav':         '0 -1px 30px rgba(0, 0, 0, 0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
