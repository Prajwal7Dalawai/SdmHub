import React, { useState, useEffect } from 'react';
import '../assets/css/ProfilePage.css';
import { apiService } from '../services/api.service';
import { useNavigate } from 'react-router-dom';
import githubIcon from '../assets/logo/github-svgrepo-com.svg';
import linkedinIcon from '../assets/logo/linkedin-svgrepo-com.svg';
import instagramIcon from '../assets/logo/instagram-1-svgrepo-com.svg';
import usePageTitle from '../hooks/usePageTitle';

const DEFAULT_PROFILE_PIC =
  "https://res.cloudinary.com/drvcis27v/image/upload/v1750180422/default_rxs4pw.png";

const ProfilePage = () => {
  usePageTitle('Profile');

  const [activeTab, setActiveTab] = useState('posts');
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const [friendsCount, setFriendsCount] = useState(0);

  const navigate = useNavigate();

  /* ---------------- LOGOUT ---------------- */
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
  };

  /* ---------------- FETCH USER POSTS (ORIGINAL + REPOSTS) ---------------- */
  const fetchUserPosts = async (userId) => {
    try {
      const res = await apiService.get(`/posts/user/${userId}`);
      setUserPosts(res.data.posts || []);
    } catch (err) {
      console.error("Failed to fetch user posts", err);
    }
  };

  /* ---------------- FETCH PROFILE ---------------- */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const response = await fetch('/auth/profile', {
          credentials: 'include',
        });

        const data = await response.json();

        if (data.success) {
          setUserProfile(data.user);
          setFriendsCount(data.user.friendsList?.length || 0);

          // ✅ IMPORTANT: fetch posts from Post collection
          fetchUserPosts(data.user._id);
        } else {
          setError(data.message || 'Failed to fetch profile');
        }
      } catch (err) {
        setError('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /* ---------------- LOADING / ERROR ---------------- */
  if (loading) {
    return <div className="profile-container">Loading profile...</div>;
  }

  if (error) {
    return <div className="profile-container">Error: {error}</div>;
  }

  if (!userProfile) {
    return <div className="profile-container">No profile data found.</div>;
  }

  /* ---------------- RENDER ---------------- */
  /* ---------------- RENDER ---------------- */
return (
  <div className="profile-container">
    <>
      {/* ---------------- HEADER ---------------- */}
      <div className="profile-header">
        <div
          className="profile-avatar"
          style={{
            backgroundColor: '#f0f0f0',
            position: 'relative',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            border: '4px solid #A22B29',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {avatarLoading && (
            <div className="avatar-spinner">
              <div className="spinner"></div>
            </div>
          )}

          <img
            src={userProfile.profile_pic || DEFAULT_PROFILE_PIC}
            alt="Profile"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%',
              display: avatarLoading ? 'none' : 'block',
            }}
            onLoad={() => setAvatarLoading(false)}
            onError={() => setAvatarLoading(false)}
          />
        </div>

        <div className="profile-info">
          <h1>{userProfile.first_name}</h1>

          {(userProfile.enrollment_year || userProfile.graduation_year) && (
            <div
              style={{
                color: '#A22B29',
                fontWeight: 600,
                fontSize: '1.1rem',
                marginBottom: 8,
              }}
            >
              {userProfile.enrollment_year || ''}
              {userProfile.enrollment_year && userProfile.graduation_year
                ? ' - '
                : ''}
              {userProfile.graduation_year || ''}
            </div>
          )}

          <p className="role">{userProfile.role?.toUpperCase()}</p>
          {userProfile.department && (
            <p className="department">{userProfile.department.toUpperCase()}</p>
          )}
          {userProfile.USN && <p className="usn">{userProfile.USN}</p>}

          {userProfile.bio && (
            <div className="profile-bio">{userProfile.bio}</div>
          )}

          <div className="button-group">
            <button onClick={() => navigate('/editProfile')}>
              Edit Profile
            </button>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>

      {/* ---------------- STATS ---------------- */}
      <div className="stats-section">
        <div className="stat">
          <h2>{userPosts.length}</h2>
          <p>Posts</p>
        </div>
        <div className="stat">
          <h2>{friendsCount}</h2>
          <p>Friends</p>
        </div>
      </div>

      {/* ---------------- ACADEMIC & SKILLS ---------------- */}
      <h3>Academic & Skills</h3>
      <ul>
        {userProfile.cgpa && (
          <li>
            <strong>CGPA:</strong> {userProfile.cgpa}
          </li>
        )}
        {userProfile.course && (
          <li>
            <strong>Course:</strong> {userProfile.course}
          </li>
        )}
        {userProfile.certifications && (
          <li>
            <strong>Certifications:</strong> {userProfile.certifications}
          </li>
        )}
      </ul>

      {/* ---------------- CAREER ---------------- */}
      <div className="career-section">
        <h3>Professional & Career</h3>
        <ul>
          {userProfile.projects && (
            <li>
              <strong>Projects:</strong> {userProfile.projects}
            </li>
          )}
          {userProfile.careerInterests && (
            <li>
              <strong>Career Interests:</strong>{' '}
              {userProfile.careerInterests}
            </li>
          )}
        </ul>
      </div>

      {/* ---------------- TABS ---------------- */}
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

      {/* ---------------- POSTS GRID (ORIGINAL + REPOSTS) ---------------- */}
      <div className="post-grid">
        {userPosts.length === 0 && (
          <div
            style={{
              gridColumn: '1/-1',
              textAlign: 'center',
              color: '#A22B29',
              fontWeight: 600,
              padding: '32px 0',
            }}
          >
            No post has been shared yet.
          </div>
        )}

        {userPosts.map((post) => {
          const imageUrl =
            post.content_url || post.originalPost?.content_url;

          return imageUrl && imageUrl.trim() !== '' ? (
            <div
              key={post._id}
              className="post"
              style={{ backgroundImage: `url(${imageUrl})` }}
            />
          ) : (
            <div
              key={post._id}
              className="post text-post-box"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fff',
                border: '2px solid #A22B29',
                borderRadius: '12px',
                minHeight: '120px',
                padding: '16px',
                textAlign: 'center',
                fontWeight: 500,
                fontSize: '1.1rem',
                color: '#A22B29',
              }}
            >
              {post.caption}
            </div>
          );
        })}
      </div>

      {/* ---------------- SOCIAL ICONS ---------------- */}
      <div
        className="social-icons"
        style={{ marginTop: 16, display: 'flex', gap: 16 }}
      >
        {userProfile.links?.github && (
          <a href={userProfile.links.github} target="_blank" rel="noreferrer">
            <img src={githubIcon} alt="GitHub" width={36} />
          </a>
        )}
        {userProfile.links?.linkedin && (
          <a href={userProfile.links.linkedin} target="_blank" rel="noreferrer">
            <img src={linkedinIcon} alt="LinkedIn" width={36} />
          </a>
        )}
        {userProfile.links?.instagram && (
          <a
            href={userProfile.links.instagram}
            target="_blank"
            rel="noreferrer"
          >
            <img src={instagramIcon} alt="Instagram" width={36} />
          </a>
        )}
      </div>
    </>
  </div>
);

};

export default ProfilePage;
