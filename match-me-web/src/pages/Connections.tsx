import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Connection, ConnectionRequest } from '../types';

const Connections = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'connections' | 'requests'>('connections');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [connectionsRes, requestsRes] = await Promise.all([
          api.get('/connections'),
          api.get('/connections/requests')
        ]);
        setConnections(connectionsRes.data);
        setRequests(requestsRes.data);
      } catch (error) {
        console.error('获取连接数据失败', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await api.post(`/connections/requests/${requestId}/accept`);
      // 更新状态，将已接受的请求从requests移动到connections
      const acceptedRequest = requests.find(req => req.id === requestId);
      if (acceptedRequest) {
        setRequests(prev => prev.filter(req => req.id !== requestId));
        // 简化：服务器应该返回新的连接，这里只是模拟
        const newConnection: Connection = {
          id: `new-${requestId}`,
          users: [acceptedRequest.sender, acceptedRequest.receiver],
          createdAt: new Date().toISOString()
        };
        setConnections(prev => [...prev, newConnection]);
      }
    } catch (error) {
      console.error('接受请求失败', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await api.post(`/connections/requests/${requestId}/reject`);
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('拒绝请求失败', error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 md:px-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">连接</h1>

      {/* 选项卡 */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('connections')}
          className={`pb-2 px-4 ${
            activeTab === 'connections'
              ? 'border-b-2 border-pink-500 text-pink-500 font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          我的连接 ({connections.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-2 px-4 ${
            activeTab === 'requests'
              ? 'border-b-2 border-pink-500 text-pink-500 font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          连接请求 
          {requests.length > 0 && (
            <span className="ml-2 bg-pink-500 text-white text-xs rounded-full px-2 py-1">
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {/* 连接列表 */}
      {activeTab === 'connections' && (
        <div>
          {connections.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {connections.map(connection => {
                // 假设第一个用户是连接的对象
                const otherUser = connection.users[0];
                
                return (
                  <div key={connection.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden mr-4">
                        {otherUser.avatar && (
                          <img
                            src={otherUser.avatar}
                            alt={otherUser.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{otherUser.name}</h3>
                        <p className="text-gray-500 text-sm">
                          连接于 {new Date(connection.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition">
                        发送消息
                      </button>
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition">
                        查看档案
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
              <p className="text-gray-600 mb-4">您还没有连接</p>
              <button className="px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition">
                发现宠物朋友
              </button>
            </div>
          )}
        </div>
      )}

      {/* 请求列表 */}
      {activeTab === 'requests' && (
        <div>
          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map(request => (
                <div key={request.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="flex items-center mb-4 sm:mb-0">
                      <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-4">
                        {request.sender.avatar && (
                          <img
                            src={request.sender.avatar}
                            alt={request.sender.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{request.sender.name}</h3>
                        <p className="text-gray-500 text-sm">
                          请求于 {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
                      >
                        接受
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
                      >
                        拒绝
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
              <p className="text-gray-600">没有待处理的连接请求</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Connections; 