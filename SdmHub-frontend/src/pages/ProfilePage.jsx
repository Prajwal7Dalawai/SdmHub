import React, { useState } from 'react';
import '../assets/css/ProfilePage.css';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('posts');

  const postData = {
    posts: [
      'https://images.unsplash.com/photo-1527980965255-d3b416303d12',
      'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d',
    ],
    images: [
      'https://images.unsplash.com/photo-1581093588401-12d7c1e5c92d',
      'https://images.unsplash.com/photo-1607746882042-944635dfe10e',
    ],
    videos: [
      'https://www.w3schools.com/html/mov_bbb.mp4',
      'https://www.w3schools.com/html/movie.mp4',
    ],
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div
          className="avatar"
          style={{
            backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCl05wgBwfqs7LKRTkHmvoAh2qcrz3NPuyC6Gd0Q2HNoF_kJ8reB1VmdO5O8jmMhSmKWpNQrCLQf0nYnY_3h7_lOgvivltGhMSLz4WgSCRBcL68aB07TEOUcIOGerhREUrgSFR_Fwr8DG4JWatwMPHHIA0e3NGJ-jQsLb1kqPWX71lrPQOLcPAYXrX9NTT6BAqeUF7ogrEefY-CFK8v5jgyoItbAuFWT5kIMuRJouf9qewkD7aw9m_lsY5MyAJzgJusvrL7fMieNKI")`,
          }}
        />
        <div className="profile-info">
          <h1>Sophia Carter</h1>
          <p>University of InnovaTech | Computer Science</p>
          <p>Passionate about coding and building innovative solutions.</p>
          <div className="button-group">
            <button>Edit Profile</button>
            <button>Share Profile</button>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="stat"><h2>250</h2><p>Posts</p></div>
        <div className="stat"><h2>120</h2><p>Followers</p></div>
        <div className="stat"><h2>80</h2><p>Following</p></div>
      </div>

      <div className="academic-section">
        <h3>Academic & Skills</h3>
        <ul>
          <li><strong>CGPA:</strong> 8.6</li>
          <li><strong>Courses:</strong> DS, AI/ML, DBMS, OS</li>
          <li><strong>Certifications:</strong> Python (Coursera), ML (Udemy)</li>
          <li><strong>Skills:</strong> Python, Java, Figma, AutoCAD</li>
          <li><strong>Languages:</strong> English, Hindi, Kannada</li>
        </ul>
      </div>

      <div className="career-section">
        <h3>Professional & Career</h3>
        <ul>
          <li><strong>Links:</strong> <a href="#">LinkedIn</a>, <a href="#">GitHub</a>, <a href="#">Portfolio</a></li>
          <li><strong>Career Interests:</strong> AI/ML, Full-Stack, UI/UX</li>
          <li><strong>Projects:</strong> Virtual Trial Room, Chatbot, E-commerce site</li>
        </ul>
      </div>

      <div className="social-section">
        <h3>Community & Social</h3>
        <ul>
          <li><strong>Clubs:</strong> CodeGeeks, TechSoc</li>
          <li><strong>Events:</strong> Hackathons, Workshops</li>
        </ul>
      </div>

      <div className="posts-tab">
        {['posts', 'images', 'videos'].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="post-grid">
        {activeTab !== 'videos' &&
          postData[activeTab].map((url, idx) => (
            <div
              key={idx}
              className="post"
              style={{ backgroundImage: `url(${url})` }}
            />
          ))}

        {activeTab === 'videos' &&
          postData.videos.map((url, idx) => (
            <div className="post" key={idx} style={{ padding: 0 }}>
              <video
                src={url}
                controls
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '12px',
                  objectFit: 'cover',
                }}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default ProfilePage;
