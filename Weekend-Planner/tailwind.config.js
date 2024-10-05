// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4F46E5",
          dark: "#4338CA",
        },
        secondary: {
          DEFAULT: "#10B981",
          dark: "#059669",
        },
        background: {
          light: "#F3F4F6",
          dark: "#1F2937",
        },
        text: {
          light: "#1F2937",
          dark: "#F9FAFB",
        },
      },
    },
  },
  plugins: [],
};
