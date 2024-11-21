/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          border: 'hsl(var(--border))',
          background: 'hsl(var(--background))',
          foreground: 'hsl(var(--foreground))',
          primary: 'hsl(var(--primary))',
          'primary-foreground': 'hsl(var(--primary-foreground))',
          secondary: 'hsl(var(--secondary))',
          'secondary-foreground': 'hsl(var(--secondary-foreground))',
          muted: 'hsl(var(--muted))',
          'muted-foreground': 'hsl(var(--muted-foreground))',
          accent: 'hsl(var(--accent))',
          'accent-foreground': 'hsl(var(--accent-foreground))',
          card: 'hsl(var(--card))',
          'card-foreground': 'hsl(var(--card-foreground))',
          destructive: 'hsl(var(--destructive))',
          'destructive-foreground': 'hsl(var(--destructive-foreground))',
        },
      },
    },
    plugins: [],
  }