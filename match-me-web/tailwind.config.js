/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // 检查根目录的 HTML
    "./src/**/*.{js,ts,jsx,tsx,vue}", // 检查 src 目录下所有相关 JS/TS/Vue 文件
    // 根据你的项目结构添加其他需要扫描的路径
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FFF6E9',
        softpink: '#FFCAD4',
        skyblue: '#A0D2EB',
        mintgreen: '#C7F0DB',
        lavender: '#E0C3FC'
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif']
      },
      boxShadow: {
        'soft': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)'
      },
      animation: {
        'bounce-slight': 'bounce-slight 2s infinite',
        'pulse-slight': 'pulse-slight 2s infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-in-up': 'fadeInUp 0.3s ease-in-out',
        'highlight': 'highlight 2s ease-in-out',
        'typing': 'bounce-slight 1.4s infinite'
      },
      keyframes: {
        'bounce-slight': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' }
        },
        'pulse-slight': {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(255, 202, 212, 0.7)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 10px rgba(255, 202, 212, 0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(255, 202, 212, 0)' }
        },
        'fadeIn': {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        'fadeInUp': {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        'highlight': {
          '0%': { backgroundColor: 'rgba(224, 195, 252, 0.2)' },
          '50%': { backgroundColor: 'rgba(224, 195, 252, 0.4)' },
          '100%': { backgroundColor: 'rgba(224, 195, 252, 0.2)' }
        },
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      backdropBlur: {
        'xs': '2px',
      },
      // 自定义组件样式
      backgroundOpacity: {
        '15': '0.15',
        '85': '0.85',
        '95': '0.95',
      }
    },
  },
  plugins: [],
}

