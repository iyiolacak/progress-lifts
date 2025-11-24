// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
    safelist: ['font-minercraftory', 'font-inter'], // <- optional safety net
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-family-sans)'],
        object: ['var(--font-family-alt)'],
        inter: ['var(--font-family-inter)'],
        mono: ['var(--font-geist-mono)'],
      },
      colors: {
        product: 'var(--color-product)',
        'product/50': 'var(--color-product/50)',
        'product/20': 'var(--color-product/20)',
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        input: 'var(--color-input)',
        'input-dark': 'var(--color-input-dark)',
      },
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
      fontWeight: {
        DEFAULT: '500', // This sets the default font weight to 500 (Medium)
        regular: '500', // This sets the regular font weight to 500 (Medium)
        base: '700', // This sets the base font weight to 700 (Bold)
      },
    },
    },
}
