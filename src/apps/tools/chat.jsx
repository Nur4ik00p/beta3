import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Input, Button, List, Avatar, Badge, Modal, Row, Col, Divider } from 'antd';
import { SendOutlined, UserOutlined, SmileOutlined, WifiOutlined } from '@ant-design/icons';
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

  return (
    <div className="chat-app">
      {/* Модальное окно подключения */}
      <Modal
        title="Подключение к чату"
        visible={isModalVisible}
        closable={false}
        footer={null}
      >
        <div className="connection-form">
          <Input
            placeholder="Введите ваше имя"
            onChange={(e) => setUserName(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <Button 
            type="primary" 
            onClick={() => handleUserRegistration(
              userName || 'Аноним', 
              `#${Math.floor(Math.random()*16777215).toString(16)}`
            )}
          >
            Подключиться
          </Button>
        </div>
      </Modal>

      {/* Шапка чата */}
      <header className="chat-header">
        <div className="header-content">
          <div className="chat-title">
            <span>Чат сообщества</span>
            <Badge 
              color={getStatusColor()} 
              text={connectionStatus === 'connected' ? 'онлайн' : 'офлайн'}
              style={{ marginLeft: 10 }}
            />
          </div>
      
        </div>
      </header>

      {/* Основное содержимое чата */}
      <main className="chat-main">
        <List
          dataSource={messages}
          renderItem={(item) => (
            <List.Item className={`message-item ${item.isSticker ? 'sticker-message' : ''}`}>
              <div className="message-content">
                <Avatar 
                  style={{ backgroundColor: item.avatarColor }} 
                  icon={<UserOutlined />}
                />
                <div className="message-text">
                  <div className="message-meta">
                    <span className="message-user">{item.user}</span>
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
            </List.Item>
          )}
        />
        <div ref={messagesEndRef} />
      </main>

      {/* Панель смайликов */}
      {showEmojiPicker && (
        <div className="emoji-panel">
          <Row gutter={[8, 8]}>
            {emojis.map((emoji, index) => (
              <Col span={4} key={index}>
                <Button 
                  type="text" 
                  onClick={() => handleSendSticker(emoji)}
                  className="emoji-button"
                >
                  {emoji}
                </Button>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Панель ввода сообщения */}
      <footer className="chat-footer">
        <div className="message-input-container">
          <Button
            type="text"
            icon={<SmileOutlined />}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="emoji-toggle"
          />
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onPressEnter={handleSendMessage}
            placeholder="Напишите сообщение..."
            className="message-input"
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="send-button"
          />
        </div>
      </footer>
    </div>
  );
};

export default Chat;
