import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      animation: {
        "float": "float 3s ease-in-out infinite",
        "damage": "damage 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.3s ease-out",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-5px)" } },
        damage: { "0%": { opacity: "1", transform: "translateY(0) scale(1)" }, "100%": { opacity: "0", transform: "translateY(-28px) scale(1.15)" } },
        fadeIn: { "0%": { opacity: "0", transform: "translateY(6px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
export default config;
