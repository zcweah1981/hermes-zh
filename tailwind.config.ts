import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0b0c10',
        surface: '#131418',
        accent: '#2db86e',
        muted: '#a8a69f',
        border: '#1e1f26',
      },
      fontFamily: {
        sans: ['Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        serif: ['Noto Serif SC', 'Songti SC', 'serif'],
      },
      boxShadow: {
        glow: '0 12px 48px rgba(45, 184, 110, 0.15)',
      },
    },
  },
  plugins: [],
}

export default config
