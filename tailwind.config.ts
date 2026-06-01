import type { Config } from "tailwindcss";

const withAlpha = (variable: string) => `hsl(var(${variable}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", "sans-serif"],
        display: ["Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", "sans-serif"],
      },
      colors: {
        border: withAlpha("--border"),
        input: withAlpha("--input"),
        ring: withAlpha("--ring"),
        background: withAlpha("--background"),
        foreground: withAlpha("--foreground"),

        primary: {
          DEFAULT: withAlpha("--primary"),
          foreground: withAlpha("--primary-foreground"),
        },
        secondary: {
          DEFAULT: withAlpha("--secondary"),
          foreground: withAlpha("--secondary-foreground"),
        },
        destructive: {
          DEFAULT: withAlpha("--destructive"),
          foreground: withAlpha("--destructive-foreground"),
        },
        muted: {
          DEFAULT: withAlpha("--muted"),
          foreground: withAlpha("--muted-foreground"),
        },
        accent: {
          DEFAULT: withAlpha("--accent"),
          foreground: withAlpha("--accent-foreground"),
        },

        clear: {
          DEFAULT: withAlpha("--clear"),
        },
        navy: {
          DEFAULT: withAlpha("--navy"),
          dark: withAlpha("--navy-dark"),
          light: withAlpha("--navy-light"),
        },
        text: {
          DEFAULT: withAlpha("--neutral-text"),
          muted: withAlpha("--neutral-muted"),
        },
        surface: {
          DEFAULT: withAlpha("--surface"),
        },
        lavender: {
          DEFAULT: withAlpha("--lavender"),
          light: withAlpha("--lavender-light"),
          dark: withAlpha("--lavender-dark"),
        },
        line: {
          DEFAULT: withAlpha("--line"),
        },
        disabled: {
          DEFAULT: withAlpha("--disabled"),
        },
        disabledText: {
          DEFAULT: withAlpha("--disabled-text"),
        },

        /**
         * 기존 코드 호환용 alias
         */
        indigo: {
          DEFAULT: withAlpha("--neutral-text"),
          light: withAlpha("--navy-light"),
          dark: withAlpha("--neutral-text"),
        },
        prism: {
          DEFAULT: withAlpha("--lavender"),
          light: withAlpha("--lavender-light"),
          dark: withAlpha("--lavender-dark"),
        },
        coral: {
          DEFAULT: withAlpha("--navy"),
          light: withAlpha("--lavender-light"),
          dark: withAlpha("--navy-dark"),
        },
        mist: {
          DEFAULT: withAlpha("--surface"),
        },
        slate: {
          DEFAULT: withAlpha("--neutral-muted"),
        },

        /**
         * 예전 gold 클래스가 남아있어도 깨지지 않게 유지
         */
        gold: {
          DEFAULT: withAlpha("--lavender"),
          light: withAlpha("--lavender-light"),
          dark: withAlpha("--lavender-dark"),
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "broadcast-gradient":
          "linear-gradient(135deg, hsl(var(--navy)), hsl(var(--lavender)))",
        "prism-gradient":
          "linear-gradient(135deg, hsl(var(--navy)), hsl(var(--lavender)))",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;