import { useState } from 'react';
import { useUserStore } from '../store/userStore';
import { api } from '../services/api';

const Settings = () => {
  const { user, updateUserProfile, clearUser } = useUserStore();
  const [activeSection, setActiveSection] = useState<'account' | 'notifications' | 'privacy' | 'help'>('account');
  const API_BASE_URL = api.defaults.baseURL;
  
  const [accountForm, setAccountForm] = useState({
    name: user?.name || '',
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
    
    const formData = new FormData();
    formData.append('name', accountForm.name);
    formData.append('bio', accountForm.bio);
    formData.append('location', accountForm.location);

    try {
      console.log("Submitting settings account form:", accountForm);
      await updateUserProfile(formData); 
      alert('Account information updated successfully');
    } catch (error) {
      console.error('Failed to update account information', error);
      alert(`Failed to update account: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    <div className="py-6 px-4 md:px-8 bg-cream min-h-screen">
      <h1 className="text-2xl font-bold text-purple-700 mb-2">Settings</h1>
      <p className="text-gray-600 mb-6">Manage your account preferences and privacy settings</p>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Side Navigation */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <nav>
              <button
                onClick={() => setActiveSection('account')}
                className={`w-full text-left px-4 py-3 rounded-xl mb-2 transition ${
                  activeSection === 'account' 
                    ? 'bg-pink-100 text-pink-600 font-medium' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">👤</span> Account Settings
              </button>
              <button
                onClick={() => setActiveSection('notifications')}
                className={`w-full text-left px-4 py-3 rounded-xl mb-2 transition ${
                  activeSection === 'notifications' 
                    ? 'bg-pink-100 text-pink-600 font-medium' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">🔔</span> Notification Settings
              </button>
              <button
                onClick={() => setActiveSection('privacy')}
                className={`w-full text-left px-4 py-3 rounded-xl mb-2 transition ${
                  activeSection === 'privacy' 
                    ? 'bg-pink-100 text-pink-600 font-medium' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">🔒</span> Privacy Settings
              </button>
              <button
                onClick={() => setActiveSection('help')}
                className={`w-full text-left px-4 py-3 rounded-xl mb-2 transition ${
                  activeSection === 'help' 
                    ? 'bg-pink-100 text-pink-600 font-medium' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">❓</span> Help & Support
              </button>
            </nav>
            
            <div className="border-t border-gray-200 mt-4 pt-4">
              <button
                onClick={clearUser}
                className="w-full text-left px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition"
              >
                <span className="mr-3">🚪</span> Logout
              </button>
            </div>
          </div>
          
          <div className="mt-6 bg-lavender bg-opacity-20 rounded-2xl p-6 text-center">
            <div className="flex justify-center mb-4">
              <span className="text-4xl">🐾</span>
            </div>
            <h3 className="font-bold text-purple-700 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">Our support team is always ready to assist you with any issues.</p>
            <button className="bg-white text-purple-700 border border-purple-200 py-2 px-4 rounded-full text-sm hover:bg-purple-50 transition duration-300">
              Contact Support
            </button>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {/* Account Settings */}
            {activeSection === 'account' && (
              <div>
                <h2 className="text-xl font-semibold text-purple-700 mb-6">Account Settings</h2>
                
                <div className="flex items-center mb-8">
                  <img
                    src={user?.avatar ? `${API_BASE_URL}${user.avatar}` : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80"}
                    alt="User Avatar"
                    className="w-24 h-24 rounded-full border-4 border-mintgreen mr-6 object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{user?.name || 'Username'}</h3>
                    <p className="text-gray-600 text-sm">{user?.email || 'user@example.com'}</p>
                    <div className="mt-3">
                      <button className="bg-gray-100 text-gray-700 py-1 px-4 rounded-full text-sm hover:bg-gray-200 transition duration-300">
                        Change Avatar
                      </button>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleAccountSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-600 text-sm mb-2" htmlFor="name">
                        Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={accountForm.name}
                        onChange={e => setAccountForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-gray-100 border border-gray-200 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm mb-2" htmlFor="email">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full bg-gray-100 border border-gray-200 rounded-full px-4 py-3 focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-600 text-sm mb-2" htmlFor="location">
                      Location
                    </label>
                    <input
                      id="location"
                      type="text"
                      value={accountForm.location}
                      onChange={e => setAccountForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full bg-gray-100 border border-gray-200 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-600 text-sm mb-2" htmlFor="bio">
                      About Me
                    </label>
                    <textarea
                      id="bio"
                      value={accountForm.bio}
                      onChange={e => setAccountForm(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300"
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  
                  <div className="border-t border-gray-100 pt-6 mt-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Pet Information</h3>
                    
                    <div className="flex items-center mb-6">
                      <img
                        src="https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80"
                        alt="Pet Avatar"
                        className="w-20 h-20 rounded-full border-4 border-skyblue mr-4"
                      />
                      <div>
                        <h3 className="font-bold text-gray-800">Max</h3>
                        <p className="text-gray-600 text-sm">Golden Retriever • 3 years</p>
                      </div>
                      <button className="ml-auto bg-gray-100 text-gray-700 py-1 px-4 rounded-full text-sm hover:bg-gray-200 transition duration-300">
                        Manage Pet
                      </button>
                    </div>
                    
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-full text-sm transition duration-300">
                      + Add Another Pet
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-100 py-6 mt-6 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Notification Settings */}
            {activeSection === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold text-purple-700 mb-6">Notification Settings</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-gray-500 text-sm">Receive important updates about your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="emailNotifications"
                        checked={notificationSettings.emailNotifications}
                        onChange={handleNotificationChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium">New Match Notifications</h3>
                      <p className="text-gray-500 text-sm">Notify me when there are new pet matches</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="newMatches"
                        checked={notificationSettings.newMatches}
                        onChange={handleNotificationChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium">Message Notifications</h3>
                      <p className="text-gray-500 text-sm">Notify me when I receive new messages</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="messages"
                        checked={notificationSettings.messages}
                        onChange={handleNotificationChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium">Connection Request Notifications</h3>
                      <p className="text-gray-500 text-sm">Notify me when I receive connection requests</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="connectionRequests"
                        checked={notificationSettings.connectionRequests}
                        onChange={handleNotificationChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">App Update Notifications</h3>
                      <p className="text-gray-500 text-sm">Receive notifications about app updates and new features</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="appUpdates"
                        checked={notificationSettings.appUpdates}
                        onChange={handleNotificationChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                </div>
                
                <div className="mt-8">
                  <button className="px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition">
                    Save Settings
                  </button>
                </div>
              </div>
            )}
            
            {/* Privacy Settings */}
            {activeSection === 'privacy' && (
              <div>
                <h2 className="text-xl font-semibold text-purple-700 mb-6">Privacy Settings</h2>
                
                <div className="space-y-6">
                  <div className="pb-4 border-b border-gray-100">
                    <h3 className="font-medium mb-2">Profile Visibility</h3>
                    <p className="text-gray-500 text-sm mb-3">Control who can view your profile and your pet's profile</p>
                    <select
                      name="profileVisibility"
                      value={privacySettings.profileVisibility}
                      onChange={handlePrivacyChange}
                      className="w-full bg-gray-100 border border-gray-200 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300"
                    >
                      <option value="public">Public (Visible to everyone)</option>
                      <option value="connections">Connected Users Only</option>
                      <option value="private">Private (Only visible to you)</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium">Show Location Information</h3>
                      <p className="text-gray-500 text-sm">Allow other users to see your approximate location</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="showLocation"
                        checked={privacySettings.showLocation}
                        onChange={handlePrivacyChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                  
                  <div className="pb-4 border-b border-gray-100">
                    <h3 className="font-medium mb-2">Messaging Permissions</h3>
                    <p className="text-gray-500 text-sm mb-3">Control who can send you messages</p>
                    <select
                      name="allowMessaging"
                      value={privacySettings.allowMessaging}
                      onChange={handlePrivacyChange}
                      className="w-full bg-gray-100 border border-gray-200 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300"
                    >
                      <option value="everyone">Everyone</option>
                      <option value="connections">Connected Users Only</option>
                      <option value="nobody">No One (Disable all messages)</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-8">
                  <button className="px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition">
                    Save Privacy Settings
                  </button>
                </div>
              </div>
            )}
            
            {/* Help & Support */}
            {activeSection === 'help' && (
              <div>
                <h2 className="text-xl font-semibold text-purple-700 mb-6">Help & Support</h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-medium mb-2">Frequently Asked Questions</h3>
                    <ul className="space-y-2">
                      <li>
                        <button className="text-pink-500 hover:text-pink-600 text-left">
                          How do I add my pet?
                        </button>
                      </li>
                      <li>
                        <button className="text-pink-500 hover:text-pink-600 text-left">
                          How do I manage my pet's photos?
                        </button>
                      </li>
                      <li>
                        <button className="text-pink-500 hover:text-pink-600 text-left">
                          How do I connect with other pet owners?
                        </button>
                      </li>
                      <li>
                        <button className="text-pink-500 hover:text-pink-600 text-left">
                          How do I change my password?
                        </button>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Contact Support</h3>
                    <p className="text-gray-600 mb-4">
                      Have a question or need help? Fill out the form and our support team will get back to you shortly.
                    </p>
                    
                    <div className="mb-4">
                      <label className="block text-gray-600 text-sm mb-2" htmlFor="supportSubject">
                        Subject
                      </label>
                      <input
                        id="supportSubject"
                        type="text"
                        className="w-full bg-gray-100 border border-gray-200 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300"
                        placeholder="Enter subject of your inquiry"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-600 text-sm mb-2" htmlFor="supportMessage">
                        Message
                      </label>
                      <textarea
                        id="supportMessage"
                        className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300"
                        rows={4}
                        placeholder="Please describe your issue in detail..."
                      />
                    </div>
                    
                    <button className="px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition">
                      Submit
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