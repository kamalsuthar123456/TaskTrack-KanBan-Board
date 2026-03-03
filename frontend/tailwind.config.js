/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Outfit"', 'sans-serif'],
        sans:    ['"Plus Jakarta Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        border:     "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      borderRadius: {
        lg:  "var(--radius)",
        md:  "calc(var(--radius) - 2px)",
        sm:  "calc(var(--radius) - 4px)",
        xl:  "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 16px)",
        "4xl": "2rem",
      },
      boxShadow: {
        "neon-violet": "0 0 20px rgba(139,92,246,0.4), 0 0 60px rgba(139,92,246,0.15)",
        "neon-blue":   "0 0 20px rgba(99,102,241,0.4), 0 0 60px rgba(99,102,241,0.15)",
        "neon-pink":   "0 0 20px rgba(236,72,153,0.4), 0 0 60px rgba(236,72,153,0.15)",
        "card":        "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)",
        "card-hover":  "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(139,92,246,0.2)",
      },
      backgroundImage: {
        "gradient-radial":    "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":     "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "violet-glow":        "radial-gradient(ellipse at center, rgba(139,92,246,0.3) 0%, transparent 70%)",
        "aurora":             "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
      },
      animation: {
        "spin-slow":     "spin 8s linear infinite",
        "pulse-slow":    "pulse 4s ease-in-out infinite",
        "bounce-slow":   "bounce 3s ease-in-out infinite",
        "float":         "float 6s ease-in-out infinite",
        "shimmer":       "shimmer-move 3s linear infinite",
        "glow-pulse":    "orb-pulse 4s ease-in-out infinite",
        "border-spin":   "border-spin 3s linear infinite",
        "aurora-shift":  "aurora-shift 4s ease infinite",
        "slide-up":      "slide-up 0.6s cubic-bezier(0.22,1,0.36,1) forwards",
        "slide-right":   "slide-right 0.6s cubic-bezier(0.22,1,0.36,1) forwards",
        "fade-in":       "fade-in 0.4s ease forwards",
        "scale-in":      "scale-in 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards",
      },
    },
  },
  plugins: [],
}
