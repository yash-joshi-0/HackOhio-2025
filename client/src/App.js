import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './components/login';
import Signup from './components/signup';
import Home from './components/home';
import Ideas from './components/ideas';
import { anonymousUser } from './utils/anonymousUser';

// Import Margarine font
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Margarine&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [crits, setCrits] = useState(5);
  const [shake, setShake] = useState(false);
  const [particles, setParticles] = useState([]);
  const prevCritsRef = useRef(5);

  // Initialize crits on mount
  useEffect(() => {
    if (isLoggedIn && userData) {
      const numericCrits = typeof userData.crits === 'number' ? userData.crits : parseInt(userData.crits, 10) || 0;
      setCrits(numericCrits);
    } else {
      setCrits(anonymousUser.getCrits());
    }
  }, [isLoggedIn, userData]);

  const handleLogin = (status, data) => {
    setIsLoggedIn(status);
    setUserData(data);
    if (status && data) {
      const numericCrits = typeof data.crits === 'number' ? data.crits : parseInt(data.crits, 10) || 0;
      setCrits(numericCrits);
    }
  };

  const updateCrits = (newCrits) => {
    const numericCrits = typeof newCrits === 'number' ? newCrits : parseInt(newCrits, 10);

    // Trigger shake and particles if crits increased
    if (numericCrits > prevCritsRef.current) {
      triggerCritAnimation();
    }

    prevCritsRef.current = numericCrits;
    setCrits(numericCrits);
    if (!isLoggedIn) {
      anonymousUser.setCrits(numericCrits);
    }
  };

  const triggerCritAnimation = () => {
    // Trigger shake
    setShake(true);
    setTimeout(() => setShake(false), 500);

    // Create particles
    const newParticles = Array.from({ length: 10 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1000);
  };

  return (
    <Router>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .shake {
          animation: shake 0.5s;
        }
        .particle {
          position: fixed;
          width: 8px;
          height: 8px;
          background: #ffc107;
          border-radius: 50%;
          pointer-events: none;
          animation: particleFloat 1s ease-out forwards;
          z-index: 9999;
        }
        @keyframes particleFloat {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
          }
        }
      `}</style>
      <div
        className={shake ? 'shake' : ''}
        style={{
          minHeight: '100vh',
          height: '100vh',
          overflow: 'auto',
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
            height: 'clamp(120px, 6vw, 160px)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div className="container-fluid position-relative" style={{ color: 'black' }}>
            {/* Left: Crits */}
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
                {crits}
              </span>
            </div>

            {/* Center: Logo */}
            <Link
              className="navbar-brand fw-bold position-absolute"
              style={{
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'black',
                fontSize: 'clamp(18px, 2vw, 42px)',
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
                <NavigationButtons onLogout={() => handleLogin(false, null)} />
              )}
            </div>
          </div>
        </nav>

        {/* Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: '100px',
              top: '50px',
              '--tx': `${particle.x}px`,
              '--ty': `${particle.y}px`,
            }}
          />
        ))}

        {/* Routes */}
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={(data) => handleLogin(true, data)} />} />
          <Route path="/signup" element={<Signup onLoginSuccess={(data) => handleLogin(true, data)} />} />
          <Route path="/ideas" element={<Ideas isLogin={isLoggedIn} userData={userData} crits={crits} updateCrits={updateCrits} />} />
          <Route path="/" element={<Home isLogin={isLoggedIn} userData={userData} crits={crits} updateCrits={updateCrits} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

// ✅ Fixed NavigationButtons component
const NavigationButtons = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="d-flex align-items-center" style={{ gap: 'clamp(8px, 1vw, 16px)' }}>
      <button
        onClick={handleLogout}
        className="btn btn-outline-dark btn-sm"
        style={{
          borderWidth: '2px',
          color: 'black',
          fontSize: 'clamp(16px, 1vw, 20px)',
          padding: 'clamp(8px, 0.6vw, 12px) clamp(16px, 1vw, 20px)',
        }}
      >
        Sign out
      </button>
      <Link to="/ideas">
        <img
          src="https://cdn-icons-png.flaticon.com/512/1016/1016562.png "
          alt="Points"
          style={{
            width: 'clamp(36px, 2.4vw, 48px)',
            height: 'auto',
            marginRight: '0.8vw',
          }}
        />
      </Link>
    </div>
  );
};

export default App;