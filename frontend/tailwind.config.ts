import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── AgriConnect brand palette ─────────────────────────
        forest: {
          DEFAULT: '#2E7D32', // Primary
          dark: '#1B5E20',
          light: '#66BB6A', // Secondary (Leaf Green)
        },
        gold: '#F9A825', // Accent / Warning
        sky: '#0288D1', // Technology accent
        canvas: '#F8FAF5', // Background
        ink: '#263238', // Text
        success: '#4CAF50',
        danger: '#D32F2F',
        // Semantic aliases used throughout components
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#2E7D32',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#66BB6A',
          foreground: '#1B5E20',
        },
        muted: {
          DEFAULT: '#F1F5EF',
          foreground: '#607D8B',
        },
        accent: {
          DEFAULT: '#F9A825',
          foreground: '#263238',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#263238',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)',
        'gradient-tech': 'linear-gradient(135deg, #2E7D32 0%, #0288D1 100%)',
        'gradient-hero': 'linear-gradient(180deg, #1B5E20 0%, #2E7D32 50%, #0288D1 100%)',
      },
      borderRadius: {
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '1.75rem',
        DEFAULT: '0.75rem',
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(38, 50, 56, 0.08)',
        card: '0 2px 12px -2px rgba(46, 125, 50, 0.10)',
        glass: '0 8px 32px 0 rgba(46, 125, 50, 0.12)',
        glow: '0 0 0 4px rgba(102, 187, 106, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'float': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        'ripple': { '0%': { transform: 'scale(0)', opacity: '0.6' }, '100%': { transform: 'scale(2.5)', opacity: '0' } },
        'skeleton': { '0%': { backgroundPosition: '-200px 0' }, '100%': { backgroundPosition: 'calc(200px + 100%) 0' } },
        'kenburns': { '0%': { transform: 'scale(1) translate(0, 0)' }, '100%': { transform: 'scale(1.12) translate(-1%, -1%)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'ripple': 'ripple 0.6s ease-out',
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
        'kenburns': 'kenburns 20s ease-out forwards',
      },
    },
  },
  plugins: [],
} satisfies Config
