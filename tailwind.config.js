/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#CCCCFF",
        primaryDark: "#B5B5FF",
        secondary: "#9CA3AF",
        background: "#F3F4F6",
      },
      fontFamily: {
        poppins: ["Poppins"],
        "poppins-bold": ["Poppins-Bold"],
        "poppins-medium": ["Poppins-Medium"],
      },
    },
  },
  plugins: [],
};
