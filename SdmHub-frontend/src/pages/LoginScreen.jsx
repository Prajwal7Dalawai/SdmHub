import React, { useState } from "react";
import '../assets/css/LoginScreen.css'; // Import the CSS file

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          {/* Logo */}
          <div className="logo-circle">
            <span className="logo-text">C</span>
          </div>
          <h1 className="header-title">Connect</h1>
        </div>

        <nav className="nav">
          {["Home", "About", "Contact"].map((item) => (
            <button key={item} className="nav-button">
              {item}
            </button>
          ))}
          <button className="signup-button">Sign Up</button>
        </nav>
      </header>

      {/* Centered Content */}
      <main className="main">
        <div className="login-card">
          <h2 className="welcome-text">Welcome back</h2>

          {/* Username */}
          <div className="input-group">
            <label htmlFor="username" className="input-label">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div className="input-group">
            <label htmlFor="password" className="input-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {/* Login Button */}
          <button
            onClick={() => alert(`Logging in ${username}`)}
            className="login-button"
          >
            Login
          </button>

          {/* Login with SearchEngineCo */}
          <button
            onClick={() => alert("Login with SearchEngineCo")}
            className="login-alt-button"
          >
            Login with SearchEngineCo
          </button>

          <button className="signup-link">
            Don&apos;t have an account? Sign up
          </button>
        </div>
      </main>
    </div>
  );
}
