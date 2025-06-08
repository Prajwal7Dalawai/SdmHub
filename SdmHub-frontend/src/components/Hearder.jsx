import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/Header.css';
import { FaBell, FaHome, FaUser, FaSearch, FaCommentDots, FaSignOutAlt } from 'react-icons/fa';
import logo from '../assets/images/sdm_logo.png';

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    // Logic for logout
    console.log('Logged out');
    setShowDropdown(false);
  };

  return (
    <header className="header-container">
      <div className="header-left">
        <img src={logo} alt="SDMCET Logo" className="logo-img" />
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search..." />
        </div>
      </div>

      <div className="header-right">
        <Link to="/" className="icon-container">
          <FaHome className="icon" />
        </Link>
        <Link to="/profile" className="icon-container">
          <FaUser className="icon" />
        </Link>
        <Link to="/chat" className="icon-container">
          <FaCommentDots className="icon" />
        </Link>
        <Link to="/friendAndNotify" className="icon-container">
          <FaBell className="icon" />
          <span className="badge">4</span>
        </Link>

        <div className="avatar-wrapper" onClick={toggleDropdown}>
          <img
            src="https://randomuser.me/api/portraits/women/1.jpg"
            alt="User Avatar"
            className="avatarm"
          />
          {showDropdown && (
            <div className="dropdown-menu">
              <button onClick={handleLogout}>
                <FaSignOutAlt style={{ marginRight: '8px' }} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
