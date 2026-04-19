import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50:  '#f6f7f4',
          100: '#eaede4',
          200: '#d4dbc9',
          300: '#b4c1a2',
          400: '#8ea076',
          500: '#6e7f57',
          600: '#566444',
          700: '#445037',
          800: '#38422e',
          900: '#2f3827',
        },
        warmstone: {
          50:  '#faf8f5',
          100: '#f2ede5',
          200: '#e4d9cb',
          300: '#d2c0aa',
          400: '#bda086',
          500: '#a8856b',
          600: '#956f57',
          700: '#7c5b48',
          800: '#664c3e',
          900: '#554035',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans:  ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
