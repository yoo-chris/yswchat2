import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // jwt-decode 패키지에서 디코딩 함수 import
import './App.css';

import DefaultPage from './components/DefaultPage';
import SignInPage from './components/SignInPage';
import SignUpPage from './components/SignUpPage';
import MainChatPage from './components/MainChatPage'; // 새로운 메인 페이지 추가
import AdminPage from './components/AdminPage';
import TokenExpiration from './components/TokenExpiration';

const getTokenExpiration = (token) => {
  const decodedToken = jwtDecode(token);
  const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const remainingTime = expirationTime - currentTime;
  const remainingMinutes = Math.floor(remainingTime / 1000 / 60); // Convert milliseconds to minutes
  const remainingSeconds = Math.floor((remainingTime / 1000) % 60); // Get remaining seconds
  return { minutes: remainingMinutes, seconds: remainingSeconds };
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState(''); // 추가: 사용자 역할
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchUserEmail = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const remainingTime = getTokenExpiration(token);
        setToken(token);

        try {
          const response = await axios.get('http://localhost:5012/protected', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setUsername(response.data.logged_in_as.username);
          setUserRole(response.data.logged_in_as.role); // 사용자 역할 설정
          setIsAuthenticated(true);
        } catch (error) { 
          console.error('Error', error);
        }
      } else {
        console.log('no token');
      }
    };
    fetchUserEmail();
  }, [isAuthenticated]);

  const ProtectedRoute = ({ children }) => {
    useEffect(() => {
      if (!isAuthenticated) {
        alert("로그인이 필요합니다.");
      }
    }, [isAuthenticated]);

    return isAuthenticated ? children : <Navigate to="/signin" />;
  };

  return (
    <Router>
      <div className="container">
        <div className="header">
          <Link to="/" className="daemonset-logo">YSWchat</Link>
        </div>
        {isAuthenticated && (
          <div className="user-info-wrapper">
            <div className="user-info">
              <p className='name'>안녕하세요, {username} 님</p>
            </div>
            <div className='token-expiration'>
              {token && <TokenExpiration token={token} />}
            </div>
          </div>
        )}
        <Routes>
          <Route path="/" element={<DefaultPage isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} userRole={userRole}/>} />
          <Route
            path="/signin"
            element={isAuthenticated ? <Navigate to="/" /> : <SignInPage setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route path="/signup" element={<SignUpPage />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <MainChatPage username={username} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                {userRole === 'admin' ? <AdminPage /> : <Navigate to="/" />}
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
