import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Light theme backgrounds
        background: {
          primary: '#FAFBFC',
          secondary: '#FFFFFF',
          tertiary: '#F4F5F7',
        },
        // Accent colors - pastel palette
        accent: {
          blue: '#5B8DEF',
          green: '#34A853',
          purple: '#A78BFA',
        },
        // Text colors
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
          muted: '#9CA3AF',
        },
        // Border and subtle
        border: {
          DEFAULT: '#E5E7EB',
          light: '#F3F4F6',
        },
        // Legacy gold for backwards compatibility
        gold: {
          400: '#f59e0b',
          500: '#c9a84c',
          600: '#a16207',
        }
      },
      fontFamily: {
        // System font stack
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        // Legacy fonts for backwards compatibility
        cinzel: ['Cinzel', 'serif'],
        raleway: ['Raleway', 'sans-serif'],
      },
      fontSize: {
        'display': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '700' }],
        'h1': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'h2': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        'h3': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'small': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
      },
      boxShadow: {
        // Notion-style subtle shadows
        'notion': '0 1px 3px rgba(0, 0, 0, 0.08)',
        'notion-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'notion-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'notion-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'notion': '8px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      transitionTimingFunction: {
        // Notion-style easing
        'notion': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'notion-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'notion-in': 'cubic-bezier(0.4, 0, 1, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-up': 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in': 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
