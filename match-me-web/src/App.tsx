import { JSX, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from './store/userStore';
import './App.css';

// Page components
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Discover from './pages/Discover';
import Messages from './pages/Messages';
import Connections from './pages/Connections';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import UserDetail from './pages/UserDetail';

// Layout component
import MainLayout from './components/layout/MainLayout';

// Protected route component
const ENABLE_AUTH = true; // Re-enable auth check if needed

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = useUserStore(state => state.token); // Check for token instead

  if (ENABLE_AUTH && !token) { // Redirect if auth enabled and no token
    return <Navigate to="/login" replace />;
  }

  return children;
};


function App() {
  // Get necessary state and actions from the store
  const token = useUserStore(state => state.token);
  const user = useUserStore(state => state.user);
  const fetchUserProfile = useUserStore(state => state.fetchUserProfile); // Use the correct fetch function

  useEffect(() => {
    // If a token exists but user data is not loaded, fetch the profile
    if (token && !user) {
      fetchUserProfile();
    }
    // No need to fetch if no token exists
  }, [token, user, fetchUserProfile]); // Depend on token, user, and the fetch function

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          {/* Define nested routes within MainLayout */}
          <Route index element={<Dashboard />} /> {/* Dashboard at root */}
          <Route path="profile" element={<Profile />} />
          <Route path="discover" element={<Discover />} />
          <Route path="messages" element={<Messages />} />
          <Route path="connections" element={<Connections />} />
          <Route path="settings" element={<Settings />} />
          <Route path="users/:userId" element={<UserDetail />} />
          {/* Add other nested routes here */}
        </Route>
        
        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;