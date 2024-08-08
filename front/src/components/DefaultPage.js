import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './DefaultPage.css';

const AuthButton = ({ onClick }) => {
    return (
        <button onClick={onClick}>Sign Out</button>
    );
};

const DefaultPage = ({ isAuthenticated, setIsAuthenticated, userRole }) => {
    const navigate = useNavigate();

    const handleSignOut = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        navigate('/signin');
    };

    console.log('User Role:', userRole); // userRole 값 확인


    return (
        <div className="default-page">
            <div className='content'>
                <h1>Welcome to YSWchat</h1>
                {isAuthenticated ? (
                    <>
                        <AuthButton onClick={handleSignOut} />
                        <Link to="/chat" className='btn btn-chat'>Go to Chat</Link>
                        {userRole === 'admin' && (
                            <Link to="/admin" className='btn btn-admin'>Go to Admin Page</Link>
                        )}
                    </>
                ) : (
                    <Link to="/signin" className='btn btn-login'>로그인</Link>
                )}
            </div>
        </div>
    );
};

export default DefaultPage;
