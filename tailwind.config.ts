import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b', // obsidian zinc-950
        foreground: '#fafafa', // slate-50
        accent: '#ff3b5c', // TikTok hot pink
        'accent-blue': '#00f2fe', // neon blue
        'glass-border': 'rgba(255, 255, 255, 0.08)',
        'glass-bg': 'rgba(0, 0, 0, 0.55)',
        'glass-card': 'rgba(22, 22, 27, 0.75)',
      },
      animation: {
        'spin-slow': 'spin 4s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
