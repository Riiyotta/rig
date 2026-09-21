// Design tokens from CLONE_SPEC.md §0.1 / §0.2 / §0.5.
// Colors point at the :root CSS vars in src/index.css (declared there with
// the exact oklch values), so there is a single source of truth.
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    // §0.5 breakpoints are all max-width queries.
    screens: {
      xl: { max: '1280px' },
      lg: { max: '1024px' },
      tab: { min: '769px', max: '1024px' },
      md: { max: '768px' },
    },
    extend: {
      colors: {
        red: { DEFAULT: 'var(--red)', glow: 'var(--red-glow)', hover: '#d93d26' },
        blue: { DEFAULT: 'var(--blue)', dim: 'var(--blue-dim)' },
        green: { DEFAULT: 'var(--green)', dim: 'var(--green-dim)', accent: '#22c55e' },
        ink: 'var(--ink)',
        paper: {
          DEFAULT: 'var(--paper)',
          dim: 'var(--paper-dim)',
          faint: 'var(--paper-faint)',
          70: 'var(--paper-70)',
          60: 'var(--paper-60)',
          50: 'var(--paper-50)',
          45: 'var(--paper-45)',
          40: 'var(--paper-40)',
          35: 'var(--paper-35)',
          30: 'var(--paper-30)',
          25: 'var(--paper-25)',
          20: 'var(--paper-20)',
          15: 'var(--paper-15)',
          12: 'var(--paper-12)',
          '06': 'var(--paper-06)',
          '04': 'var(--paper-04)',
          '02': 'var(--paper-02)',
        },
        border: { DEFAULT: 'var(--border)', dim: 'var(--border-dim)' },
        muted: 'var(--text-muted)',
        tertiary: 'var(--text-tertiary)',
        faint: 'var(--text-faint)',
        terminal: '#050505',
        error: '#ff6b6b',
      },
      fontFamily: {
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
        mono: ['"Chivo Mono"', 'monospace'],
        display: ['Chalet', 'Inter', 'sans-serif'],
        pixel: ['"Geist Pixel Square"', 'monospace'],
      },
      spacing: { chamfer: 'var(--chamfer)' },
    },
  },
  // The spec's .container (index.css) replaces Tailwind's container utility.
  corePlugins: { container: false },
  plugins: [],
}
