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
        surface: '#151821',
        accent: '#2db86e',
        muted: '#c6cbd3',
        brand: {
          primary: '#2DB86E',
          hover: '#36C978',
          active: '#23945A',
        },
        accentual: {
          info: '#3DD6F5',
          infoSoft: 'rgba(61,214,245,0.14)',
        },
        bg: {
          canvas: '#0B0C10',
          surface: '#151821',
          elevated: '#1A1F2B',
          panel: 'rgba(255,255,255,0.04)',
          code: '#10141C',
        },
        text: {
          primary: '#F5F7FA',
          secondary: '#C6CBD3',
          tertiary: '#98A1AE',
          inverse: '#08110C',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.10)',
          strong: 'rgba(255,255,255,0.18)',
          accent: 'rgba(45,184,110,0.32)',
          info: 'rgba(61,214,245,0.22)',
        },
        state: {
          info: '#3B82F6',
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        serif: ['Noto Serif SC', 'Songti SC', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        sm: '10px',
        md: '16px',
        lg: '20px',
        xl: '24px',
        '2xl': '28px',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0, 0, 0, 0.18)',
        medium: '0 16px 40px rgba(0, 0, 0, 0.24)',
        glow: '0 12px 48px rgba(45, 184, 110, 0.15)',
        focus: '0 0 0 3px rgba(45, 184, 110, 0.28)',
      },
      maxWidth: {
        'site-marketing': '1120px',
        'site-docs': '1360px',
        prose: '800px',
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(circle at top, rgba(45,184,110,0.20), transparent 42%)',
        'shell-glow': 'radial-gradient(circle at top, rgba(45,184,110,0.12), transparent 34%)',
      },
    },
  },
  plugins: [],
}

export default config
