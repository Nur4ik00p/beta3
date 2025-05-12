import React, { useEffect, useState, useRef } from "react";
import axios from "../../axios"; // Assuming axios is configured centrally
import io from "socket.io-client";
import "./private-chat.css"; // Ensure styles are appropriate

const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_URL || "http://demo.soon-night.lol"; // Backend URL

const PrivateChat = () => {
  const [receiverEmail, setReceiverEmail] = useState("");
  const [receiver, setReceiver] = useState(null); // The user object of the receiver
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch current user details
    axios.get("/auth/me") // Corrected from /api/me to /auth/me based on backend structure
      .then((res) => {
        setCurrentUser(res.data);
      })
      .catch(err => {
        console.error("Error fetching current user, using mock user for testing:", err);
        // Fallback to a mock user for testing if API fails or for development
        setCurrentUser({
          _id: "mockUserId123", // Ensure this ID is unique or identifiable as mock
          fullName: "Mock User",
          email: "mock@example.com",
        });
      });
  }, []);

  useEffect(() => {
    if (currentUser && currentUser._id) {
      // Connect to Socket.IO server
      socketRef.current = io(SOCKET_SERVER_URL, {
        query: { userId: currentUser._id },
      });

      socketRef.current.on("connect", () => {
        console.log("Connected to socket server with ID:", socketRef.current.id);
      });

      socketRef.current.on("receive_private_message", (newMessage) => {
        // Check if the message belongs to the current chat window
        if (receiver && (newMessage.sender._id === receiver._id || newMessage.receiver._id === receiver._id)) {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        } else if (!receiver && newMessage.sender._id !== currentUser._id) {
            // Potentially handle notification for message from a new user if no chat is active
            console.log("Received a new message from someone not in active chat:", newMessage);
        }
      });

      socketRef.current.on("private_message_error", (error) => {
        console.error("Private message error:", error.message);
        // TODO: Display error to user
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [currentUser, receiver]); // Add receiver to dependencies to re-evaluate if it changes

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const searchUser = async () => {
    if (!receiverEmail.trim()) return;
    try {
      alert("User search functionality needs to be connected to a backend endpoint. For now, please ensure receiver is set manually or via a user list.");
    } catch (error) {
      console.error("Error searching user:", error);
      alert("Failed to search user.");
    }
  };

  // Load message history when a receiver is selected
  useEffect(() => {
    const loadMessageHistory = async () => {
      if (receiver && currentUser && currentUser._id) {
        try {
          const response = await axios.get(`/private-messages/${receiver._id}`);
          setMessages(response.data);
        } catch (error) {
          console.error("Error fetching message history:", error);
          setMessages([]); // Clear messages on error or if history is empty
        }
      }
    };
    loadMessageHistory();
  }, [receiver, currentUser]);

  const handleSendMessage = () => {
    if (!content.trim() || !currentUser || !receiver || !socketRef.current) return;

    const messageData = {
      senderId: currentUser._id,
      receiverId: receiver._id,
      content: content.trim(),
    };

    socketRef.current.emit("send_private_message", messageData);
    setContent("");
  };

  if (!currentUser) {
    return <div>Loading user information...</div>;
  }

  const handleSetReceiver = (user) => {
    setReceiver(user);
    setMessages([]); // Clear previous messages
  }

  const availableUsers = [
    // Example: { _id: "someUserId1", fullName: "Alice", email: "alice@example.com" },
    // { _id: "someUserId2", fullName: "Bob", email: "bob@example.com" }
  ];

  return (
    <div className="private-chat-container">
      <h2>Личный чат</h2>
      <div className="chat-layout">
        <div className="user-list-panel">
            <h4>Пользователи</h4>
            <input 
                type="text"
                placeholder="Поиск по email (заглушка)"
                value={receiverEmail}
                onChange={(e) => setReceiverEmail(e.target.value)}
            />
            <button onClick={searchUser} style={{marginBottom: "10px"}}>Найти (заглушка)</button>
            
            {availableUsers.length > 0 ? (
                availableUsers.map(user => (
                    currentUser._id !== user._id && (
                        <div key={user._id} onClick={() => handleSetReceiver(user)} className="user-list-item">
                            {user.fullName || user.email}
                        </div>
                    )
                ))
            ) : (
                <p>Нет доступных пользователей для чата (загрузите список).</p>
            )}
            {!receiver && (
                <button onClick={() => handleSetReceiver({_id: "60d0fe4f5311236168a109cb", fullName: "Test User Receiver", email: "receiver@example.com"}) }>
                    Чат с Test User Receiver (заглушка)
                </button>
            )}
        </div>

        <div className="chat-window-panel">
          {receiver ? (
            <div className="chat-box">
              <h4>Чат с {receiver.fullName || receiver.email}</h4>
              <div className="messages">
                {messages.map((msg, index) => (
                  <div
                    key={msg._id || index} 
                    className={`message ${
                      msg.sender._id === currentUser._id ? "sent" : "received"
                    }`}
                  >
                    <div className="message-sender">{msg.sender.fullName || msg.sender.email}</div>
                    <div className="message-content">{msg.content}</div>
                    <div className="message-timestamp">{new Date(msg.timestamp || msg.createdAt).toLocaleTimeString()}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="input-area">
                <input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Сообщение..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage}>Отправить</button>
              </div>
            </div>
          ) : (
            <p>Выберите пользователя для начала чата.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivateChat;

