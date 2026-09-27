import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FDFBF7',
          100: '#FAF3E7',
          200: '#F4E3C5',
          300: '#ECCF9E',
          400: '#E2BA72',
          500: '#D4AF37', // Master Royal Gold
          600: '#B89326',
          700: '#91711A',
          800: '#6E5414',
          900: '#4A370D',
          950: '#2A1F06',
        },
        noir: {
          950: '#07080B',
          900: '#0B0D12',
          850: '#10131B',
          800: '#161B26',
          750: '#1D2331',
          700: '#252D3F',
          600: '#343E54',
        }
      },
      fontFamily: {
        serif: ['var(--font-cinzel)', 'Georgia', 'serif'],
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(212, 175, 55, 0.25)',
        'gold-glow-lg': '0 0 45px -5px rgba(212, 175, 55, 0.35)',
      }
    },
  },
  plugins: [],
};
export default config;
