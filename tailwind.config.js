export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        neon: '0 0 25px rgba(236, 72, 153, 0.45), 0 0 55px rgba(168, 85, 247, 0.28)',
      },
      colors: {
        midnight: '#070b1a',
        electric: '#8b5cf6',
        pink: '#f472b6',
        cyan: '#22d3ee',
      },
      animation: {
        pulseSlow: 'pulse 2.4s ease-in-out infinite',
        float: 'float 3.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
