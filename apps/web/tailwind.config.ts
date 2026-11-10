import type { Config } from 'tailwindcss';

/** Calm, warm, Montessori-inspired tokens (docs/spec/design/UX_SPEC.md). */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF6EF',
        linen: '#F1EADF',
        sand: '#E4D8C6',
        bark: '#5B4636',
        ink: '#2E2620',
        muted: '#6B5E52',
        sage: { DEFAULT: '#5E7D5A', dark: '#46613F', light: '#E3ECDF' },
        clay: { DEFAULT: '#B5643C', dark: '#8F4A28', light: '#F6E3D8' },
        sky: { DEFAULT: '#4F7896', light: '#E1EBF2' },
        bead: { red: '#B5443A', blue: '#3D6A8C', gold: '#C9952F' },
        focus: '#1F5FAD',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Noto Sans', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      spacing: { 11: '2.75rem', 13: '3.25rem', 18: '4.5rem' },
      borderRadius: { xl2: '1.25rem' },
      transitionDuration: { calm: '200ms' },
      boxShadow: { soft: '0 1px 2px rgba(46,38,32,.06), 0 4px 14px rgba(46,38,32,.06)' },
    },
  },
  plugins: [],
} satisfies Config;
