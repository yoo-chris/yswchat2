import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './MainChatPage.css'; // CSS 스타일링을 위한 파일

const socket = io('http://localhost:5000'); // Flask 서버 주소

const MainChatPage = ({ username }) => {
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState([]);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    // 이전 채팅 메시지 로드
    const fetchChats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/get_chats');
        setChats(response.data);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };

    fetchChats();

    // 소켓 메시지 수신
    socket.on('message', data => {
      setChats(prevChats => [...prevChats, data]);
    });

    // 컴포넌트 언마운트 시 소켓 이벤트 제거
    return () => {
      socket.off('message');
    };
  }, []);

  useEffect(() => {
    // 스크롤을 채팅 창의 맨 아래로 이동
    chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
  }, [chats]);

  const handleSendMessage = () => {
    if (username && message) {
      socket.emit('message', { username, msg: message });
      setMessage('');
    } else {
      alert('Username is required');
    }
  };

  return (
    <div className="chat-page">
      <div id="chat-window" ref={chatWindowRef}>
        {chats.map((chat, index) => (
          <div
            key={index}
            className={`message ${chat.username === username ? 'self' : ''}`}
          >
            {`${chat.username}: ${chat.msg}`}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          id="message"
          placeholder="Message"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default MainChatPage;
