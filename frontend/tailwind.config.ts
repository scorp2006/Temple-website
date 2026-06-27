import type { Config } from 'tailwindcss';

// Sri Jagajjanani Temple — palette from the Figma design system.
// Light/cream site with a red ramp (exact swatches from the design) plus
// maroon + turmeric gold accents.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Red ramp built around the client's exact primary red #B21A1A
        red: {
          50: '#F7DCDC',
          100: '#EFB8B8',
          200: '#E08A8A',
          300: '#D05C5C',
          400: '#C13434',
          500: '#B21A1A', // primary red (client-specified)
          600: '#971515',
          700: '#7A1010',
        },
        // Deep maroon / burgundy for the Jagajjanani TV band, footer text, etc.
        maroon: {
          DEFAULT: '#7A1020',
          50: '#F7EAEC',
          100: '#ECCDD1',
          200: '#D89AA1',
          300: '#C26771',
          400: '#A23A47',
          500: '#7A1020',
          600: '#660D1B',
          700: '#4E0A15',
          800: '#3A070F',
          900: '#26050A',
        },
        // Turmeric / pasupu gold accent
        gold: {
          DEFAULT: '#D99A2B',
          light: '#EAC066',
          dark: '#B27E1E',
        },
        // Warm neutrals — client-specified cream #FFE1B8
        cream: '#FFE1B8', // client cream (panels, accents)
        page: '#FFF7EC', // lighter page background so cream panels stand out
        sand: '#FBEAD2',
        clay: '#EAD3B5',
        ink: '#3A2A22',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 6px 24px -10px rgba(122, 16, 32, 0.22)',
        card: '0 3px 14px -6px rgba(122, 16, 32, 0.18)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
