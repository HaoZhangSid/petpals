import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const NotFound = () => {
  // 添加动画样式到document head
  useEffect(() => {
    // 创建样式元素
    const styleEl = document.createElement('style');
    // 设置动画CSS
    styleEl.innerHTML = `
      .paw-print {
        animation: float 3s ease-in-out infinite;
      }
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
        100% { transform: translateY(0px); }
      }
      .dog-animation {
        animation: wiggle 2s ease-in-out infinite;
      }
      @keyframes wiggle {
        0% { transform: rotate(0deg); }
        25% { transform: rotate(5deg); }
        75% { transform: rotate(-5deg); }
        100% { transform: rotate(0deg); }
      }
    `;
    // 添加到head
    document.head.appendChild(styleEl);
    
    // 清理函数，移除style元素
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  return (
    <div className="bg-cream min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl text-center">
        <div className="mb-8 flex justify-center">
          <img src="https://images.unsplash.com/photo-1560807707-8cc77767d783?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80" 
               alt="Match-Me Logo" className="h-20 w-20 rounded-full border-2 border-softpink" />
        </div>
        
        <h1 className="text-6xl font-bold mb-4 text-purple-700">4<span className="text-7xl paw-print inline-block">🐾</span>4</h1>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Oops! Page Not Found</h2>
        
        <div className="bg-white rounded-2xl shadow-soft p-8 mb-8 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 opacity-10 text-9xl">
            🐾
          </div>
          
          <div className="mb-8 flex justify-center">
            <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80" 
                 alt="Cute Dog" className="w-40 h-40 rounded-full border-4 border-softpink dog-animation" />
          </div>
          
          <p className="text-gray-700 text-lg mb-8">
            Uh oh! Looks like the page you're looking for has wandered off. Our furry friend is trying to help find it, but in the meantime, let's get you back on track.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/" className="bg-softpink hover:bg-pink-400 text-white px-8 py-3 rounded-full transition duration-300 text-lg shadow-md w-full sm:w-auto">
              Go Home
            </Link>
            <Link to="/discover" className="bg-skyblue hover:bg-blue-400 text-white px-8 py-3 rounded-full transition duration-300 text-lg shadow-md w-full sm:w-auto">
              Discover Pets
            </Link>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/settings/help" className="text-purple-700 hover:text-purple-900 text-sm">Help & Support</Link>
          <span className="text-gray-400">•</span>
          <Link to="/settings/contact" className="text-purple-700 hover:text-purple-900 text-sm">Contact Us</Link>
          <span className="text-gray-400">•</span>
          <Link to="/settings/help" className="text-purple-700 hover:text-purple-900 text-sm">Report a Bug</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 