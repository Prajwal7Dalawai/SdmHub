import React, { useState } from 'react';
import '../assets/css/LoginPage.css'; // Adjust the path as needed
import logo from '../assets/images/sdm_logo.png';


// --- Left Panel Component ---
const LeftPanel = () => {
  return (
    <div className="left-panel">
      <div className="logo-placeholder">
                 <div className="logo-wrapper">
      <img src={logo} alt="SDM Social Logo" className="giant-logo beautiful-logo" />
    </div>
      </div>
      <h1>Welcome to</h1>
      <h1>SDM Social! 👋</h1>
      <p>
        Connect, collaborate, and grow with your SDMCET community. Share moments, ideas, and opportunities – all in one place.
      </p>
      <div className="footer-logo">
        <span style={{ color: 'white' }}>📱</span>
        <p>© 2025 SDM Social. All rights reserved.</p>
      </div>
    </div>
  );
};

// --- Right Panel Component ---
const RightPanel = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Login attempt with:', { email, password });
    alert('Login functionality will be available soon!');
  };

  const handleGoogleLogin = () => {
    alert('Google Login will be supported soon!');
  };

  return (
    <div className="right-panel">
      <h2>SDM Social</h2>
      <div className="welcome-section">
        <p>
          New to SDM Social?{' '}
          <a href="#" className="create-account-link">
            Sign up now
          </a>
        </p>
        <p>Join the platform built for SDMCET students and alumni.</p>
      </div>

      <form className="login-form" onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email ID</label>
          <input
            type="email"
            id="email"
            placeholder="yourname@sdmcet.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">
          Log In
        </button>
      </form>

      <button className="google-login-button" onClick={handleGoogleLogin}>
        <img
          src="https://img.icons8.com/color/16/000000/google-logo.png"
          alt="Google logo"
        />{' '}
        Log in with Google
      </button>

      <p className="forgot-password">
        Forgot your password?{' '}
        <a href="#" className="click-here-link">
          Reset here
        </a>
      </p>
    </div>
  );
};

// --- Main LoginPage Component ---
const LoginPage = () => {
  return (
    <div className="login-page-container">
      <LeftPanel />
      <RightPanel />
    </div>
  );
};

export default LoginPage;
