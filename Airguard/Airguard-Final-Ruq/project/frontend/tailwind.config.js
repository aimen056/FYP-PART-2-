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
        navBarbg:'rgba(var(--navbarbg))',
        background:'rgba(var(--background))',
        surfaceColor: 'rgba(var(--surface))',
        primaryText:'rgba(var(--primarytext))',
        secondaryText:'rgba(var(--secondarytext))',
        primaryBtnBg:'rgba(var(--primaryBtnBg))',
        primaryBtnText:'rgba(var(--primaryBtnText))',
        secBtnBg:'rgba(var(--secBtnBg))',
        secBtnText:'rgba(var(--secBtnText))',
        danger:'rgba(var(--danger))',
        success:'rgba(var(--success))',
        aqi: {
          good: "#00E400",
          moderate: "#FFFF00",
          unhealthySensitive: "#FF7E00",
          unhealthy: "#FF0000",
          veryUnhealthy: "#8F3F97",
          hazardous: "#7E0023",
        },
      },
      keyframes: {
        loopScroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        loopScroll: 'loopScroll 30s linear infinite',
      },
    },
  },
 plugins: [],
  darkMode: 'class',
}
