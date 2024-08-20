import React, { useState } from 'react';
import axios from 'axios';
import './AdminPage.css'; // 스타일 파일을 추가할 수 있습니다.

const AdminPage = () => {
    const [username, setUsername] = useState('');
    const [chats, setChats] = useState([]);
    const [error, setError] = useState('');

    const handleSearch = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.get(`http://211.183.3.100:5000/api/get_user_chats/${username}`);
            setChats(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching user chats:', error);
            setError('Failed to fetch chat history.');
        }
    };

    return (
        <div className="admin-page">
            <h1>Search User Chat History</h1>
            <form onSubmit={handleSearch}>
                <label htmlFor="username">Username:</label>
                <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                <button type="submit">Search</button>
            </form>
            {error && <p className="error">{error}</p>}
            <div id="chatHistory">
                {chats.length > 0 ? (
                    chats.map((chat, index) => (
                        <div
                            key={index}
                            className={`chat-message ${chat.is_offensive === 'clean' ? 'clean' : 'offensive'}`}
                        >
                            <p className='chat-name'><strong>{chat.username}</strong>: {chat.msg} ({chat.timestamp})</p>
                            <p className='chat-label'>Label: {chat.is_offensive}</p>
                            <p className='chat-score'>Score: {chat.offensive_score.toFixed(2)}%</p>
                        </div>
                    ))
                ) : (
                    <p className='chat-font'>No chat history available for this user.</p>
                )}
            </div>
        </div>
    );
};

export default AdminPage;
