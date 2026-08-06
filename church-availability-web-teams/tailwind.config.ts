import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: '#FBF7ED',
        moss: {
          50: '#EEF2ED',
          100: '#D6E0D2',
          400: '#5C7A54',
          600: '#3A5233',
          900: '#1F2E1B',
        },
        gold: '#B8922E',
        ink: '#20241F',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Work Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
