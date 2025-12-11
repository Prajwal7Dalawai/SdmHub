import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/css/Header.css';
import { 
  FaBell, 
  FaHome, 
  FaUser, 
  FaSearch, 
  FaCommentDots, 
  FaSignOutAlt, 
  FaUserFriends 
} from 'react-icons/fa';
import logo from '../assets/images/app_logo_cropped.png';
import { apiService } from '../services/api.service';

const DEFAULT_PROFILE_PIC = 'https://res.cloudinary.com/drvcis27v/image/upload/v1750180422/default_rxs4pw.png';

const Header = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState(DEFAULT_PROFILE_PIC);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiService.get('/auth/profile');
        if (response.data.success) {
          setUserProfilePic(response.data.user.profile_pic || DEFAULT_PROFILE_PIC);
        }
      } catch (error) {
        setUserProfilePic(DEFAULT_PROFILE_PIC);
      }
    };
    fetchProfile();
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = async () => {
    try {
      const response = await apiService.get('/auth/logout');
      if (response.data.success) {
        navigate('/login');
      } else {
        alert('Logout failed. Please try again.');
      }
    } catch (error) {
      alert('Error during logout. Please try again.');
    }
    setShowDropdown(false);
  };

  return (
    <header className="header-container">
      <div className="header-left">
        <Link to="/">
          <img src={logo} alt="SDMCET Logo" className="logo-img" style={{ cursor: 'pointer' }} />
        </Link>
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search..." />
        </div>
      </div>

      <div className="header-right">
        <Link to="/feed" className="icon-container">
          <FaHome className="icon" />
        </Link>
        <Link to="/chat" className="icon-container">
          <FaCommentDots className="icon" />
        </Link>

        {/* Friend system icon */}
        <Link to="/friend" className="icon-container">
          <FaUserFriends className="icon" />
          <span className="badge">2</span> {/* Pending friend requests */}
        </Link>

        {/* Notification icon */}
        <Link to="/Notifications" className="icon-container">
          <FaBell className="icon" />
          <span className="badge">4</span>
        </Link>

        {/* User avatar */}
        <div className="avatar-wrapper" onClick={() => navigate('/profile')}>
          <img
            src={userProfilePic}
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
