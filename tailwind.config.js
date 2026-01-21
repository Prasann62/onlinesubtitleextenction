/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./*.{html,js}"],
    theme: {
        extend: {
            colors: {
                'bg-dark': '#050505',
                'bg-panel': 'rgba(20, 20, 25, 0.7)',
                'primary': '#00f3ff',
                'primary-dim': 'rgba(0, 243, 255, 0.2)',
                'primary-glow': 'rgba(0, 243, 255, 0.4)',
                'secondary': '#bc13fe',
                'secondary-glow': 'rgba(188, 19, 254, 0.4)',
                'accent-success': '#00ff9d',
                'accent-danger': '#ff0055',
                'text-main': '#ffffff',
                'text-muted': '#8890a0',
                'glass-border': 'rgba(255, 255, 255, 0.08)',
                'glass-shine': 'rgba(255, 255, 255, 0.05)',
            },
            fontFamily: {
                'outfit': ['Outfit', 'sans-serif'],
                'mono': ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'drift': 'drift 10s infinite alternate ease-in-out',
                'pulse-slow': 'pulse 2s infinite',
                'wave': 'wave 1s infinite ease-in-out',
                'slide-up': 'slideInUp 0.4s ease-out forwards',
                'fade-in': 'fadeIn 0.3s ease',
            },
            keyframes: {
                drift: {
                    '0%': { transform: 'translate(0, 0)' },
                    '100%': { transform: 'translate(20px, 30px)' },
                },
                wave: {
                    '0%, 100%': { height: '10px', opacity: '0.5' },
                    '50%': { height: '25px', opacity: '1', boxShadow: '0 0 10px rgba(188, 19, 254, 0.4)' },
                },
                slideInUp: {
                    'from': { opacity: '0', transform: 'translateY(20px)' },
                    'to': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    'from': { opacity: '0', transform: 'translateY(10px)' },
                    'to': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [],
}
