import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(210, 40%, 96%)",
        foreground: "hsl(222.2, 47.4%, 11.2%)",
        card: "hsl(0, 0%, 100%)",
        border: "hsl(214, 32%, 91%)",
        ring: "hsl(222.2, 84%, 70.4%)"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem"
      }
    }
  },
  plugins: [animatePlugin]
};

export default config;
