/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IRANSans', 'Tahoma', 'Arial', 'sans-serif'],
      },
      keyframes: {
        'ai-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':       { opacity: '0.5', transform: 'scale(1.08)' },
        },
        'scan': {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(400%)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'glow-ring': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(139,92,246,0.5)' },
          '70%':      { boxShadow: '0 0 0 7px rgba(139,92,246,0)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'ai-pulse':   'ai-pulse 2.4s ease-in-out infinite',
        'scan':       'scan 3s linear infinite',
        'float':      'float 4s ease-in-out infinite',
        'glow-ring':  'glow-ring 2s ease-out infinite',
        'gradient-x': 'gradient-x 4s ease infinite',
      },
      boxShadow: {
        'card':       '0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.05)',
        'card-hover': '0 4px 20px rgba(79,70,229,0.1), 0 1px 4px rgba(0,0,0,0.06)',
        'ai':         '0 0 0 1px rgba(139,92,246,0.15), 0 4px 20px rgba(139,92,246,0.12)',
        'ai-strong':  '0 0 0 1px rgba(139,92,246,0.25), 0 8px 40px rgba(139,92,246,0.2)',
        'modal':      '0 24px 64px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
