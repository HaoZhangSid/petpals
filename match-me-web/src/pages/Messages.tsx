import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Conversation } from '../types';

const Messages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get('/messages/conversations');
        setConversations(data);
      } catch (error) {
        console.error('获取对话失败', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // 过滤对话
  const filteredConversations = searchTerm
    ? conversations.filter(conv => 
        conv.participants.some(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : conversations;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载对话...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="py-6 px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">消息</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="搜索对话..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 px-4 py-2 pl-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-6">
        {filteredConversations.length > 0 ? (
          <div className="space-y-4">
            {filteredConversations.map(conversation => {
              // 获取对话中的另一个用户（不是当前用户）
              const otherUser = conversation.participants[0];
              
              return (
                <Link
                  key={conversation.id}
                  to={`/messages/${conversation.id}`}
                  className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-4">
                      {otherUser.avatar && (
                        <img
                          src={otherUser.avatar}
                          alt={otherUser.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium">{otherUser.name}</h3>
                        <span className="text-xs text-gray-500">
                          {new Date(conversation.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-1 mb-1">
                        {conversation.lastMessage?.content || '开始对话...'}
                      </p>
                      {!conversation.lastMessage?.read && (
                        <span className="inline-block px-2 py-1 bg-pink-500 text-white text-xs rounded-full">
                          新消息
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-gray-600 mb-4">
              {searchTerm ? '没有找到匹配的对话' : '您还没有任何对话'}
            </p>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition"
              >
                清除搜索
              </button>
            ) : (
              <Link
                to="/discover"
                className="px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition inline-block"
              >
                发现宠物朋友
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages; 