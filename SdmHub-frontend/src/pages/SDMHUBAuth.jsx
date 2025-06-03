import { useState } from 'react'
import "../assets/css/SDMHUBAuth.css";
<<<<<<< HEAD
import sdmhubLogo from "./assets/logo.png";
=======
import sdmhubLogo from "../assets/css/logo/logo.png";
>>>>>>> 867ba3bef0a6ac6eccbd6d2959db6f0fa94a063c
export default function SDMHUBAuth() {
  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="logo">
  <img src={sdmhubLogo} alt="SDMHUB Logo" className="logo-image" />
</div>
        <p className="subtitle">Sign up to see photos and updates from your friends.</p>

  

        <form className="auth-form">
          <input type="text" placeholder="USN" required />
          <input type="text" placeholder="Name" required />
          <input type="text" placeholder="Email" required />
          <input type="password" placeholder="Password" required />

          <p className="small-text">
            People who use our service may have uploaded your contact information to SDMHUB.{" "}
            <a href="#">Learn More</a>
          </p>

          <p className="small-text">
            By signing up, you agree to our <a href="#">Terms</a>, <a href="#">Privacy Policy</a> and{" "}
            <a href="#">Cookies Policy</a>.
          </p>

          <button type="submit" className="signup-button">Sign up</button>
        </form>
      </div>

      <div className="login-box">
        Have an account? <a href="#">Log in</a>
      </div>
    </div>
  );
}
