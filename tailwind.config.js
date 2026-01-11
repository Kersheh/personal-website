/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        carnation: '#F45F74',
        daintree: '#012A36',
        'dull-lime': '#85C91C',
        mystic: '#D9E3E8',
        'pastel-orange': '#F4AF64',
        onyx: '#121010'
      }
    }
  },
  plugins: []
};

export default config;
