import React, { useState, useEffect } from 'react';
import '../assets/css/ProfilePage.css';
import { apiService } from '../services/api.service';
import { useNavigate } from 'react-router-dom';
import githubIcon from '../assets/logo/github-svgrepo-com.svg';
import linkedinIcon from '../assets/logo/linkedin-svgrepo-com.svg';
import instagramIcon from '../assets/logo/instagram-1-svgrepo-com.svg';
import usePageTitle from '../hooks/usePageTitle';

const DEFAULT_PROFILE_PIC = "https://res.cloudinary.com/drvcis27v/image/upload/v1750180422/default_rxs4pw.png";

const ProfilePage = () => {
  usePageTitle('Profile');
  const [activeTab, setActiveTab] = useState('posts');
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [avatarLoading, setAvatarLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const handleLogout = async () => {
    try {
      const response = await apiService.get('/auth/logout');
      if (response.data.success) {
        console.log('Logged out successfully from profile page');
        navigate('/login'); // Redirect to login page
      } else {
        console.error('Logout failed:', response.data.message);
        alert('Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Error during logout. Please try again.');
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch('/auth/profile', {
          credentials: 'include'
        });
        const data = await response.json();
        console.log('Profile data received:', data);
        
        if (data.success) {
          setUserProfile(data.user);
          console.log('User profile set:', data.user);
          setUserPosts(data.user.posts || []);
        } else {
          setError(data.message || 'Failed to fetch profile');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const response = await fetch('/auth/profile-stats', {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
          setUserPosts(data.posts);
          setFollowersCount(data.followersCount);
          setFollowingCount(data.followingCount);
        }
      } catch (err) {
        // ignore
      }
    };

    fetchProfile();
    fetchStats();
  }, []);

  if (loading) {
    return <div className="profile-container">Loading profile...</div>;
  }

  if (error) {
    return <div className="profile-container">Error: {error}</div>;
  }

  if (!userProfile) {
    return <div className="profile-container">No profile data found.</div>;
  }

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
      {loading ? (
        <div className="page-loader-overlay">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          <div className="profile-header">
            <div className="profile-avatar" style={{
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
            }}>
              {avatarLoading && (
                <div className="avatar-spinner">
                  <div className="spinner"></div>
                </div>
              )}
              <img
                src={userProfile?.profile_pic || DEFAULT_PROFILE_PIC}
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
              {!userProfile?.profile_pic && !avatarLoading && (
                <div className="avatar-placeholder">
                  {userProfile?.first_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="profile-info">
              <h1>{userProfile?.first_name || 'User'}</h1>
              {(userProfile?.enrollment_year || userProfile?.graduation_year) && (
                <div style={{ color: '#A22B29', fontWeight: 600, fontSize: '1.1rem', marginBottom: 8 }}>
                  {userProfile?.enrollment_year || ''}
                  {userProfile?.enrollment_year && userProfile?.graduation_year ? ' - ' : ''}
                  {userProfile?.graduation_year || ''}
                </div>
              )}
              <p className="role">{userProfile?.role?.toUpperCase()}</p>
              {userProfile?.department && <p className="department">{userProfile.department?.toUpperCase()}</p>}
              {userProfile?.USN && <p className="usn">{userProfile.USN}</p>}
              {userProfile?.bio && (
                <div className="profile-bio" style={{ margin: '12px 0 0 0', fontStyle: 'italic', color: '#444', fontSize: '1.1rem' }}>
                  {userProfile.bio}
                </div>
              )}
              <div className="button-group">
                <button onClick={() => navigate('/editProfile')}>Edit Profile</button>
                <button>Share Profile</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            </div>
          </div>

          <div className="stats-section">
            <div className="stat">
              <h2>{userPosts.length}</h2>
              <p>Posts</p>
            </div>
            <div className="stat">
              <h2>{followersCount}</h2>
              <p>Followers</p>
            </div>
            <div className="stat">
              <h2>{followingCount}</h2>
              <p>Following</p>
            </div>
          </div>

          {/* Description above Academic & Skills */}
          {userProfile?.description && (
            <div style={{ margin: '18px 0 8px 0', color: '#555', fontSize: '1.08rem', fontStyle: 'italic' }}>
              {userProfile.description}
            </div>
          )}
          <h3>Academic & Skills</h3>
          <ul>
            {userProfile?.cgpa && <li><strong>CGPA:</strong> {userProfile.cgpa}</li>}
            {userProfile?.course && <li><strong>Course:</strong> {userProfile.course}</li>}
            {userProfile?.courses && <li><strong>Courses:</strong> {userProfile.courses}</li>}
            {userProfile?.certifications && <li><strong>Certifications:</strong> {userProfile.certifications}</li>}
          </ul>

          <div className="career-section">
            <h3>Professional & Career</h3>
            <ul>
              {userProfile?.careerInterests && <li><strong>Career Interests:</strong> {userProfile.careerInterests}</li>}
              {userProfile?.projects && <li><strong>Projects:</strong> {userProfile.projects}</li>}
            </ul>
          </div>

          <div className="social-section">
            <h3>Community & Social</h3>
            <ul>
              {(userProfile?.links?.linkedin || userProfile?.links?.github || userProfile?.links?.instagram || userProfile?.links?.portfolio) && (
                <li>
                  {userProfile?.links?.linkedin && <a href={userProfile.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
                  {userProfile?.links?.github && <span> | <a href={userProfile.links.github} target="_blank" rel="noopener noreferrer">GitHub</a></span>}
                  {userProfile?.links?.instagram && <span> | <a href={userProfile.links.instagram} target="_blank" rel="noopener noreferrer">Instagram</a></span>}
                  {userProfile?.links?.portfolio && <span> | <a href={userProfile.links.portfolio} target="_blank" rel="noopener noreferrer">Portfolio</a></span>}
                </li>
              )}
              {userProfile?.clubs && <li><strong>Clubs:</strong> {userProfile.clubs}</li>}
              {userProfile?.events && <li><strong>Events:</strong> {userProfile.events}</li>}
            </ul>
          </div>

          {/* Social Media Links */}
          {(userProfile?.links?.github || userProfile?.links?.linkedin || userProfile?.links?.instagram) && (
            <div className="social-icons" style={{ marginTop: 16, display: 'flex', gap: 16 }}>
              {userProfile?.links?.github && (
                <a href={userProfile.links.github} target="_blank" rel="noopener noreferrer">
                  <img src={githubIcon} alt="GitHub" style={{ width: 36, height: 36 }} />
                </a>
              )}
              {userProfile?.links?.linkedin && (
                <a href={userProfile.links.linkedin} target="_blank" rel="noopener noreferrer">
                  <img src={linkedinIcon} alt="LinkedIn" style={{ width: 36, height: 36 }} />
                </a>
              )}
              {userProfile?.links?.instagram && (
                <a href={userProfile.links.instagram} target="_blank" rel="noopener noreferrer">
                  <img src={instagramIcon} alt="Instagram" style={{ width: 36, height: 36 }} />
                </a>
              )}
            </div>
          )}

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
            {userPosts && userPosts.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#A22B29', fontWeight: 600, fontSize: '1.1rem', padding: '32px 0' }}>
                No post has been shared yet.
              </div>
            )}
            {userPosts && userPosts.length > 0 && userPosts.map((post, idx) => (
              post.content_url && post.content_url.trim() !== '' ? (
                <div
                  key={post._id}
                  className="post"
                  style={{ backgroundImage: `url(${post.content_url})` }}
                />
              ) : (
                <div
                  key={post._id}
                  className="post text-post-box"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '2px solid #A22B29', borderRadius: '12px', minHeight: '120px', padding: '16px', textAlign: 'center', fontWeight: 500, fontSize: '1.1rem', color: '#A22B29' }}
                >
                  {post.caption}
                </div>
              )
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;