import { useState } from 'react'
import { Link } from 'react-router-dom';
import "../assets/css/LoginPage.css";
import sdmhubLogo from "../assets/images/app_logo.png";
import { authService } from '../services/auth.service';
import usePageTitle from '../hooks/usePageTitle';
import { useNavigate } from 'react-router-dom';

// --- Left Panel Component ---
const LeftPanel = () => (
  <div className="left-panel">
    <div className="logo-placeholder">
      <div className="logo-wrapper">
        <img src={sdmhubLogo} alt="SDMHUB Logo" className="giant-logo" />
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

// --- Right Panel Component ---
const RightPanel = () => {
  const [usn, setUsn] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  
  const handleGoogleLogin = async (e) => {
       e.preventDefault();
      setError('');
      setLoading(true);
  
      try {
        const response = await authService.googleLogin();
        console.log('Login response data:', response);
        
        if (response.data.success) {
          console.log("response data here lodu:",response.data.user);
          // Store user data in localStorage
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
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



  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await authService.signup({
        USN: usn,
        first_name: name,
        email,
        password
      });
      if (res.data.success) {
        alert('Signup successful! Please log in.');
        window.location.href = '/login';
      } else {
        alert(res.data.message || 'Signup failed.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Signup failed.');
    }
  };

  return (
    <div className="right-panel">
      <h2>Sign Up</h2>
      <div className="welcome-section">
        <p>Already have an account?{' '}
          <Link to="/login" className="create-account-link">Log in</Link>
        </p>
        {error && <p className="error-text">{error}</p>}
        <p>Join the platform built for SDMCET students and alumni.</p>
      </div>
      <form className="login-form" onSubmit={handleSignup}>
        <div className="form-group">
          <label htmlFor="usn">USN</label>
          <input
            type="text"
            id="usn"
            placeholder="Your USN"
            value={usn}
            onChange={e => setUsn(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            placeholder="Your Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="yourname@sdmcet.in"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">Sign Up</button>
      </form>
      <button className="google-login-button" onClick={handleGoogleLogin} disabled={loading}>
        <img
          src="https://img.icons8.com/color/16/000000/google-logo.png"
          alt="Google logo"
        />{' '}
        Log in with Google
      </button>
      <p className="small-text">
        People who use our service may have uploaded your contact information to SDMHUB. <a href="#">Learn More</a>
      </p>
      <p className="small-text">
        By signing up, you agree to our <a href="#">Terms</a>, <a href="#">Privacy Policy</a> and <a href="#">Cookies Policy</a>.
      </p>
    </div>
  );
};

export default function SDMHUBAuth() {
  usePageTitle('Signup - SdmHub');
  return (
    <div className="login-page-container">
      <LeftPanel />
      <RightPanel />
    </div>
  );
}