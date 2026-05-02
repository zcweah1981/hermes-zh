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
        background: '#08111F',
        surface: '#0D1A30',
        accent: '#5BA7FF',
        muted: '#AFC5DD',
        brand: {
          primary: '#5BA7FF',
          hover: '#7ABBFF',
          active: '#3E88E6',
        },
        accentual: {
          info: '#62D0FF',
          infoSoft: 'rgba(98,208,255,0.16)',
        },
        bg: {
          canvas: '#08111F',
          surface: '#0D1A30',
          elevated: '#112543',
          panel: 'rgba(10,21,39,0.86)',
          code: '#07111F',
        },
        text: {
          primary: '#EAF3FF',
          secondary: '#AFC5DD',
          tertiary: '#708CAB',
          inverse: '#04101E',
        },
        border: {
          DEFAULT: 'rgba(125, 165, 220, 0.18)',
          strong: 'rgba(155, 196, 255, 0.28)',
          accent: 'rgba(91, 167, 255, 0.34)',
          info: 'rgba(98, 208, 255, 0.24)',
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
        soft: '0 14px 36px rgba(2, 8, 20, 0.28)',
        medium: '0 22px 60px rgba(2, 8, 20, 0.36)',
        glow: '0 18px 56px rgba(91, 167, 255, 0.22)',
        focus: '0 0 0 3px rgba(91, 167, 255, 0.28)',
      },
      maxWidth: {
        'site-marketing': '1120px',
        'site-docs': '1360px',
        prose: '800px',
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(circle at top, rgba(91,167,255,0.22), transparent 42%)',
        'shell-glow': 'radial-gradient(circle at top, rgba(91,167,255,0.16), transparent 34%)',
      },
    },
  },
  plugins: [],
}

export default config
