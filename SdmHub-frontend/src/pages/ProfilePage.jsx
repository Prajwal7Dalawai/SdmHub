import React from 'react';
import '../assets/css/ProfilePage.css';

const ProfilePage = () => {
  return (
    <div className="design-root">
      <div className="layout-container">
        <main className="main-section">
          <div className="profile-section">
            <div className="profile-info">
              <div
                className="avatarm"
                style={{
                  backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCl05wgBwfqs7LKRTkHmvoAh2qcrz3NPuyC6Gd0Q2HNoF_kJ8reB1VmdO5O8jmMhSmKWpNQrCLQf0nYnY_3h7_lOgvivltGhMSLz4WgSCRBcL68aB07TEOUcIOGerhREUrgSFR_Fwr8DG4JWatwMPHHIA0e3NGJ-jQsLb1kqPWX71lrPQOLcPAYXrX9NTT6BAqeUF7ogrEefY-CFK8v5jgyoItbAuFWT5kIMuRJouf9qewkD7aw9m_lsY5MyAJzgJusvrL7fMieNKI")`,
                }}
              />
              <div className="profile-details">
                <p className="profile-name">Sophia Carter</p>
                <p className="profile-desc">University of InnovaTech | Computer Science</p>
                <p className="profile-bio">Passionate about coding and building innovative solutions. Let's connect!</p>
              </div>
            </div>
            <div className="button-group">
            <button className="follow-button">Edit Profile</button>
            <button className="follow-button">Share Profile</button>
            </div>


          </div>

          <div className="stats-section">
            <div className="stat-box">
              <p className="stat-number">250</p>
              <p className="stat-label">Posts</p>
            </div>
            <div className="stat-box">
              <p className="stat-number">120</p>
              <p className="stat-label">Followers</p>
            </div>
            <div className="stat-box">
              <p className="stat-number">80</p>
              <p className="stat-label">Following</p>
            </div>
          </div>

          <div className="tab-section">
            <a href="#" className="tab active">Posts</a>
            <a href="#" className="tab">Tagged</a>
          </div>

          <div className="post-grid">
            {/* Repeat this div for each post */}
            <div
              className="post-image"
              style={{
                backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuC44w-3H2FCJo_Y87jCs5SuDKnhAfMyKU5IKdMiK1GMiBq48KFNu01_bZrnDZqwko9qFY6TzG4ekeGhj-ReUCm9H1TYn7RW0rpLYKkXRcrGypChHsWGZP_78uvApTT8VeBMTCSLC2cVEyUJp6VeQ0NyTvEpSL5KPZcqMJu")`,
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
