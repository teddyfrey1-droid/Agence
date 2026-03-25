import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f6f1ea",
        surface: "#ffffff",
        ink: "#171717",
        bronze: "#a27d5c",
        sand: "#ede5db",
        muted: "#6b665f",
        line: "rgba(23,23,23,0.08)",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(17, 17, 17, 0.06)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
