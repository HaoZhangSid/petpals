import { useState } from 'react';
import { useUserStore } from '../store/userStore';

const Settings = () => {
  const { user, updateProfile, logout } = useUserStore();
  const [activeSection, setActiveSection] = useState<'account' | 'notifications' | 'privacy' | 'help'>('account');
  
  const [accountForm, setAccountForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newMatches: true,
    messages: true,
    connectionRequests: true,
    appUpdates: false
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showLocation: true,
    allowMessaging: 'connections'
  });
  
  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        name: accountForm.name,
        bio: accountForm.bio,
        location: accountForm.location
      });
      alert('账户信息更新成功');
    } catch (error) {
      console.error('更新账户信息失败', error);
    }
  };
  
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };
  
  const handlePrivacyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isCheckbox = (e.target as HTMLInputElement).type === 'checkbox';
    setPrivacySettings(prev => ({ 
      ...prev, 
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value 
    }));
  };
  
  return (
    <div className="py-6 px-4 md:px-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">设置</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* 侧边导航 */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <nav>
              <button
                onClick={() => setActiveSection('account')}
                className={`w-full text-left px-4 py-3 rounded-xl mb-2 ${
                  activeSection === 'account' 
                    ? 'bg-pink-100 text-pink-600 font-medium' 
                    : 'hover:bg-gray-100'
                }`}
              >
                账户设置
              </button>
              <button
                onClick={() => setActiveSection('notifications')}
                className={`w-full text-left px-4 py-3 rounded-xl mb-2 ${
                  activeSection === 'notifications' 
                    ? 'bg-pink-100 text-pink-600 font-medium' 
                    : 'hover:bg-gray-100'
                }`}
              >
                通知设置
              </button>
              <button
                onClick={() => setActiveSection('privacy')}
                className={`w-full text-left px-4 py-3 rounded-xl mb-2 ${
                  activeSection === 'privacy' 
                    ? 'bg-pink-100 text-pink-600 font-medium' 
                    : 'hover:bg-gray-100'
                }`}
              >
                隐私设置
              </button>
              <button
                onClick={() => setActiveSection('help')}
                className={`w-full text-left px-4 py-3 rounded-xl mb-2 ${
                  activeSection === 'help' 
                    ? 'bg-pink-100 text-pink-600 font-medium' 
                    : 'hover:bg-gray-100'
                }`}
              >
                帮助与支持
              </button>
            </nav>
            
            <div className="border-t border-gray-200 mt-4 pt-4">
              <button
                onClick={logout}
                className="w-full text-left px-4 py-3 rounded-xl text-red-500 hover:bg-red-50"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
        
        {/* 主要内容区域 */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {/* 账户设置 */}
            {activeSection === 'account' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">账户设置</h2>
                <form onSubmit={handleAccountSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-700 mb-2" htmlFor="name">
                        姓名
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={accountForm.name}
                        onChange={e => setAccountForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2" htmlFor="email">
                        邮箱
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={accountForm.email}
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2" htmlFor="location">
                      位置
                    </label>
                    <input
                      id="location"
                      type="text"
                      value={accountForm.location}
                      onChange={e => setAccountForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="例如：北京市海淀区"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2" htmlFor="bio">
                      个人简介
                    </label>
                    <textarea
                      id="bio"
                      value={accountForm.bio}
                      onChange={e => setAccountForm(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
                      rows={4}
                      placeholder="介绍一下自己..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition"
                  >
                    保存更改
                  </button>
                </form>
              </div>
            )}
            
            {/* 通知设置 */}
            {activeSection === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">通知设置</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium">电子邮件通知</h3>
                      <p className="text-gray-500 text-sm">接收有关您的账户的重要更新</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="emailNotifications"
                        checked={notificationSettings.emailNotifications}
                        onChange={handleNotificationChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium">新匹配通知</h3>
                      <p className="text-gray-500 text-sm">有新的宠物匹配时通知我</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="newMatches"
                        checked={notificationSettings.newMatches}
                        onChange={handleNotificationChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium">消息通知</h3>
                      <p className="text-gray-500 text-sm">收到新消息时通知我</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="messages"
                        checked={notificationSettings.messages}
                        onChange={handleNotificationChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium">连接请求通知</h3>
                      <p className="text-gray-500 text-sm">收到连接请求时通知我</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="connectionRequests"
                        checked={notificationSettings.connectionRequests}
                        onChange={handleNotificationChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">应用更新通知</h3>
                      <p className="text-gray-500 text-sm">接收有关应用更新和新功能的通知</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="appUpdates"
                        checked={notificationSettings.appUpdates}
                        onChange={handleNotificationChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                </div>
                
                <div className="mt-8">
                  <button className="px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition">
                    保存设置
                  </button>
                </div>
              </div>
            )}
            
            {/* 隐私设置 */}
            {activeSection === 'privacy' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">隐私设置</h2>
                
                <div className="space-y-6">
                  <div className="pb-4 border-b border-gray-100">
                    <h3 className="font-medium mb-2">个人资料可见性</h3>
                    <p className="text-gray-500 text-sm mb-3">控制谁可以查看您和您宠物的资料</p>
                    <select
                      name="profileVisibility"
                      value={privacySettings.profileVisibility}
                      onChange={handlePrivacyChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
                    >
                      <option value="public">公开（所有人可见）</option>
                      <option value="connections">仅限连接的用户</option>
                      <option value="private">私密（仅自己可见）</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium">显示位置信息</h3>
                      <p className="text-gray-500 text-sm">允许其他用户查看您的大致位置</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="showLocation"
                        checked={privacySettings.showLocation}
                        onChange={handlePrivacyChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                  
                  <div className="pb-4 border-b border-gray-100">
                    <h3 className="font-medium mb-2">消息权限</h3>
                    <p className="text-gray-500 text-sm mb-3">控制谁可以向您发送消息</p>
                    <select
                      name="allowMessaging"
                      value={privacySettings.allowMessaging}
                      onChange={handlePrivacyChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
                    >
                      <option value="everyone">所有人</option>
                      <option value="connections">仅限连接的用户</option>
                      <option value="nobody">禁止所有消息</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-8">
                  <button className="px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition">
                    保存隐私设置
                  </button>
                </div>
              </div>
            )}
            
            {/* 帮助与支持 */}
            {activeSection === 'help' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">帮助与支持</h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-medium mb-2">常见问题</h3>
                    <ul className="space-y-2">
                      <li>
                        <button className="text-pink-500 hover:text-pink-600 text-left">
                          如何添加我的宠物？
                        </button>
                      </li>
                      <li>
                        <button className="text-pink-500 hover:text-pink-600 text-left">
                          如何管理宠物的照片？
                        </button>
                      </li>
                      <li>
                        <button className="text-pink-500 hover:text-pink-600 text-left">
                          如何与其他宠物主人联系？
                        </button>
                      </li>
                      <li>
                        <button className="text-pink-500 hover:text-pink-600 text-left">
                          如何更改我的密码？
                        </button>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">联系客服</h3>
                    <p className="text-gray-600 mb-4">
                      有任何问题或需要帮助？请填写表单，我们的客服团队会尽快回复您。
                    </p>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2" htmlFor="supportSubject">
                        主题
                      </label>
                      <input
                        id="supportSubject"
                        type="text"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
                        placeholder="请输入问题主题"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2" htmlFor="supportMessage">
                        消息内容
                      </label>
                      <textarea
                        id="supportMessage"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
                        rows={4}
                        placeholder="请详细描述您的问题..."
                      />
                    </div>
                    
                    <button className="px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition">
                      提交
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 