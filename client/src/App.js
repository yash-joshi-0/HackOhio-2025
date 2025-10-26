import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './components/login';
import Signup from './components/signup';
import Home from './components/home';
import Ideas from './components/ideas';

// Import Margarine font
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Margarine&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleLogin = (status, data) => {
    setIsLoggedIn(status);
    setUserData(data);
  };

  return (
    <Router>
      <div
        style={{
          minHeight: '100vh',
          backgroundImage:
            "url('https://cdn.architextures.org/textures/23/2/oak-veneermdf-none-rz7xim-1200.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          color: 'black',
          fontFamily: "'Margarine', cursive",
        }}
      >
        {/* Navbar */}
        <nav
          className="navbar navbar-expand-lg mb-4"
          style={{
            background: 'transparent',
            boxShadow: 'none',
            color: 'black',
            height: 'clamp(120px, 6vw, 160px)', // larger minimum
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div className="container-fluid position-relative" style={{ color: 'black' }}>
            {/* Left: Points */}
            <div
              className="d-flex align-items-center"
              style={{
                width: 'clamp(120px, 12vw, 200px)',
                color: 'black',
              }}
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/14521/14521298.png"
                alt="Points"
                style={{
                  width: 'clamp(36px, 2.4vw, 48px)',
                  height: 'auto',
                  marginRight: '0.8vw',
                }}
              />
              <span
                className="fw-bold"
                style={{
                  color: 'black',
                  fontSize: 'clamp(18px, 1.4vw, 24px)',
                }}
              >
                12
              </span>
            </div>

            {/* Center: Logo */}
            <Link
              className="navbar-brand fw-bold position-absolute"
              style={{
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'black',
                fontSize: 'clamp(28px, 2vw, 42px)',
                textDecoration: 'none',
                letterSpacing: '0.05em',
              }}
              to="/"
            >
              PROTOTHOUGHTS
            </Link>

            {/* Right: Auth/Profile */}
            <div
              className="d-flex align-items-center"
              style={{
                width: 'clamp(180px, 16vw, 260px)',
                justifyContent: 'flex-end',
                gap: 'clamp(8px, 1vw, 16px)',
                color: 'black',
              }}
            >
              {!isLoggedIn ? (
                <>
                  <Link
                    to="/login"
                    className="btn btn-outline-dark btn-sm"
                    style={{
                      borderWidth: '2px',
                      color: 'black',
                      fontSize: 'clamp(16px, 1vw, 20px)',
                      padding: 'clamp(8px, 0.6vw, 12px) clamp(16px, 1vw, 20px)',
                    }}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="btn btn-dark btn-sm"
                    style={{
                      backgroundColor: 'black',
                      border: 'none',
                      color: 'white',
                      fontSize: 'clamp(16px, 1vw, 20px)',
                      padding: 'clamp(8px, 0.6vw, 12px) clamp(16px, 1vw, 20px)',
                    }}
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <Link to="/ideas">
                  <img
                    src="https://via.placeholder.com/40"
                    alt="Profile"
                    className="rounded-circle"
                    style={{
                      width: 'clamp(48px, 3vw, 64px)',
                      height: 'auto',
                    }}
                  />
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* Routes */}
        <div style={{ padding: '0 2rem' }}>
          <Routes>
            <Route path="/login" element={<Login onLoginSuccess={(data) => handleLogin(true, data)} />} />
            <Route path="/signup" element={<Signup onLoginSuccess={(data) => handleLogin(true, data)} />} />
            <Route path="/account" element={<Signup onLoginSuccess={(data) => handleLogin(true, data)} />} />
            <Route path="/ideas" element={<Ideas isLogin={isLoggedIn} userData={userData} />} />
            <Route path="/" element={<Home isLogin={isLoggedIn} userData={userData} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;