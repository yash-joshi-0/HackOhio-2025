import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { anonymousUser } from '../utils/anonymousUser';

const Login = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            setMessage(data.message);
            if (response.ok) {
                const anonymousData = anonymousUser.getAllData();
                if (anonymousData.votes.length > 0 || anonymousData.crits > 5) {
                    try {
                        const mergeResponse = await fetch('/api/mergeanonymousdata', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: data.user.id,
                                anonymousVotes: anonymousData.votes,
                                anonymousCrits: anonymousData.crits - 5,
                            }),
                        });

                        if (mergeResponse.ok) {
                            const mergeData = await mergeResponse.json();
                            data.user.crits = mergeData.newCrits;
                            anonymousUser.clear();
                        }
                    } catch (mergeError) {
                        console.error('Error merging anonymous data:', mergeError);
                    }
                }
                onLoginSuccess(data.user);
            }
        } catch (error) {
            console.error('Login error:', error);
            setMessage('An error occurred. Please try again.');
        }
    };

    return (
        <div className="position-relative" style={{ minHeight: '100vh' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Margarine&display=swap');

                body {
                    background: url('https://cdn.architextures.org/textures/23/2/oak-veneermdf-none-rz7xim-1200.jpg') center/cover no-repeat;
                    font-family: 'Margarine', sans-serif;
                }

                .slide-alert {
                    position: absolute;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%) scaleY(0);
                    min-width: 300px;
                    z-index: 1050;
                    transition: transform 0.4s cubic-bezier(.4,0,.2,1);
                }

                .slide-alert.show {
                    transform: translateX(-50%) scaleY(1);
                }

                .sticker-card {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
                    border: 2px solid #cc0000;
                    max-width: 600px;
                    width: 100%;
                }

                .sticker-header {
                    background: #cc0000;
                    color: white;
                    text-align: center;
                    font-size: 3rem;
                    padding: 20px 0;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    font-weight: bold;
                }

                .sticker-subheader {
                    text-align: center;
                    font-size: 1.2rem;
                    color: #333;
                    margin-top: -10px;
                    margin-bottom: 20px;
                    font-weight: 600;
                }

                .sticker-body {
                    padding: 2rem 3rem;
                    background: white;
                    text-align: center;
                }

                .sticker-input {
                    font-size: 1.5rem;
                    text-align: center;
                    border: none;
                    border-bottom: 3px solid #cc0000;
                    border-radius: 0;
                    outline: none;
                    width: 100%;
                    margin-bottom: 1.5rem;
                    background: transparent;
                }

                .sticker-input:focus {
                    border-color: #ff4d4d;
                }

                .btn-sticker {
                    background: #cc0000;
                    color: white;
                    font-size: 1.5rem;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    transition: transform 0.2s ease;
                }

                .btn-sticker:hover {
                    transform: scale(1.05);
                    background: #ff4d4d;
                }

                .text-muted {
                    color: #333 !important;
                }
            `}</style>

            <div
                className={`slide-alert alert ${
                    message
                        ? message === 'Login successful!'
                            ? 'alert-success'
                            : 'alert-danger'
                        : ''
                } text-center${message ? ' show' : ''}`}
                role="alert"
            >
                {message}
            </div>

            <div className="container d-flex justify-content-center align-items-center min-vh-100">
                <div className="sticker-card">
                    <div className="sticker-header">HELLO</div>
                    <div className="sticker-subheader">my name is</div>
                    <div className="sticker-body">
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                className="sticker-input"
                                id="username"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                className="sticker-input"
                                id="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn-sticker w-100 mt-3">Sign in</button>
                            <div className="text-center mt-3">
                                <p className="text-muted mb-0">
                                    No account?{' '}
                                    <Link to="/signup" className="text-decoration-none" style={{ color: '#cc0000' }}>
                                        Sign up
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;