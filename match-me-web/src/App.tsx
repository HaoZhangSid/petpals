import { JSX, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from './store/userStore';
import './App.css';
// // 导入页面组件（稍后创建）
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Discover from './pages/Discover';
import Messages from './pages/Messages';
import Connections from './pages/Connections';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// 导入布局组件（稍后创建）
import MainLayout from './components/layout/MainLayout';

// 受保护的路由组件
const ENABLE_AUTH = false; // 设置为 false 来临时取消认证

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = useUserStore(state => state.isAuthenticated);

  if (ENABLE_AUTH && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};


function App() {
  // Use separate selectors to avoid creating new objects
  const isAuthenticated = useUserStore(state => state.isAuthenticated);
  const user = useUserStore(state => state.user);
  const fetchUser = useUserStore(state => state.fetchProfile);

  useEffect(() => {
    // 如果有token但没有用户信息，尝试获取用户信息
    if (isAuthenticated && !user) {
      fetchUser();
    }
  }, [isAuthenticated, user, fetchUser]);

  return (
    <Router>
      <Routes>
        {/* 公开路由 */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* 受保护的路由 */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="discover" element={<Discover />} />
          <Route path="messages" element={<Messages />} />
          <Route path="connections" element={<Connections />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        {/* 404页面 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;