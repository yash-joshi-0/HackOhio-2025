import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './components/login';
import Signup from './components/signup';
import Home from './components/home';
import Ideas from './components/ideas';
import { anonymousUser } from './utils/anonymousUser';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [crits, setCrits] = useState(5);

  // Initialize crits on mount
  useEffect(() => {
    if (isLoggedIn && userData) {
      setCrits(userData.crits || 0);
    } else {
      setCrits(anonymousUser.getCrits());
    }
  }, [isLoggedIn, userData]);

  const handleLogin = (status, data) => {
    setIsLoggedIn(status);
    setUserData(data);
    if (status && data) {
      setCrits(data.crits || 0);
    }
  };

  const updateCrits = (newCrits) => {
    setCrits(newCrits);
    if (!isLoggedIn) {
      anonymousUser.setCrits(newCrits);
    }
  };
  return (
    <Router>
      <div>
        <nav className="navbar navbar-expand-lg shadow-sm mb-4">
          <div className="container-fluid position-relative">
            <div className="d-flex align-items-center" style={{width: '100px'}}>
              <i className="fas fa-bolt text-warning mr-2" style={{fontSize: '20px'}}></i>
              <span className="font-weight-bold" style={{fontSize: '18px'}}>{crits}</span>
            </div>
            <Link className="navbar-brand font-weight-bold position-absolute" style={{left: '50%', transform: 'translateX(-50%)'}} to="/">PROTOTHOUGHTS</Link>
            <div className="d-flex align-items-center" style={{width: '200px', justifyContent: 'flex-end', gap: '8px'}}>
              {!isLoggedIn ? (
                <>
                  <Link to="/login" className="btn btn-outline-dark btn-sm">Sign in</Link>
                  <Link to="/signup" className="btn btn-dark btn-sm">Sign up</Link>
                </>
              ) : (
                <>
                  <NavigationButtons onLogout={() => handleLogin(false, null)} />
                </>
              )}
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={(data) => handleLogin(true, data)} />} />
          <Route path="/signup" element={<Signup onLoginSuccess={(data) => handleLogin(true, data)} />} />
          <Route path="/account" element={<Signup onLoginSuccess={(data) => handleLogin(true, data)} />} />
          <Route path="/ideas" element={<Ideas isLogin={isLoggedIn} userData={userData} crits={crits} updateCrits={updateCrits} />} />
          <Route path="/" element={<Home isLogin={isLoggedIn} userData={userData} crits={crits} updateCrits={updateCrits} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

// Navigation buttons component to use useNavigate hook
const NavigationButtons = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <>
      <button onClick={handleLogout} className="btn btn-outline-dark btn-sm">Sign out</button>
      <Link to='/ideas'>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: '#ffc107',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}>
          💡
        </div>
      </Link>
    </>
  );
};

export default App;