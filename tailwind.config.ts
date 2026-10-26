import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        espresso: '#3B2418',
        coffee: '#6F4E37',
        caramel: '#A47148',
        cream: '#FFF9F1',
        beige: '#EFE2D2',
        gold: '#C5A46D',
        // official logo ground (dark olive-black from the B&S badge)
        logo: '#1E2416',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        script: ['Allura', '"Playfair Display"', 'cursive'],
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(59, 36, 24, 0.18)',
        lift: '0 22px 45px -18px rgba(59, 36, 24, 0.32)',
      },
      borderRadius: { '4xl': '2rem' },
      keyframes: {
        rise: { '0%': { opacity: '0', transform: 'translateY(18px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        steam: { '0%': { opacity: '0', transform: 'translateY(4px) scaleY(.9)' }, '50%': { opacity: '.7' }, '100%': { opacity: '0', transform: 'translateY(-14px) scaleY(1.1)' } },
        pop: { '0%': { transform: 'scale(.4)', opacity: '0' }, '70%': { transform: 'scale(1.08)', opacity: '1' }, '100%': { transform: 'scale(1)' } },
        draw: { '0%': { strokeDashoffset: '48' }, '100%': { strokeDashoffset: '0' } },
      },
      animation: {
        rise: 'rise .7s cubic-bezier(.2,.7,.2,1) both',
        steam: 'steam 2.8s ease-in-out infinite',
        pop: 'pop .55s cubic-bezier(.2,.8,.2,1.2) both',
        draw: 'draw .5s .35s ease-out both',
      },
    },
  },
  plugins: [],
};
export default config;
