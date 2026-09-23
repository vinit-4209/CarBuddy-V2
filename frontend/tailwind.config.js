/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0F1216",
          900: "#14171D",
          800: "#1B1F27",
          700: "#242933",
          600: "#323847",
          500: "#4A5164",
        },
        mist: {
          50: "#F7F8FA",
          100: "#EEF0F4",
          200: "#E1E4EA",
          300: "#C9CEDA",
        },
        ignition: {
          50: "#EEF2FF",
          100: "#DDE5FF",
          300: "#93A9FF",
          400: "#5E7BFA",
          500: "#3D5FE0",
          600: "#3049B8",
          700: "#263C93",
        },
        torque: {
          400: "#3FB877",
          500: "#1F9D55",
          600: "#178047",
        },
        caution: {
          400: "#F2A03D",
          500: "#DB8A21",
          600: "#B36D14",
        },
        alert: {
          400: "#E56767",
          500: "#D14343",
          600: "#AC2F2F",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 2px rgba(15,18,22,0.04), 0 12px 32px -16px rgba(15,18,22,0.18)",
        lift: "0 20px 44px -20px rgba(15,18,22,0.35)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        rise: {
          "0%": { opacity: 0, transform: "translateY(6px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.35 },
        },
        gear: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        bar: {
          "0%": { transform: "scaleY(0.3)" },
          "50%": { transform: "scaleY(1)" },
          "100%": { transform: "scaleY(0.3)" },
        },
      },
      animation: {
        rise: "rise 0.35s ease-out both",
        pulseDot: "pulseDot 1.6s ease-in-out infinite",
        gear: "gear 3s linear infinite",
        bar: "bar 1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}

