/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors'

export default {
  darkMode: 'class',
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
      gray: colors.gray,
      blue: colors.blue,
      red: colors.red,
      green: colors.green,
      background: 'var(--background)',
      foreground: 'var(--foreground)',
      card: {
        DEFAULT: 'var(--card)',
        foreground: 'var(--card-foreground)',
      },
      border: 'var(--border)',
      muted: {
        DEFAULT: 'var(--muted)',
        foreground: 'var(--muted-foreground)',
      },
    },
    fontFamily: {
      display: ['Space Grotesk', 'Outfit', 'system-ui', 'sans-serif'],
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Menlo', 'monospace'],
    },
    extend: {
      boxShadow: {
        'neon-green': '0 0 15px rgba(0, 255, 136, 0.4)',
        'neon-cyan': '0 0 20px rgba(0, 240, 255, 0.5)',
        'neon-purple': '0 0 20px rgba(191, 0, 255, 0.5)',
        'neon-red': '0 0 15px rgba(255, 0, 60, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
        'hud': 'inset 0 0 20px rgba(0, 240, 255, 0.1), 0 0 20px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'dot-matrix': 'radial-gradient(circle, #ffffff08 1.5px, transparent 1.5px)',
        'cyber-grid': 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
        'hero-gradient': 'radial-gradient(circle at top right, rgba(191, 0, 255, 0.1), transparent 40%), radial-gradient(circle at bottom left, rgba(0, 240, 255, 0.08), transparent 40%), radial-gradient(circle at center, rgba(0, 0, 0, 0), var(--background))',
        'noise': "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')",
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'scanline': 'scanline 10s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glitch': 'glitch 1s infinite linear alternate-reverse',
        'ticker': 'ticker 30s linear infinite',
        'text-glow': 'textGlow 3s ease-in-out infinite',
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
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(1deg)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-1px, 1px)' },
          '40%': { transform: 'translate(-1px, -1px)' },
          '60%': { transform: 'translate(1px, 1px)' },
          '80%': { transform: 'translate(1px, -1px)' },
          '100%': { transform: 'translate(0)' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        textGlow: {
          '0%, 100%': { textShadow: '0 0 10px rgba(0, 240, 255, 0.3)' },
          '50%': { textShadow: '0 0 20px rgba(0, 240, 255, 0.6), 0 0 30px rgba(0, 240, 255, 0.2)' },
        }
      }
    },
  },
  plugins: [],
}
