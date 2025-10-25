import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './components/login';
import Signup from './components/signup';
import Home from './components/home';
import Ideas from './components/ideas';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleLogin = (status, data) => {
    setIsLoggedIn(status);
    setUserData(data);
  };
  return (
    <Router>
      <div>
        <nav className="navbar navbar-expand-lg shadow-sm mb-4">
          <div className="container-fluid position-relative">
            <div className="d-flex align-items-center" style={{width: '100px'}}>
              <i className="fas fa-bolt text-warning mr-2"></i>
              <span className="font-weight-bold">12</span>
            </div>
            <Link className="navbar-brand font-weight-bold position-absolute" style={{left: '50%', transform: 'translateX(-50%)'}} to="/">PROTOTHOUGHTS</Link>
            <div className="d-flex align-items-center" style={{width: '200px', justifyContent: 'flex-end', gap: '8px'}}>
              {!isLoggedIn ? (
                <>
                  <Link to="/login" className="btn btn-outline-dark btn-sm">Sign in</Link>
                  <Link to="/signup" className="btn btn-dark btn-sm">Sign up</Link>
                </>
              ) : (
                <Link to='/ideas'>
                  <img src="https://via.placeholder.com/40" alt="Profile" className="rounded-circle" style={{width: 40, height: 40}} />
                </Link>
              )}
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={(data) => handleLogin(true, data)} />} />
          <Route path="/signup" element={<Signup onLoginSuccess={(data) => handleLogin(true, data)} />} />
          <Route path="/account" element={<Signup onLoginSuccess={(data) => handleLogin(true, data)} />} />
          <Route path="/ideas" element={<Ideas isLogin={isLoggedIn} userData={userData} />} />
          <Route path="/" element={<Home isLogin={isLoggedIn} userData={userData} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;