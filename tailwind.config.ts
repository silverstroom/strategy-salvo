import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Source Sans 3', 'sans-serif'],
      },
      colors: {
        bg: '#FAF8F5',
        card: '#ffffff',
        accent: '#e6194b',
        accent2: '#c41740',
        edu: '#1B3A7B',
        t1: '#1a1a1a',
        t2: '#555555',
        t3: '#999999',
      },
    },
  },
  plugins: [],
};
export default config;
