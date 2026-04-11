/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        DarkIndigo: "#0b0c15",
        MineBlue: "#5b6cf9",
        MinePink: "#f95be6",
        MineYellow: "#f9d05b",
        MineDarkYellow: "#d9a517",
      },
    },
  },
  plugins: [],
}
