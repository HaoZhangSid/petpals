import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { worker } from './mocks/browser'
import { ModalProvider } from './contexts/ModalContext'
import { initializeAuth } from './store/userStore'

async function startApp() {
  // 只在开发环境中启动 mock 服务
  if (import.meta.env.DEV) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - This might hide an underlying setup issue, but let's keep it for now.
    await worker.start({
      onUnhandledRequest: 'warn',
    })
    console.log('🔶 Mock Service Worker 已激活')
  }
  
  // Initialize authentication state before rendering the app
  initializeAuth();

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ModalProvider>
        <App />
      </ModalProvider>
    </React.StrictMode>,
  )
}

startApp()
