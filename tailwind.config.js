/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rekah: {
          blue: "#0E7490",
          "blue-dark": "#0c627a",
          "blue-light": "#e0f2fe",
          bg: "#F4F7F9",
          panel: "#FFFFFF",
          text: "#1F2937",
          muted: "#5A6B78",
        },
        status: {
          menunggu: "#F59E0B",
          dikonfirmasi: "#2563EB",
          hadir: "#7C3AED",
          selesai: "#15A66A",
          dibatalkan: "#E53935",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["'Outfit'", "'Plus Jakarta Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
