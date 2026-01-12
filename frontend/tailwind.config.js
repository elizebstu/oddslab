/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      midnight: {
        950: '#020202',
        900: '#050505',
        800: '#0a0a0c',
        700: '#121217',
        600: '#1a1a23',
      },
      neon: {
        green: '#00ff88',
        cyan: '#00f0ff',
        purple: '#bf00ff',
        pink: '#ff007a',
        red: '#ff003c',
        yellow: '#fffb00',
      },
      // Include standard colors used in the app
      gray: colors.gray,
      blue: colors.blue,
      red: colors.red,
      green: colors.green,
      primary: {
        50: '#f0f4ff',
        100: '#e0e9ff',
        500: '#6366f1',
        600: '#4f46e5',
        700: '#4338ca',
        950: '#0a0a1a',
      },
      surface: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        900: '#0f172a',
        950: '#020617',
      }
    },
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'Outfit', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'neon-green': '0 0 15px rgba(0, 255, 136, 0.4)',
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.4)',
        'neon-purple': '0 0 15px rgba(191, 0, 255, 0.4)',
        'neon-red': '0 0 15px rgba(255, 0, 60, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
      },
      backgroundImage: {
        'dot-matrix': 'radial-gradient(circle, #ffffff08 1.5px, transparent 1.5px)',
        'cyber-grid': 'linear-gradient(to right, #ffffff05 1px, transparent 1px), linear-gradient(to bottom, #ffffff05 1px, transparent 1px)',
        'hero-gradient': 'radial-gradient(circle at top right, rgba(191, 0, 255, 0.15), transparent 40%), radial-gradient(circle at bottom left, rgba(0, 240, 255, 0.1), transparent 40%)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'scanline': 'scanline 10s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glitch': 'glitch 0.3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.05)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        }
      }
    },
  },
  plugins: [],
}
