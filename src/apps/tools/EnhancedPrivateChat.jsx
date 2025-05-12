import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from '../../axios'; // Assuming axios is configured centrally
import io from 'socket.io-client';
import { Avatar, CircularProgress, TextField, Button, Typography, Paper, List, ListItem, ListItemAvatar, ListItemText, Divider, IconButton } from '@mui/material';
import { Send as SendIcon, Forum as ForumIcon, PersonSearch as PersonSearchIcon, Message as MessageIcon } from '@mui/icons-material';
import { selectUser } from '../../redux/slices/getme'; // Path to user selector
import { fetchUser } from '../../redux/slices/getme'; // Action to fetch user
import '../../style/chat/EnhancedPrivateChat.scss'; // Import the SCSS styles

const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_URL || "http://demo.soon-night.lol";

const EnhancedPrivateChat = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null); // Stores the whole conversation object
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // For searching users to start new chat
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!currentUser) {
      dispatch(fetchUser());
    }
  }, [currentUser, dispatch]);

  const fetchConversations = useCallback(async () => {
    if (!currentUser?._id) return;
    setLoadingConversations(true);
    try {
      // This endpoint needs to be created on the backend
      const { data } = await axios.get('/private-messages/conversations'); 
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoadingConversations(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (currentUser?._id) {
      socketRef.current = io(SOCKET_SERVER_URL, {
        query: { userId: currentUser._id },
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to socket server for enhanced chat:', socketRef.current.id);
      });

      socketRef.current.on('receive_private_message', (message) => {
        // If it's for the active conversation, add to messages
        if (activeConversation && (message.sender._id === activeConversation.partner._id || message.receiver._id === activeConversation.partner._id)) {
          setMessages(prev => [...prev, message]);
        }
        // Update conversations list (e.g., new message preview, move to top)
        fetchConversations(); // Re-fetch or update more intelligently
      });
      
      socketRef.current.on('new_conversation', (conversation) => {
        setConversations(prev => [conversation, ...prev.filter(c => c._id !== conversation._id)]);
        // Optionally, make the new conversation active
        // setActiveConversation(conversation);
      });

      socketRef.current.on('private_message_error', (error) => {
        console.error('Socket private message error:', error.message);
        // TODO: Display error to user
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [currentUser, activeConversation, fetchConversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSelectConversation = async (conversation) => {
    setActiveConversation(conversation);
    setMessages([]); // Clear previous messages
    if (!conversation?.partner?._id || !currentUser?._id) return;
    setLoadingMessages(true);
    try {
      // Endpoint to get messages between currentUser and conversation.partner._id
      const { data } = await axios.get(`/private-messages/${conversation.partner._id}`);
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages for conversation:', error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentUser?._id || !activeConversation?.partner?._id || !socketRef.current) return;

    const messageData = {
      senderId: currentUser._id,
      receiverId: activeConversation.partner._id,
      content: newMessage.trim(),
    };

    socketRef.current.emit('send_private_message', messageData);
    // Optimistic update or wait for echo
    // setMessages(prev => [...prev, { ...messageData, sender: currentUser, createdAt: new Date().toISOString() }]);
    setNewMessage('');
  };
  
  const handleSearchUsers = async () => {
    if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
    }
    setIsSearching(true);
    try {
        // Backend endpoint for user search by fullName or email
        const { data } = await axios.get(`/users/search-chat-users?term=${searchTerm}`);
        setSearchResults(data.filter(user => user._id !== currentUser?._id) || []);
    } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
    } finally {
        setIsSearching(false);
    }
  };
  
  const handleStartNewConversation = async (partner) => {
    if (!currentUser?._id || !partner?._id) return;

    // Check if conversation already exists
    const existingConversation = conversations.find(c => c.partner._id === partner._id);
    if (existingConversation) {
        handleSelectConversation(existingConversation);
        setSearchTerm('');
        setSearchResults([]);
        return;
    }

    try {
        // Optional: Backend endpoint to create/get conversation if not existing
        // For now, we assume selecting a user and sending a message will create it via socket
        // Or, we can have a dedicated API to ensure conversation exists before navigating
        const newConvPlaceholder = {
            _id: `temp_${partner._id}`, // Temporary ID
            partner: partner,
            lastMessage: { content: "Начните диалог...", createdAt: new Date().toISOString() },
            unreadCount: 0
        };
        // setActiveConversation(newConvPlaceholder);
        // setConversations(prev => [newConvPlaceholder, ...prev]);
        // For a cleaner approach, the backend should confirm conversation creation
        // and then we select it.
        // For now, let's just set it as active and let the first message create it.
        setActiveConversation(newConvPlaceholder); 
        setMessages([]);
        setSearchTerm('');
        setSearchResults([]);
        // The actual conversation will be solidified on the backend when the first message is sent
        // or fetched if it already exists.
    } catch (error) {
        console.error("Error starting new conversation:", error);
    }
  };

  if (!currentUser) {
    return (
      <div className="enhanced-private-chat-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
        <Typography sx={{ml: 2}}>Загрузка информации о пользователе...</Typography>
      </div>
    );
  }

  return (
    <Paper elevation={3} className="enhanced-private-chat-page">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <Typography variant="h6">Чаты</Typography>
          <TextField 
            fullWidth 
            variant="outlined" 
            size="small" 
            placeholder="Поиск или новый чат..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchUsers()}
            InputProps={{
                endAdornment: <IconButton onClick={handleSearchUsers} size="small"><PersonSearchIcon /></IconButton>
            }}
            sx={{mt: 1}}
          />
        </div>
        {isSearching && <CircularProgress size={24} sx={{alignSelf: 'center', my:1}}/>}
        {searchResults.length > 0 && (
            <List dense className="search-results-list">
                <Typography variant="subtitle2" sx={{p:1}}>Начать новый чат:</Typography>
                {searchResults.map(user => (
                    <ListItem button key={user._id} onClick={() => handleStartNewConversation(user)}>
                        <ListItemAvatar>
                            <Avatar src={user.avatarUrl ? `http://localhost:4001${user.avatarUrl}` : undefined} alt={user.fullName} />
                        </ListItemAvatar>
                        <ListItemText primary={user.fullName} secondary={user.email} />
                    </ListItem>
                ))}
                <Divider/>
            </List>
        )}
        <List dense className="conversations-list">
          {loadingConversations ? (
            <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />
          ) : conversations.length > 0 ? (
            conversations.map((conv) => (
              <ListItem
                button
                key={conv._id}
                className={`conversation-item ${activeConversation?.partner?._id === conv.partner?._id ? 'active' : ''}`}
                onClick={() => handleSelectConversation(conv)}
              >
                <ListItemAvatar className="avatar-container">
                  <Avatar src={conv.partner.avatarUrl ? `http://localhost:4001${conv.partner.avatarUrl}` : undefined} alt={conv.partner.fullName} />
                </ListItemAvatar>
                <ListItemText 
                  primary={<Typography variant="subtitle1" className="conversation-name">{conv.partner.fullName}</Typography>}
                  secondary={<Typography variant="body2" className="last-message" noWrap>{conv.lastMessage?.content || 'Нет сообщений'}</Typography>}
                />
                {/* <Typography variant="caption" className="conversation-timestamp">
                  {conv.lastMessage?.createdAt ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                </Typography> */}
              </ListItem>
            ))
          ) : (
            !isSearching && searchResults.length === 0 && <Typography className="no-conversations">Нет активных переписок.</Typography>
          )}
        </List>
      </div>

      <div className="chat-main-window">
        {activeConversation ? (
          <>
            <div className="chat-header">
              <Avatar src={activeConversation.partner.avatarUrl ? `http://localhost:4001${activeConversation.partner.avatarUrl}` : undefined} sx={{mr: 1.5}} />
              <Typography variant="h6">{activeConversation.partner.fullName}</Typography>
              {/* Add status or other actions here */}
            </div>
            <div className="messages-area">
              {loadingMessages ? (
                <CircularProgress sx={{ display: 'block', margin: 'auto' }} />
              ) : messages.length > 0 ? (
                messages.map((msg, index) => (
                  <div 
                    key={msg._id || `msg-${index}`}
                    className={`message-item ${msg.sender._id === currentUser._id ? 'sent' : 'received'}`}
                  >
                    {msg.sender._id !== currentUser._id && (
                        <Avatar className="message-avatar" src={msg.sender.avatarUrl ? `http://localhost:4001${msg.sender.avatarUrl}` : undefined} sx={{width: 32, height: 32}}/>
                    )}
                    <div className="message-content-wrapper">
                        {msg.sender._id !== currentUser._id && <Typography variant="caption" className="message-sender-name">{msg.sender.fullName}</Typography>}
                        <Paper elevation={1} className="message-bubble">
                            {msg.content}
                        </Paper>
                        <Typography variant="caption" className="message-timestamp">
                            {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </Typography>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-messages-prompt">
                    <MessageIcon className="prompt-icon"/>
                    <Typography>Сообщений пока нет. Начните диалог!</Typography>
                </div>
              )}
              <div ref={messagesEndRef} /> {/* For auto-scrolling */}
            </div>
            <div className="message-input-area">
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Напишите сообщение..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSendMessage} 
                disabled={!newMessage.trim()}
                sx={{ml:1}}
                endIcon={<SendIcon />}
              >
                Отправить
              </Button>
            </div>
          </>
        ) : (
          <div className="select-chat-prompt">
            <ForumIcon className="prompt-icon" />
            <Typography variant="h6">Выберите чат или найдите собеседника</Typography>
            <Typography>Чтобы начать общение.</Typography>
          </div>
        )}
      </div>
    </Paper>
  );
};

export default EnhancedPrivateChat;

