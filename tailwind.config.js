/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#0a0a0f',
        surface: '#12121c',
        surface2: '#1a1a28',
        accent: '#6c63ff',
        accent2: '#a78bfa',
        accent3: '#38bdf8',
        gold: '#f59e0b',
        green: '#10b981',
        coral: '#f43f5e',
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.06)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.15)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.25)',
        'glow-xl': '0 0 60px rgba(99, 102, 241, 0.2), 0 0 100px rgba(139, 92, 246, 0.1)',
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 24px rgba(99,102,241,0.08), 0 20px 48px rgba(0,0,0,0.06)',
        'premium': '0 25px 60px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)',
        'premium-lg': '0 30px 80px rgba(0, 0, 0, 0.12), 0 8px 24px rgba(0, 0, 0, 0.06)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        'colored': '0 8px 30px rgba(99, 102, 241, 0.15)',
        'colored-lg': '0 12px 40px rgba(99, 102, 241, 0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.06) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-slower': 'float 12s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient': 'gradient 4s ease infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'glow': 'glow-pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.25)' },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
};
