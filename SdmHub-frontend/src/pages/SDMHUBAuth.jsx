import { useState } from 'react'
import { Link } from 'react-router-dom';
import "../assets/css/LoginPage.css";
import sdmhubLogo from "../assets/logo/logo.png";

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

  const handleSignup = (e) => {
    e.preventDefault();
    // Signup logic here
  };

  return (
    <div className="right-panel">
      <h2>Sign Up</h2>
      <div className="welcome-section">
        <p>Already have an account?{' '}
          <Link to="/login" className="create-account-link">Log in</Link>
        </p>
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
  return (
    <div className="login-page-container">
      <LeftPanel />
      <RightPanel />
    </div>
  );
}
