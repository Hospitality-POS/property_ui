module.exports = {
  content: [
    './src/pages/**/*.tsx',
    './src/components/**/*.tsx',
    './src/layouts/**/*.tsx',
  ],
  theme: {
    fontSize: {
      xs: '0.66rem',
      sm: '0.8rem',
      base: '1rem',
      xl: '1.15rem',
      '2xl': '1.563rem',
      '3xl': '1.953rem',
      '4xl': '2rem',
      '5xl': '3.052rem',
    },
    extend: {
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      animation: {
        wiggle: 'wiggle 1s ease-in-out infinite',
      },
    },
    debugScreens: {
      selector: '.debug-screens',
      position: ['bottom', 'left'],
      prefix: 'screen: ',
      style: {
        backgroundColor: '#C0FFEE',
        color: 'black',
      },
    },
  },
  plugins: [require('tailwindcss-debug-screens')],
  corePlugins: {
    preflight: true,
  },
};
