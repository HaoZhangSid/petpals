import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.tsx'

async function startApp() {
  // 只在开发环境中启动 mock 服务
  if (process.env.NODE_ENV === 'development') {
    // @ts-ignore
    const { worker } = await import('./mocks/browser')
    // 启动 worker, 不拦截未处理的请求(允许其通过到真实API)
    await worker.start({
      onUnhandledRequest: 'bypass',
    })
    console.log('🔶 Mock Service Worker 已激活')
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

startApp()
