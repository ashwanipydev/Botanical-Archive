/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-container": "var(--primary-container)",
        secondary: "var(--secondary)",
        "secondary-container": "var(--secondary-container)",
        tertiary: "var(--tertiary)",
        "tertiary-container": "var(--tertiary-container)",
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-container-lowest": "var(--surface-container-lowest)",
        "surface-container-low": "var(--surface-container-low)",
        "surface-container": "var(--surface-container)",
        "surface-container-high": "var(--surface-container-high)",
        "surface-container-highest": "var(--surface-container-highest)",
        "on-surface": "var(--on-surface)",
        "on-surface-variant": "var(--on-surface-variant)",
        error: "var(--error)",
        "error-container": "var(--error-container)",
        outline: "var(--outline)",
        "outline-variant": "var(--outline-variant)",
      },
      borderRadius: {
        'tactile': '1.5rem', // Botanical Archive Rule
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'organic-sm': 'var(--shadow-sm)',
        'organic-md': 'var(--shadow-md)',
        'organic-lg': 'var(--shadow-lg)',
        'organic-xl': 'var(--shadow-xl)',
      }
    },
  },
  plugins: [],
}
