/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Existing CSS-variable tokens (keep for backwards compat)
        navBarbg: 'rgba(var(--navbarbg))',
        background: 'rgba(var(--background))',
        surfaceColor: 'rgba(var(--surface))',
        primaryText: 'rgba(var(--primarytext))',
        secondaryText: 'rgba(var(--secondarytext))',
        primaryBtnBg: 'rgba(var(--primaryBtnBg))',
        primaryBtnText: 'rgba(var(--primaryBtnText))',
        secBtnBg: 'rgba(var(--secBtnBg))',
        secBtnText: 'rgba(var(--secBtnText))',
        danger: 'rgba(var(--danger))',
        success: 'rgba(var(--success))',
        // Brand palette
        brand: {
          primary: '#0EA5E9',
          secondary: '#10B981',
          accent: '#F97316',
        },
        // Surface neutrals
        surface: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        // AQI standard colors
        aqi: {
          good: '#00E400',
          moderate: '#FFFF00',
          unhealthySensitive: '#FF7E00',
          unhealthy: '#FF0000',
          veryUnhealthy: '#8F3F97',
          hazardous: '#7E0023',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        loopScroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        gaugeRotate: {
          '0%': { strokeDashoffset: '220' },
          '100%': { strokeDashoffset: '0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        loopScroll: 'loopScroll 30s linear infinite',
        gaugeRotate: 'gaugeRotate 2s ease-out forwards',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
