import { NavLink } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { usePetStore } from '../../store/petStore';

const Sidebar = () => {
  const { user, logout } = useUserStore();
  const activePet = usePetStore(state => state.activePet);

  return (
    <div className="w-64 bg-white h-screen shadow-soft fixed">
      <div className="p-4 flex justify-center">
        <img 
          src="https://images.unsplash.com/photo-1560807707-8cc77767d783?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80" 
          alt="Match-Me Logo" 
          className="h-16 w-16 rounded-full border-2 border-softpink"
        />
      </div>
      
      <div className="px-4 py-2">
        <div className="bg-lavender bg-opacity-30 rounded-xl p-3 flex items-center space-x-3 mb-6">
          <img 
            src={user?.avatar || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80"} 
            alt="User Avatar" 
            className="h-10 w-10 rounded-full border-2 border-white"
          />
          <div>
            <p className="text-sm font-semibold text-purple-700">
              {user?.name || "User"} & {activePet?.name || "Pet"}
            </p>
            <p className="text-xs text-gray-500">
              {activePet?.breed || "Pet Owner"}
            </p>
          </div>
        </div>
        
        <nav className="space-y-2">
          <NavLink
            to="/"
            className={({ isActive }) => 
              `nav-item flex items-center space-x-3 p-3 rounded-xl ${
                isActive ? 'bg-softpink bg-opacity-30 [--bg-opacity:70%] text-pink-700' : 'hover:bg-gray-100 text-gray-700'
              }`
            }
          >
            <span className="text-lg">🏠</span>
            <span className="font-medium">Dashboard</span>
          </NavLink>
          
          <NavLink
            to="/profile"
            className={({ isActive }) => 
              `nav-item flex items-center space-x-3 p-3 rounded-xl ${
                isActive ? 'bg-skyblue bg-opacity-30 text-blue-700' : 'hover:bg-gray-100 text-gray-700'
              }`
            }
          >
            <span className="text-lg">👤</span>
            <span className="font-medium">My Profile</span>
          </NavLink>
          
          <NavLink
            to="/discover"
            className={({ isActive }) => 
              `nav-item flex items-center space-x-3 p-3 rounded-xl ${
                isActive ? 'bg-mintgreen bg-opacity-30 text-green-700' : 'hover:bg-gray-100 text-gray-700'
              }`
            }
          >
            <span className="text-lg">🔍</span>
            <span className="font-medium">Discover</span>
          </NavLink>
          
          <NavLink
            to="/messages"
            className={({ isActive }) => 
              `nav-item flex items-center space-x-3 p-3 rounded-xl ${
                isActive ? 'bg-softpink bg-opacity-30 text-pink-700' : 'hover:bg-gray-100 text-gray-700'
              }`
            }
          >
            <span className="text-lg">💬</span>
            <span className="font-medium">Messages</span>
            {/* 这里可以添加未读消息数量标记 */}
          </NavLink>
          
          <NavLink
            to="/connections"
            className={({ isActive }) => 
              `nav-item flex items-center space-x-3 p-3 rounded-xl ${
                isActive ? 'bg-skyblue bg-opacity-30 text-blue-700' : 'hover:bg-gray-100 text-gray-700'
              }`
            }
          >
            <span className="text-lg">👥</span>
            <span className="font-medium">Connections</span>
          </NavLink>
          
          <NavLink
            to="/settings"
            className={({ isActive }) => 
              `nav-item flex items-center space-x-3 p-3 rounded-xl ${
                isActive ? 'bg-mintgreen bg-opacity-30 text-green-700' : 'hover:bg-gray-100 text-gray-700'
              }`
            }
          >
            <span className="text-lg">⚙️</span>
            <span className="font-medium">Settings</span>
          </NavLink>
        </nav>
      </div>
      
      <div className="absolute bottom-4 w-full px-4">
        <button 
          onClick={logout}
          className="nav-item flex items-center space-x-3 hover:bg-gray-100 p-3 rounded-xl text-gray-700 w-full"
        >
          <span className="text-lg">🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;