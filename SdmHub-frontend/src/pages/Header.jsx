import React from 'react';
import '../assets/css/Header.css'; // If you have styling

const Header = () => (
  <div className="header">
    <div className="logo">ConnectSphere</div>
    <div className="nav-links">
      <span>Home</span>
      <span>Explore</span>
      <span className="active">Messages</span>
      <span>Lists</span>
    </div>
    <div className="right-section">
      <div className="search-bar">
        <i className="feather-search" />
        <input type="text" placeholder="Search" />
      </div>
      <i className="ion-notifications-outline icon" />
      <i className="feather-user icon" />
      <img
        src="https://randomuser.me/api/portraits/women/79.jpg"
        alt="profile"
        className="profile-pic"
      />
    </div>
  </div>
);

export default Header;
