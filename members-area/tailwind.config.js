/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "'SF Pro Text'", "'Inter'", "sans-serif"],
        display: ["-apple-system", "BlinkMacSystemFont", "'SF Pro Display'", "'Inter'", "sans-serif"],
        mono: ["'SF Mono'", "'IBM Plex Mono'", "monospace"],
      },
      colors: {
        /* Mockup tokens */
        "m-bg": "#0A0A0A",
        "m-surface": "#131313",
        "m-surface-2": "#1A1A1A",
        "m-surface-3": "#212121",
        "m-border": "#292929",
        "m-border-soft": "#1F1F1F",
        "m-ink": "#F5F5F4",
        "m-ink-muted": "#8F8F8D",
        "m-ink-faint": "#565654",
        "m-white": "#FFFFFF",

        /* shadcn bridge (kept for compatibility) */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        pill: "980px",
        card: "16px",
        progress: "18px",
        video: "20px",
        lesson: "12px",
        mark: "8px",
      },
      boxShadow: {
        "card": "0 20px 40px -20px rgba(0,0,0,0.5)",
        "card-hover": "0 20px 40px -20px rgba(0,0,0,0.6)",
        "video": "0 30px 60px -30px rgba(0,0,0,0.7)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
