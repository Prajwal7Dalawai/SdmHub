import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../assets/css/LoginPage.css'; // Adjust the path as needed
import logo from '../assets/images/app_logo.png';
import { authService } from '../services/auth.service';
import usePageTitle from '../hooks/usePageTitle';

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
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const credentials = {
        email, 
        password
      };
      console.log("🔍 Frontend sending payload:", credentials); // 👈 add here

      const response = await authService.login(credentials);
      console.log('Login response data:', response);
      
      if (response.data.success) {
        console.log("response data here lodu:",response.data.user);
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
        
        // Redirect based on user status
        if (response.data.user.isNewUser) {
          navigate('/editprofile');
        } else if (response.data.user.profile_completion < 60) {
          navigate('/editprofile');
        } else {
          navigate('/feed');
        }
      } else {
        setError(response.data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    alert('Google Login will be supported soon!');
  };

  return (
    <div className="right-panel">
      <h2>SDM Social</h2>
      <div className="welcome-section">
        <p onClick={() => navigate('/signup')}>
          New to SDM Social?{' '}
          <Link to="/signup" className="create-account-link">
            Sign up now
          </Link>
        </p>
        <p>Join the platform built for SDMCET students and alumni.</p>
      </div>

      {error && <div className="error-message">{error}</div>}

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
            minLength="6"
          />
        </div>
        <button 
          type="submit" 
          className="login-button"
          disabled={loading}
          onClick = {handleLogin}
        >
          {loading ? 'Logging in..' : 'Log In'}
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
        <Link to="/forgot-password" className="click-here-link">
          Reset here
        </Link>
      </p>
    </div>
  );
};

// --- Main LoginPage Component ---
export default function LoginPage() {
  usePageTitle('Login - SdmHub');
  return (
    <div className="login-page-container">
      <LeftPanel />
      <RightPanel />
    </div>
  );
};

