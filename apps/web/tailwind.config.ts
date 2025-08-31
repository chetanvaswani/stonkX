import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        grayShade: "#181818"
      },
      fontFamily: {
        franklin: ['Franklin Gothic Medium', 'Arial Narrow', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;