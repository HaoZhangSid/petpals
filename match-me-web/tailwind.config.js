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
      }
    },
  },
  plugins: [],
}

