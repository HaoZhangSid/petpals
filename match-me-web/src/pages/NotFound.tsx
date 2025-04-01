import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-24 h-24 mx-auto text-pink-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">页面未找到</h1>
        <p className="text-gray-600 mb-8">
          很抱歉，您访问的页面不存在或已被移除。
        </p>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="block w-full px-4 py-3 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition"
          >
            返回首页
          </Link>
          <Link
            to="/discover"
            className="block w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
          >
            去发现宠物
          </Link>
        </div>

        <div className="mt-8 text-gray-500 text-sm">
          <p>需要帮助？<Link to="/settings/help" className="text-pink-500 hover:text-pink-600">联系客服</Link></p>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 