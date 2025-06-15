import React, { useState } from 'react';
import '../assets/css/AuthForm.css';
import 'boxicons/css/boxicons.min.css';
import logo from '../assets/images/sdm_logo.png';

const AuthForm = () => {
  const [active, setActive] = useState(false);

  return (
    <div className={`container ${active ? 'active' : ''}`}>
      <div className="form-box login">
        <form>
          <h1>Login</h1>
          <div className="input-box">
            <input type="text" placeholder="Username" required />
            <i className='bx bxs-user'></i>
          </div>
          <div className="input-box">
            <input type="password" placeholder="Password" required />
            <i className='bx bxs-lock-alt'></i>
          </div>
          <div className="forgot-link">
            <a href="#">Forgot password?</a>
          </div>
          <button type="submit" className="btn">Login</button>
          <p>Or login with social platforms</p>
          <div className="social-icons">
            <a href="#"><i className='bx bxl-google'></i></a>
            <a href="#"><i className='bx bxl-facebook'></i></a>
            <a href="#"><i className='bx bxl-github'></i></a>
            <a href="#"><i className='bx bxl-linkedin'></i></a>
          </div>
        </form>
      </div>

      {/* Registration Form */}
<div className="form-box register">
  <form>
    <h1>Registration</h1>

    <div className="input-box">
      <input type="text" placeholder="USN" required />
      <i className='bx bxs-id-card'></i>
    </div>

    <div className="input-box">
      <input type="text" placeholder="Name" required />
      <i className='bx bxs-user'></i>
    </div>

    <div className="input-box">
      <input type="email" placeholder="Email" required />
      <i className='bx bxs-envelope'></i>
    </div>

    <div className="input-box">
      <input type="password" placeholder="Password" required />
      <i className='bx bxs-lock-alt'></i>
    </div>

    <button type="submit" className="btn">Register</button>
    <p>or Register with social platforms</p>
    <div className="social-icons">
      <a href="#"><i className='bx bxl-google'></i></a>
      <a href="#"><i className='bx bxl-facebook'></i></a>
      <a href="#"><i className='bx bxl-github'></i></a>
      <a href="#"><i className='bx bxl-linkedin'></i></a>
    </div>
  </form>
</div>


      <div className="toggle-box">
        <div className="toggle-panel toggle-left">
          <h1>Hello, Welcome!</h1>
          <img src={logo} alt="SDM Social Logo" className="giant-logo beautiful-logo" />
          <p>Don't have an account?</p>
          <button className="btn register-btn" onClick={() => setActive(true)}>Register</button>
        </div>
        <div className="toggle-panel toggle-right">
          <h1>Welcome Back!</h1>
          <img src={logo} alt="SDM Social Logo" className="giant-logo beautiful-logo" />
          
          <p>Already have an account?</p>
          <button className="btn login-btn" onClick={() => setActive(false)}>Login</button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;