import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Conversation, Message, User } from '../mocks/types';
import './messages.css';
import { mockConversations, mockChatMessages } from '../mocks/data/messages';

const Messages = () => {
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  
  // Check if mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Select conversation handler with mobile view toggle
  const handleSelectConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
  };

  // Scroll to latest message when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get('/messages/conversations');
        
        // 检查API返回数据是否有效
        if (!Array.isArray(data) || data.length === 0) {
          console.log("API returned empty or invalid conversations data, using mock data instead");
          setConversations(mockConversations);
          
          // 如果URL中有对话ID，选中对应对话
          if (conversationId && mockConversations.length > 0) {
            const selected = mockConversations.find((conv) => conv.id === conversationId);
            if (selected) {
              setCurrentConversation(selected);
            } else {
              // 如果找不到对应ID但有对话，选择第一个
              setCurrentConversation(mockConversations[0]);
            }
          } else if (mockConversations.length > 0) {
            // 如果URL没有指定对话ID，选择第一个
            setCurrentConversation(mockConversations[0]);
          }
        } else {
          // 正常处理API返回的数据
        setConversations(data);
          
          // 如果URL中有对话ID，选中对应对话
          if (conversationId && data.length > 0) {
            const selected = data.find((conv: Conversation) => conv.id === conversationId);
            if (selected) {
              setCurrentConversation(selected);
            } else if (data.length > 0) {
              // 如果找不到对应ID但有对话，选择第一个
              setCurrentConversation(data[0]);
            }
          } else if (data.length > 0) {
            // 如果URL没有指定对话ID，选择第一个
            setCurrentConversation(data[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch conversations', error);
        console.log("API error, using mock conversations data as fallback");
        // 使用mock数据
        setConversations(mockConversations);
        
        // 如果URL中有对话ID，选中对应对话
        if (conversationId && mockConversations.length > 0) {
          const selected = mockConversations.find((conv) => conv.id === conversationId);
          if (selected) {
            setCurrentConversation(selected);
          } else {
            // 如果找不到对应ID但有对话，选择第一个
            setCurrentConversation(mockConversations[0]);
          }
        } else if (mockConversations.length > 0) {
          // 如果URL没有指定对话ID，选择第一个
          setCurrentConversation(mockConversations[0]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [conversationId]);

  // Fetch messages when conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentConversation) return;
      
      try {
        setIsLoadingMessages(true);
        const { data } = await api.get(`/messages/${currentConversation.id}`);
        
        // 检查API返回数据是否有效
        if (!Array.isArray(data) || data.length === 0) {
          console.log("API returned empty or invalid messages data, using mock data instead");
          // 使用mock数据
          const mockMessagesForConversation = mockChatMessages[currentConversation.id] || [];
          setMessages(mockMessagesForConversation);
          
          // 模拟打字指示器
          if (mockMessagesForConversation.length > 0) {
            setTimeout(() => {
              setIsTyping(true);
              setTimeout(() => {
                setIsTyping(false);
              }, 3000);
            }, 1000);
          }
        } else {
          // 正常处理API返回的数据
          setMessages(data);
          
          // 模拟打字指示器
          if (data.length > 0) {
            setTimeout(() => {
              setIsTyping(true);
              setTimeout(() => {
                setIsTyping(false);
              }, 3000);
            }, 1000);
          }
        }
      } catch (error) {
        console.error('Failed to fetch messages', error);
        console.log("API error, using mock messages data as fallback");
        // 使用mock数据
        const mockMessagesForConversation = mockChatMessages[currentConversation.id] || [];
        setMessages(mockMessagesForConversation);
        
        // 模拟打字指示器
        if (mockMessagesForConversation.length > 0) {
          setTimeout(() => {
            setIsTyping(true);
            setTimeout(() => {
              setIsTyping(false);
            }, 3000);
          }, 1000);
        }
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [currentConversation]);

  // Filter conversations based on search term
  // Make sure filteredConversations is always an array
  const filteredConversations = Array.isArray(conversations) 
    ? (searchTerm
    ? conversations.filter(conv => 
            conv.participants && Array.isArray(conv.participants) && 
        conv.participants.some(user => 
              user && user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
          )
        : conversations)
    : [];

  // Helper to get the other participant (not the current user)
  const getOtherParticipant = (conversation: Conversation): User => {
    // Make sure we have participants before trying to access them
    if (!conversation.participants || !Array.isArray(conversation.participants) || conversation.participants.length === 0) {
      // Return a default user if participants array is empty or not an array
      return {
        id: 'unknown',
        name: 'Unknown User',
        email: '',
        isOnline: false,
        petInfo: 'No pet info',
        pets: []
      };
    }
    return conversation.participants[0]; // This would need logic to determine which is not current user
  };

  // Helper to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
      
      if (diffHours < 1) {
        return `${Math.floor(diffHours * 60)}m ago`;
      } else if (diffHours < 24) {
        return `${Math.floor(diffHours)}h ago`;
      } else if (diffHours < 48) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      console.error('Error formatting date', error);
      return 'Unknown date';
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups: { [key: string]: Message[] } = {};
    
    if (!Array.isArray(messages)) return groups;
    
    messages.forEach(message => {
      try {
        const date = new Date(message.createdAt);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        let dateKey: string;
        
        if (date.toDateString() === today.toDateString()) {
          dateKey = 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
          dateKey = 'Yesterday';
        } else {
          dateKey = date.toLocaleDateString();
        }
        
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        
        groups[dateKey].push(message);
      } catch (error) {
        console.error('Error grouping message by date', error);
      }
    });
    
    return groups;
  };

  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentConversation) return;

    try {
      const newMessageObj: Message = {
        id: Date.now().toString(),
        content: newMessage,
        senderId: 'current-user', // This should come from your auth context
        timestamp: new Date().toISOString(),
        conversationId: currentConversation.id,
        read: true,
        sender: {
          id: 'current-user',
          name: 'You',
          email: 'you@example.com',
          isOnline: true,
          petInfo: 'Your Pet',
          pets: []
        },
        createdAt: new Date().toISOString()
      };
      
      setMessages(prev => Array.isArray(prev) ? [...prev, newMessageObj] : [newMessageObj]);
      setNewMessage('');
      
      // In a real app, you'd update the last message in conversation too
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-softpink border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-cream overflow-hidden">
      <div className="flex h-full">
        {/* Conversation List - hide on mobile when conversation is selected */}
        <div className={`${(isMobileView && currentConversation) ? 'hidden' : 'block'} w-full md:w-[35%] bg-white border-r border-gray-100 flex flex-col h-full shadow-md overflow-hidden`}>
          <div className="p-4 border-b border-gray-100 flex-shrink-0">
            <h1 className="text-xl font-bold text-purple-700 mb-4">Messages</h1>
          <div className="relative">
            <input
              type="text"
                placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-100 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-softpink"
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

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {Array.isArray(filteredConversations) && filteredConversations.length > 0 ? (
              <div className="divide-y divide-gray-100">
            {filteredConversations.map(conversation => {
                  const otherUser = getOtherParticipant(conversation);
                  const isActive = currentConversation?.id === conversation.id;
              
              return (
                    <div
                  key={conversation.id}
                      className={`chat-item p-4 ${
                        isActive 
                          ? 'bg-lavender bg-opacity-20 border-l-4 border-softpink' 
                          : 'hover:bg-gray-50 border-l-4 border-transparent'
                      } cursor-pointer transition-all duration-200`}
                      onClick={() => handleSelectConversation(conversation)}
                >
                  <div className="flex items-start">
                        <div className="relative">
                          {otherUser.avatar ? (
                        <img
                          src={otherUser.avatar}
                          alt={otherUser.name}
                              className="w-12 h-12 rounded-full border border-gray-200 object-cover shadow-sm"
                        />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shadow-sm">
                              {otherUser.name.charAt(0)}
                            </div>
                      )}
                          <div className={`absolute -right-1 -bottom-1 w-4 h-4 ${otherUser.isOnline ? 'bg-green-400' : 'bg-gray-300'} border-2 border-white rounded-full`}></div>
                    </div>
                        <div className="ml-4 flex-1 overflow-hidden">
                          <div className="flex justify-between items-center">
                            <h3 className={`font-semibold ${isActive ? 'text-purple-700' : 'text-gray-700'} truncate max-w-[70%]`}>
                              {otherUser.name}
                            </h3>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatDate(conversation.updatedAt)}
                        </span>
                      </div>
                          <p className="text-sm text-gray-600 mt-1 truncate w-full">
                            {conversation.lastMessage?.content || 'Start chatting...'}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500 truncate max-w-[70%]">
                              {otherUser.petInfo}
                            </span>
                            {conversation.lastMessage && !conversation.lastMessage.read && conversation.lastMessage.sender.id !== 'current-user' && (
                              <span className="unread-indicator text-xs bg-softpink text-white px-2 py-0.5 rounded-full flex items-center">
                                <span className="mr-1">🐾</span> New
                        </span>
                      )}
                    </div>
                  </div>
                      </div>
                    </div>
              );
            })}
          </div>
        ) : (
              <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center m-4">
            <p className="text-gray-600 mb-4">
                  {searchTerm ? 'No matching conversations found' : 'You don\'t have any conversations yet'}
            </p>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                    className="px-4 py-2 bg-softpink text-white rounded-xl hover:bg-pink-600 transition"
                  >
                    Clear Search
                  </button>
                ) : (
                  <Link
                    to="/discover"
                    className="px-4 py-2 bg-softpink text-white rounded-xl hover:bg-pink-600 transition inline-block"
                  >
                    Discover Pet Friends
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chat Display - full width on mobile when conversation is selected */}
        {currentConversation ? (
          <div className={`${(isMobileView) ? 'w-full' : 'w-[65%]'} flex flex-col h-full bg-cream overflow-hidden`}>
            {/* Chat Header */}
            <div className="bg-white p-4 border-b border-gray-100 flex items-center shadow-sm flex-shrink-0">
              <button 
                onClick={() => setCurrentConversation(null)}
                className="md:hidden mr-2 bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition duration-200"
                title="Back to conversations"
              >
                <span className="text-gray-600">←</span>
              </button>
              <div className="relative">
                {getOtherParticipant(currentConversation).avatar ? (
                  <img
                    src={getOtherParticipant(currentConversation).avatar}
                    alt={getOtherParticipant(currentConversation).name}
                    className="w-12 h-12 rounded-full border border-gray-200 object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shadow-sm">
                    {getOtherParticipant(currentConversation).name.charAt(0)}
                  </div>
                )}
                <div className={`absolute -right-1 -bottom-1 w-4 h-4 ${getOtherParticipant(currentConversation).isOnline ? 'bg-green-400' : 'bg-gray-300'} border-2 border-white rounded-full`}></div>
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-purple-700">{getOtherParticipant(currentConversation).name}</h3>
                <p className="text-xs text-green-600">
                  {getOtherParticipant(currentConversation).isOnline ? 'Online now' : 'Offline'}
                </p>
              </div>
              <div className="ml-auto flex space-x-2">
                <button className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition duration-200">
                  <span className="text-gray-600">📞</span>
                </button>
                <button className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition duration-200">
                  <span className="text-gray-600">📷</span>
                </button>
                <button className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition duration-200">
                  <span className="text-gray-600">ℹ️</span>
                </button>
                <button 
                  onClick={() => setCurrentConversation(null)}
                  className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition duration-200"
                  title="Close conversation"
                >
                  <span className="text-gray-600">✕</span>
                </button>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 p-5 overflow-y-auto overflow-x-hidden bg-cream bg-opacity-60 custom-scrollbar">
              {isLoadingMessages ? (
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-2 border-softpink border-t-pink-500 rounded-full animate-spin"></div>
                </div>
              ) : Array.isArray(messages) && messages.length > 0 ? (
                <div>
                  {Object.entries(groupMessagesByDate()).map(([date, dateMessages]) => (
                    <div key={date}>
                      {/* Date Divider */}
                      <div className="flex justify-center my-5">
                        <span className="text-xs bg-lavender bg-opacity-30 text-purple-700 rounded-full px-3 py-1 shadow-sm">
                          {date}
                        </span>
                      </div>
                      
                      {Array.isArray(dateMessages) && dateMessages.map((message) => {
                        const isCurrentUser = message.sender.id === 'current-user';
                        
                        return (
                          <div key={message.id} className={`flex mb-6 ${isCurrentUser ? 'justify-end' : ''}`}>
                            {!isCurrentUser && (
                              <img
                                src={getOtherParticipant(currentConversation).avatar || 'https://via.placeholder.com/32'}
                                alt={message.sender.name}
                                className="w-8 h-8 rounded-full self-end shadow-sm"
                              />
                            )}
                            
                            <div className={`${isCurrentUser ? 'mr-2' : 'ml-2'} max-w-[85%]`}>
                              <div 
                                className={`${
                                  isCurrentUser 
                                    ? 'bg-softpink text-white rounded-tl-2xl rounded-tr-2xl rounded-br-none rounded-bl-2xl' 
                                    : 'bg-white text-gray-700 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-none'
                                } py-3 px-4 shadow-md hover:shadow-lg transition-shadow animate-fade-in break-words`}
                              >
                                {message.image && (
                                  <div className="cursor-pointer hover:opacity-90 transition-opacity">
                                    <img 
                                      src={message.image} 
                                      alt="Shared" 
                                      className="w-full h-auto rounded-xl mb-2" 
                                    />
                                  </div>
                                )}
                                <p className="break-words overflow-hidden message-text">{message.content}</p>
                              </div>
                              <div className={`flex items-center mt-1 ${isCurrentUser ? 'justify-end' : ''}`}>
                                <span className="text-xs text-gray-500">
                                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-xs ml-1">🐾</span>
                                {isCurrentUser && (
                                  <span className="text-xs ml-1 text-gray-500">
                                    {message.read ? '✓✓' : '✓'}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {isCurrentUser && (
                              <img
                                src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80"
                                alt="You"
                                className="w-8 h-8 rounded-full self-end shadow-sm"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  
                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex mb-4">
                      <img
                        src={getOtherParticipant(currentConversation).avatar || 'https://via.placeholder.com/32'}
                        alt={getOtherParticipant(currentConversation).name}
                        className="w-8 h-8 rounded-full self-end shadow-sm"
                      />
                      <div className="ml-2">
                        <div className="bg-white rounded-full py-2 px-4 shadow-sm flex items-center space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Empty div for scroll reference */}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center">
                    <p className="text-gray-600 mb-2">No messages yet</p>
                    <p className="text-sm text-gray-500">Start chatting now</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-gray-100 shadow-md flex-shrink-0">
              <form onSubmit={handleSendMessage} className="flex items-center">
                <button type="button" className="text-gray-500 hover:text-gray-700 mr-2 focus:outline-none">
                  <span className="text-xl">📸</span>
                </button>
                <button type="button" className="text-gray-500 hover:text-gray-700 mr-2 focus:outline-none">
                  <span className="text-xl">😊</span>
                </button>
                <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="bg-transparent w-full focus:outline-none"
                    maxLength={500}
                  />
                  <span className="text-xs text-gray-400 ml-2">
                    {newMessage.length > 0 && `${newMessage.length}/500`}
                  </span>
                </div>
                <button
                  type="submit"
                  className={`${
                    newMessage.trim() 
                      ? 'bg-softpink hover:bg-pink-400 cursor-pointer' 
                      : 'bg-gray-300 cursor-not-allowed'
                  } text-white p-2 rounded-full ml-2 transition duration-300 focus:outline-none focus:ring-2 focus:ring-softpink focus:ring-opacity-50`}
                  disabled={!newMessage.trim()}
                >
                  <span className="text-xl">🐾</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="w-[65%] flex items-center justify-center bg-cream">
            <div className="text-center bg-white p-10 rounded-2xl shadow-md">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a conversation</h3>
              <p className="text-gray-600 mb-4">Or find new friends on the Discover page</p>
              <Link
                to="/discover"
                className="px-4 py-2 bg-softpink text-white rounded-xl hover:bg-pink-600 transition inline-block"
              >
                Discover Pet Friends
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages; 