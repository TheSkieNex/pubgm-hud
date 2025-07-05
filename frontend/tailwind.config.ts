import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        table: {
          primary: '#9B3EEF',
          secondary: '#CD1832',
          yellow: '#F3C74D',
          dark: '#200B24',
          'dark-light': '#968A8A',
          green: '#25d92c',
        },
      },
      fontFamily: {
        circular: ['Circular', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
