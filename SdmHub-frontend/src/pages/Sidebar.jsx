import React from 'react';
import '../assets/css/Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div>
        <div className="profile">
          <img src="https://randomuser.me/api/portraits/women/50.jpg" alt="Profile" />
          <h3>Savannah Nguyen</h3>
          <p>Product Designer</p>
        </div>
        <div className="menu">
          <div>📞 +62 845 2341283</div>
          <div>👤 savannah</div>
          <div>💼 Product Designer</div>
          <div>⚙ General Settings</div>
          <div>🔔 Notifications</div>
          <div>🔒 Privacy & Security</div>
          <div>🌐 Language</div>
        </div>
      </div>
      <div className="toggle-dark">
        <span>Dark Mode</span>
        <input type="checkbox" />
      </div>
    </div>
  );
};

export default Sidebar;