import React, { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import '../../style/chat/chat.css';

const Chat = () => {
  // States
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deletingMessage, setDeletingMessage] = useState(null);
  const [showContacts, setShowContacts] = useState(false);
  const messagesEndRef = useRef(null);
  const socket = useRef(null);
  const usersMap = useRef({});

  // Helper function to fetch all users recursively
  const fetchAllUsers = useCallback(async (token, page = 1, accumulatedUsers = []) => {
    try {
      const res = await fetch(`http://localhost:4001/users?page=${page}&limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const newUsers = data.users || [];
      const allUsers = [...accumulatedUsers, ...newUsers];

      // If we got less than requested, we've reached the end
      if (newUsers.length < 100) {
        return allUsers;
      }

      // Otherwise, fetch next page
      return fetchAllUsers(token, page + 1, allUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      throw err;
    }
  }, []);

  // Initialize socket
  useEffect(() => {
    socket.current = io('http://localhost:4001', {
      auth: {
        token: localStorage.getItem('token')
      },
      transports: ['websocket']
    });

    socket.current.on('newMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
      scrollToBottom();
    });

    socket.current.on('messageDeleted', ({ messageId }) => {
      setMessages(prev => prev.map(m => 
        m._id === messageId ? { ...m, deleted: true, text: 'Сообщение удалено' } : m
      ));
    });

    socket.current.on('chatDeleted', ({ chatId }) => {
      setChats(prev => prev.filter(c => c._id !== chatId));
      if (currentChat === chatId) {
        setCurrentChat(null);
        setMessages([]);
      }
    });

    return () => {
      socket.current.disconnect();
    };
  }, [currentChat]);

  // Load current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:4001/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = await res.json();
        setCurrentUser(user);
        usersMap.current[user._id] = user;
      } catch (err) {
        console.error('Failed to load user:', err);
        setError('Ошибка загрузки пользователя');
      }
    };

    fetchCurrentUser();
  }, []);

  // Load users and chats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Load ALL users with recursive fetching
        const allUsers = await fetchAllUsers(token);
        const filteredUsers = allUsers.filter(user => user._id !== currentUser?._id);
        
        filteredUsers.forEach(user => {
          usersMap.current[user._id] = user;
        });
        setUsers(filteredUsers);

        // Load chats
        const chatsRes = await fetch('http://localhost:4001/chats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const chatsData = await chatsRes.json();
        
        setChats(chatsData || []);
        
        if (chatsData?.length > 0) {
          loadChat(chatsData[0]._id);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchData();
    }
  }, [currentUser, fetchAllUsers]);

  // Helper functions
  const getDisplayName = (userId) => {
    if (!userId) return 'Unknown';
    const user = usersMap.current[userId];
    return user?.fullName || user?.username || user?.email?.split('@')[0] || `User_${userId.slice(-4)}`;
  };

  const getAvatarUrl = (userId) => {
    const user = usersMap.current[userId];
    return user?.avatar || `https://ui-avatars.com/api/?name=${getDisplayName(userId)}&background=random`;
  };

  const getChatParticipantId = (chat) => {
    if (!chat?.participants?.length) return null;
    return chat.participants.find(p => p !== currentUser?._id) || chat.participants[0];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Chat functions
  const loadChat = async (chatId) => {
    try {
      const token = localStorage.getItem('token');
      setCurrentChat(chatId);
      
      const res = await fetch(`http://localhost:4001/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      setMessages(data || []);
      socket.current.emit('joinChat', chatId);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      setError(err.message);
    }
  };

  const startChat = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4001/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ participantId: userId })
      });
      
      const newChat = await res.json();
      setChats(prev => [...prev, newChat]);
      loadChat(newChat._id);
      setShowContacts(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !currentChat) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4001/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          chatId: currentChat,
          text: message
        })
      });
      
      if (!res.ok) throw new Error('Send failed');
      
      setMessage('');
    } catch (err) {
      console.error('Send error:', err);
      setError(err.message);
    }
  };

  const deleteChat = async (chatId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4001/chats/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Delete failed');
      
      setChats(prev => prev.filter(c => c._id !== chatId));
      if (currentChat === chatId) {
        setCurrentChat(null);
        setMessages([]);
      }
    } catch (err) {
      setError('Не удалось удалить чат');
    } finally {
      setConfirmDelete(null);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      setDeletingMessage(messageId);
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4001/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Delete failed');
      
      setMessages(prev => prev.map(m => 
        m._id === messageId ? { ...m, deleted: true, text: 'Сообщение удалено' } : m
      ));
    } catch (err) {
      setError('Не удалось удалить сообщение');
    } finally {
      setDeletingMessage(null);
    }
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Загрузка чатов...</p>
    </div>
  );

  if (error) return (
    <div className="error-screen">
      <div className="error-icon">!</div>
      <p>{error}</p>
      <button onClick={() => window.location.reload()}>Повторить</button>
    </div>
  );

  return (
    <div className="chat-app">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Сообщения</h2>
          <button 
            className="new-chat-btn"
            onClick={() => setShowUserSearch(!showUserSearch)}
          >
            {showUserSearch ? '×' : '+'}
          </button>
        </div>
        
        <div className="sidebar-tabs">
          <button 
            className={`tab-btn ${!showContacts ? 'active' : ''}`}
            onClick={() => setShowContacts(false)}
          >
            Чаты
          </button>
          <button 
            className={`tab-btn ${showContacts ? 'active' : ''}`}
            onClick={() => setShowContacts(true)}
          >
            Контакты
          </button>
        </div>
  
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
  
        {showContacts ? (
          <div className="contacts-list">
            {users
              .filter(user => 
                getDisplayName(user._id).toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(user => (
                <div 
                  key={user._id} 
                  className="contact-item"
                  onClick={() => startChat(user._id)}
                >
                  <img 
                    src={getAvatarUrl(user._id)} 
                    alt={getDisplayName(user._id)}
                    className="contact-avatar"
                  />
                  <div className="contact-info">
                    <span className="contact-name">{getDisplayName(user._id)}</span>
                    {user.email && <span className="contact-email">{user.email}</span>}
                  </div>
                </div>
              ))
            }
          </div>
        ) : (
          <div className="chats-list">
            {chats.map(chat => {
              const participantId = getChatParticipantId(chat);
              if (!participantId) return null;
              
              return (
                <div 
                  key={chat._id} 
                  className={`chat-item ${currentChat === chat._id ? 'active' : ''}`}
                >
                  <div className="chat-content" onClick={() => loadChat(chat._id)}>
                    <img 
                      src={getAvatarUrl(participantId)} 
                      alt={getDisplayName(participantId)}
                      className="chat-avatar"
                    />
                    <div className="chat-info">
                      <span className="chat-name">{getDisplayName(participantId)}</span>
                      <span className="chat-preview">
                        {chat.lastMessage?.text?.substring(0, 30) || 'Нет сообщений'}
                      </span>
                    </div>
                  </div>
                  <div className="chat-actions">
                    {confirmDelete === chat._id ? (
                      <>
                        <button 
                          className="confirm-btn"
                          onClick={() => deleteChat(chat._id)}
                        >
                          ✓
                        </button>
                        <button 
                          className="cancel-btn"
                          onClick={() => setConfirmDelete(null)}
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <button 
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete(chat._id);
                        }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="chat-window">
        {currentChat ? (
          <>
            <div className="chat-header">
              <div className="header-user">
                <img 
                  src={getAvatarUrl(getChatParticipantId(chats.find(c => c._id === currentChat)))} 
                  alt={getDisplayName(getChatParticipantId(chats.find(c => c._id === currentChat)))}
                  className="header-avatar"
                />
                <div className="header-info">
                  <h3>
                    {getDisplayName(getChatParticipantId(chats.find(c => c._id === currentChat)))}
                  </h3>
                  <span className="status">В сети</span>
                </div>
              </div>
            </div>
            
            <div className="messages-container">
              <div className="messages">
                {messages.map(msg => (
                  <div 
                    key={msg._id} 
                    className={`message ${msg.sender === currentUser?._id ? 'outgoing' : 'incoming'} 
                      ${msg.deleted ? 'deleted' : ''}
                      ${deletingMessage === msg._id ? 'deleting' : ''}`}
                  >
                    {msg.sender !== currentUser?._id && (
                      <img 
                        src={getAvatarUrl(msg.sender)} 
                        alt={getDisplayName(msg.sender)}
                        className="message-avatar"
                      />
                    )}
                    <div className="message-content">
                      {msg.deleted ? (
                        <div className="deleted-text">Сообщение удалено</div>
                      ) : (
                        <>
                          <div className="message-text">{msg.text}</div>
                          {msg.sender === currentUser?._id && (
                            <button 
                              className="delete-message-btn"
                              onClick={() => deleteMessage(msg._id)}
                              disabled={deletingMessage === msg._id}
                            >
                              {deletingMessage === msg._id ? '...' : '×'}
                            </button>
                          )}
                        </>
                      )}
                      <div className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            <form onSubmit={sendMessage} className="message-input-container">
              <div className="input-group">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Введите сообщение..."
                />
                <button type="submit" className="send-btn">
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                  </svg>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="empty-chat">
            <div className="empty-icon">💬</div>
            <h3>Привет! Короче выбери чат</h3>
            <button 
              className="start-chat-btn"
              onClick={() => setShowContacts(true)}
            >
              Начать новый чат
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;