import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    // './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    // './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    // './src/app/(frontend)/**/*.{js,ts,jsx,tsx,mdx}',
    // './src/app/layout.tsx',
    // IMPORTANT: Only target your frontend, NOT the entire 'app' folder
    './src/app/(frontend)/**/*.{js,ts,jsx,tsx}', // ONLY target frontend
    './src/app/reset-password/**/*.{js,ts,jsx,tsx}', // reset-password page (outside route groups)
    './src/components/**/*.{js,ts,jsx,tsx}',
    // Deliberately excludes src/app/(payload)/** — Payload Admin uses its own styles
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3c97eb',
          // dark: '#3a648c',
          dark: '#3c97eb',
          light: '#6bb3f0',
          50: '#eff7fe',
          100: '#d7eafc',
        },
        heading: '#10242b',
        body: '#212529',
        surface: '#f5f5f5',
        border: '#e5e7eb',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'sans-serif',
        ],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
        },
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}

export default config
