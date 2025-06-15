import React, { useState } from 'react'
import { FaUser, FaBell, FaBookmark, FaBriefcase, FaUsers, FaHome, FaCrown, FaTimes } from 'react-icons/fa'
import "../assets/css/SDMHUBNewsPost.css";
import prateekimg from "../assets/images/prateekprofile.webp";
import prajwalimg from "../assets/images/prajwalprofile.png";
import nehaimg from "../assets/images/nehaprofile.png";
import post1img from "../assets/images/post1.jpg"; 
import post2img from "../assets/images/IN10CT.png";
import post3img from "../assets/images/post3.jpg";

const NewsFeed = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const [posts] = useState([
    {
      id: 1,
      user: "Neha",
      time: "2h",
      caption: "Danger Zone",
      avatar: nehaimg,
      image: post1img,
      likes: 23,
      comments: 5,
      shares: 2,
    },
    {
      id: 2,
      user: "Prateek",
      time: "4h",
      caption: "IN10CT forever",
      avatar: prajwalimg,
      image: post2img,
      likes: 45,
      comments: 12,
      shares: 8,
    },
    {
      id: 3,
      user: "Nikhil",
      time: "6h",
      caption: "Diversified",
      avatar: prateekimg,
      image: post3img,
      likes: 18,
      comments: 3,
      shares: 1,
    },
  ]);

  return (
    <div className="linkedin-container">
      {/* Mobile Menu Button */}
      <button className="mobile-menu-button" onClick={toggleSidebar}>
        <FaUser />
      </button>

      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} 
        onClick={toggleSidebar}
      />

      {/* Left Sidebar */}
      <div className={`linkedin-sidebar ${isSidebarOpen ? 'active' : ''}`}>
        <button className="sidebar-close" onClick={toggleSidebar}>
          <FaTimes />
        </button>

        <div className="sidebar-card profile-card">
          <img src={prateekimg} alt="user" className="profile-avatar-large" />
          <h2>Prajwal Dalawai <span className="verified-badge">✔️</span></h2>
          <p className="profile-title">CSE'26, SDMCET, DHARWAD<br />Hubli-Dharwad, Karnataka</p>
          <div className="profile-org">🏫 SDM College of Engg & Tech , Dharwad</div>
        </div>
        <div className="sidebar-card stats-card">
          <div className="sidebar-stat-row">
            <span>Profile viewers</span>
            <span className="stat-value">35</span>
          </div>
          <div className="sidebar-stat-row">
            <span>Post impressions</span>
            <span className="stat-value">49</span>
          </div>
        </div>
        <div className="sidebar-card premium-card">
          <span className="premium-icon">🔶</span> Gain exclusive tools & insights<br />
          <span className="premium-link">Redeem Premium for ₹0</span>
        </div>
        <div className="sidebar-card nav-card">
          <div><FaHome /> Home</div>
          <div><FaUsers /> My Network</div>
          <div><FaBriefcase /> Jobs</div>
          <div><FaBell /> Notifications</div>
          <div><FaBookmark /> Saved</div>
        </div>
      </div>

      {/* Center Feed */}
      <main className="linkedin-feed">
        <div className="feed-card post-creator-card">
          <img src={prateekimg} alt="user" className="profile-avatar" />
          <input type="text" placeholder="Start a post" className="feed-input" />
          <button className="feed-action-btn">🎥 Video</button>
          <button className="feed-action-btn">📷 Photo</button>
          <button className="feed-action-btn">📝 Write article</button>
        </div>
        <div className="feed-divider" />
        <div className="posts-list">
          {posts.map((post) => (
            <div className="feed-card post-card" key={post.id}>
              <div className="post-header">
                <img src={post.avatar} alt={post.user} className="profile-avatar" />
                <div>
                  <strong>{post.user}</strong>
                  <span className="time">{post.time}</span>
                </div>
              </div>
              {post.image && (
                <div className="post-image"><img src={post.image} alt="post" /></div>
              )}
              <p className="post-caption">{post.caption}</p>
              <div className="post-actions">
                <span>👍 {post.likes}</span>
                <span>💬 {post.comments}</span>
                <span>🔗 {post.shares}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Right News/Trending */}
      <aside className="linkedin-rightbar">
        <div className="rightbar-card news-card">
          <h3>LinkedIn News</h3>
          <ul className="news-list">
            <li><strong>Warner Bros. Discovery to split</strong><br /><span className="news-meta">35m ago • 65,546 readers</span></li>
            <li><strong>Microsoft debuts new Xbox devices</strong><br /><span className="news-meta">1h ago • 12,691 readers</span></li>
            <li><strong>Glenmark gets DCGI nod for cancer d...</strong><br /><span className="news-meta">1h ago • 4,037 readers</span></li>
            <li><strong>Dividend payouts hit new high</strong><br /><span className="news-meta">4h ago • 1,057 readers</span></li>
            <li><strong>GCCs struggle to retain talent</strong><br /><span className="news-meta">4h ago • 802 readers</span></li>
          </ul>
        </div>
        <div className="rightbar-card puzzles-card">
          <h4>Today's puzzles</h4>
          <ul className="puzzles-list">
            <li>Zip #84 <span className="puzzle-meta">4 connections played</span></li>
            <li>Tango #245 <span className="puzzle-meta">Harmonize the grid</span></li>
            <li>Queens #405 <span className="puzzle-meta">Crown each region</span></li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

export default NewsFeed;