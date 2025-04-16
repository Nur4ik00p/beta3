import React, { useEffect, useState } from "react";
import axios from "axios";
import "./private-chat.css"; // стили подключим отдельно

const PrivateChat = () => {
  const [receiverEmail, setReceiverEmail] = useState("");
  const [receiver, setReceiver] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Получение текущего пользователя
    axios.get("/api/me").then((res) => setCurrentUser(res.data));
  }, []);

  const searchUser = async () => {
    const res = await axios.get(`/api/users/search?email=${receiverEmail}`);
    if (res.data.length > 0) setReceiver(res.data[0]);
  };

  const loadMessages = async () => {
    if (!receiver || !currentUser) return;
    const res = await axios.get(`/api/messages/${currentUser._id}/${receiver._id}`);
    setMessages(res.data);
  };

  const sendMessage = async () => {
    if (!content.trim()) return;
    await axios.post("/api/messages", {
      senderId: currentUser._id,
      receiverId: receiver._id,
      content,
    });
    setContent("");
    loadMessages();
  };

  useEffect(() => {
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [receiver, currentUser]);

  return (
    <div className="private-chat-container">
      <h2>Личный чат</h2>
      {!receiver ? (
        <div className="search-box">
          <input
            type="text"
            placeholder="Введите email"
            value={receiverEmail}
            onChange={(e) => setReceiverEmail(e.target.value)}
          />
          <button onClick={searchUser}>Найти</button>
        </div>
      ) : (
        <div className="chat-box">
          <h4>Чат с {receiver.email}</h4>
          <div className="messages">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`message ${
                  msg.senderId === currentUser._id ? "sent" : "received"
                }`}
              >
                {msg.content}
              </div>
            ))}
          </div>
          <div className="input-area">
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Сообщение..."
            />
            <button onClick={sendMessage}>Отправить</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivateChat;