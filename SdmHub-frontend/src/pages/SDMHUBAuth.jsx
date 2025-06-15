import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import "../assets/css/LoginPage.css";
import sdmhubLogo from "../assets/logo/logo.png";
import { authService } from '../services/auth.service';

// Mapping for USN branch codes to full department names
const departmentMap = {
  'cs': 'cse',
  'is': 'ise',
  'am': 'aiml', // Assuming 'AM' in USN maps to 'aiml'
  'ce': 'ce',
  'me': 'me',
  'cv': 'civil', // Assuming 'CV' in USN maps to 'civil'
  'ec': 'ece',
  'ee': 'eee',
};

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
  const navigate = useNavigate();
  const [usn, setUsn] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const usnBranchCode = usn.substring(5, 7).toLowerCase();
      console.log('Extracted USN Branch Code:', usnBranchCode);
      const department = departmentMap[usnBranchCode] || '';

      const userData = {
        first_name: name,
        email: email,
        USN: usn,
        password: password,
        role: 'student',
        department: department,
        graduation_year: parseInt('20' + usn.substring(2, 4)) + 4,
        enrollment_year: parseInt('20' + usn.substring(2, 4)),
        bio: ''
      };

      console.log('Sending signup data:', userData);

      const data = await authService.signup(userData);
      
      if (data.success) {
        // Store user data in localStorage or context if needed
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect based on profile completion
        if (data.redirect === '/editprofile') {
          navigate('/editprofile');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'An error occurred during signup. Please try again.');
    } finally {
      setLoading(false);
    }
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
      {error && <div className="error-message">{error}</div>}
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
            pattern="^2SD\d{2}[A-Z]{2}\d{3}$"
            title="Please enter a valid USN in the format 2SDYYSSNNN"
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
            minLength="6"
          />
        </div>
        <button 
          type="submit" 
          className="login-button"
          disabled={loading}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
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
