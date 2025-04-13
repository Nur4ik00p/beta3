import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import './Chat.css';

const emojis = ['😀', '😂', '😍', '👍', '❤️', '🔥', '🎉', '🤔', '😎', '🥳'];

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState({ count: 0, users: [] });
  const [userName, setUserName] = useState('');
  const [avatarColor, setAvatarColor] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const socket = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedName = localStorage.getItem('chatUsername');
    const savedColor = localStorage.getItem('avatarColor');
    
    if (savedName && savedColor) {
      setUserName(savedName);
      setAvatarColor(savedColor);
      connectToServer(savedName, savedColor);
    } else {
      setIsModalVisible(true);
    }

    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, []);

  const connectToServer = (name, color) => {
    setConnectionStatus('connecting');
    
    socket.current = io('https://atomglidedev.ru', {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.current.on('connect', () => {
      setConnectionStatus('connected');
      socket.current.emit('registerUser', {
        userId: localStorage.getItem('userId') || Date.now().toString(),
        userName: name
      });
    });

    socket.current.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socket.current.on('connect_error', () => {
      setConnectionStatus('error');
    });

    socket.current.on('onlineUsers', (data) => {
      setOnlineUsers(data);
    });

    socket.current.on('messageHistory', (history) => {
      setMessages(history);
      scrollToBottom();
    });

    socket.current.on('receiveMessage', (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
      scrollToBottom();
    });

    // Загрузка истории сообщений
    axios.get('http://localhost:4001/api/messages')
      .then(response => {
        setMessages(response.data);
        scrollToBottom();
      })
      .catch(err => {
        console.error('Error loading messages:', err);
      });
  };

  const handleUserRegistration = (name, color) => {
    setUserName(name);
    setAvatarColor(color);
    localStorage.setItem('chatUsername', name);
    localStorage.setItem('avatarColor', color);
    localStorage.setItem('userId', Date.now().toString());
    setIsModalVisible(false);
    connectToServer(name, color);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      socket.current.emit('sendMessage', {
        userName,
        text: inputMessage,
        avatarColor,
        isSticker: false
      });
      setInputMessage('');
      setShowEmojiPicker(false);
    }
  };

  const handleSendSticker = (emoji) => {
    socket.current.emit('sendMessage', {
      userName,
      text: emoji,
      avatarColor,
      isSticker: true
    });
    setShowEmojiPicker(false);
  };

  const getStatusColor = () => {
    switch(connectionStatus) {
      case 'connected': return '#52c41a';
      case 'connecting': return '#faad14';
      case 'error': return '#f5222d';
      default: return '#d9d9d9';
    }
  };

  const getStatusText = () => {
    switch(connectionStatus) {
      case 'connected': return 'онлайн';
      case 'connecting': return 'подключение...';
      case 'error': return 'ошибка подключения';
      default: return 'офлайн';
    }
  };

  const UserAvatar = ({ color }) => {
    return (
      <div className="user-avatar" style={{ backgroundColor: color }}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="#fff">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
        </svg>
      </div>
    );
  };

  return (
    <div className="chat-app">
      {/* Модальное окно подключения */}
      {isModalVisible && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Подключение к чату</h3>
            </div>
            <div className="modal-body">
              <div className="connection-form">
                <input
                  type="text"
                  placeholder="Введите ваше имя"
                  onChange={(e) => setUserName(e.target.value)}
                  className="name-input"
                />
                <button 
                  className="connect-button"
                  onClick={() => handleUserRegistration(
                    userName || 'Аноним', 
                    `#${Math.floor(Math.random()*16777215).toString(16)}`
                  )}
                >
                  Подключиться
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Шапка чата */}
      <header className="chat-header">
        <div className="header-content">
          <div className="chat-title">
            <span>Чат сообщества</span>
            <span className="connection-status" style={{ color: getStatusColor() }}>
              {getStatusText()}
            </span>
          </div>
        </div>
      </header>

      {/* Основное содержимое чата */}
      <main className="chat-main">
        <div className="messages-list">
          {messages.map((item, index) => (
            <div key={index} className={`message-item ${item.isSticker ? 'sticker-message' : ''}`}>
              <div className="message-content">
                <UserAvatar color={item.avatarColor} />
                <div className="message-text">
                  <div className="message-meta">
                    <span className="message-user">{item.userName}</span>
                    <span className="message-time">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="message-body">
                    {item.isSticker ? (
                      <span className="sticker">{item.text}</span>
                    ) : (
                      item.text
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Панель смайликов */}
      {showEmojiPicker && (
        <div className="emoji-panel">
          <div className="emoji-grid">
            {emojis.map((emoji, index) => (
              <button 
                key={index}
                type="button"
                onClick={() => handleSendSticker(emoji)}
                className="emoji-button"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Панель ввода сообщения */}
      <footer className="chat-footer">
        <div className="message-input-container">
          <button
            type="button"
            className="emoji-toggle"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            😊
          </button>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Напишите сообщение..."
            className="message-input"
          />
          <button
            type="button"
            className="send-button"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
          >
            Отправить
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Chat;
