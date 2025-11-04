import React, { useState, useEffect } from 'react'
import "../assets/css/NewsFeed.css";
import { postService } from '../services/post.service';
import { authService } from '../services/auth.service';
import prateekimg from "../assets/images/prateekprofile.webp";
import prajwalimg from "../assets/images/prajwalprofile.png";
import nehaimg from "../assets/images/nehaprofile.png";
import post1img from "../assets/images/post1.jpg";  // Add these sample images
import post2img from "../assets/images/IN10CT.png";
import post3img from "../assets/images/post3.jpg";
import { uploadService } from '../services/api.service';
import usePageTitle from '../hooks/usePageTitle';

const NewsFeed = () => {
  usePageTitle('Feed');
  const [newPost, setNewPost] = useState({
    caption: '',
    image: null
  });
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [postsRes, userRes] = await Promise.all([
          postService.getPosts(),
          authService.getProfile()
        ]);
        setPosts(postsRes.data.posts || []);
        setUser(userRes.data.user);
      } catch (err) {
        // handle error
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handlePostChange = (e) => {
    setNewPost({
      ...newPost,
      caption: e.target.value
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPost({
          ...newPost,
          image: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostSubmit = async () => {
    if (newPost.caption.trim() === '' && !newPost.image) return;
    setPosting(true);
    try {
      let imageUrl = null;
      if (newPost.image) {
        // Convert base64 to Blob
        const res = await fetch(newPost.image);
        const blob = await res.blob();
        // Upload to backend
        const uploadRes = await uploadService.uploadPostImage(blob);
        imageUrl = uploadRes.data.url;
      }
      const postPayload = {
        caption: newPost.caption,
        image: imageUrl
      };
      const res = await postService.createPost(postPayload);
      setPosts([res.data.post, ...posts]);
      setNewPost({ caption: '', image: null });
    } catch (err) {
      // handle error
    }
    setPosting(false);
  };

  function getRelativeTime(date) {
    const now = new Date();
    const postDate = new Date(date);
    const diff = Math.floor((now - postDate) / 1000); // in seconds
    if (diff < 60) return `${diff} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return postDate.toLocaleDateString();
  }

  return (
    <div className="linkedin-container">
      {/* Left Sidebar */}
      <aside className="linkedin-sidebar">
        <div className="sidebar-card profile-card">
          <img src={user?.profile_pic} alt="user" className="profile-avatar-large" />
          <h2>{user?.first_name || ''} <span className="verified-badge">✔️</span></h2>
          <p className="profile-title">{user?.department || ''} {user?.graduation_year ? `, ${user.graduation_year}` : ''}<br />{user?.bio || ''}</p>
          <div className="profile-org">🏫 SDM College of Engg & Tech , Dharwad</div>
        </div>
        <div className="sidebar-card stats-card">
          <div className="sidebar-stat-row">
            <span>Profile completion</span>
            <span className="stat-value">{user?.profile_completion || 0}%</span>
          </div>
        </div>
        <div className="sidebar-card premium-card">
          <span className="premium-icon">🔶</span> Gain exclusive tools & insights<br />
          <span className="premium-link">Redeem Premium for ₹0</span>
        </div>
        <div className="sidebar-card nav-card">
          <div>🔖 Saved items</div>
          <div>👥 Groups</div>
          <div>📰 Newsletters</div>
          <div>📅 Events</div>
        </div>
      </aside>

      {/* Center Feed */}
      <main className="linkedin-feed">
        <div className="feed-card post-creator-card">
          <div className="post-creator-header">
            <img src={user?.profile_pic} alt="user" className="profile-avatar" />
            <input 
              type="text" 
              placeholder="Start a post" 
              className="feed-input"
              value={newPost.caption}
              onChange={handlePostChange}
              disabled={posting}
            />
          </div>
          {newPost.image && (
            <div className="post-preview">
              <img src={newPost.image} alt="preview" />
              <button 
                className="remove-image-btn"
                onClick={() => setNewPost({...newPost, image: null})}
                disabled={posting}
              >
                ✖
              </button>
            </div>
          )}
          <div className="post-creator-actions">
            <div className="action-buttons" style={{ display: 'flex', gap: '12px' }}>
              <label className="feed-action-btn">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  disabled={posting}
                />
                📷 Photo
              </label>
              <button className="feed-action-btn">🎥 Video</button>
              <button className="feed-action-btn">📝 Write article</button>
            </div>
            <button 
              className="post-submit-btn"
              onClick={handlePostSubmit}
              disabled={(!newPost.caption.trim() && !newPost.image) || posting}
            >
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
        <div className="feed-divider" />
        <div className="posts-list">
          {loading ? <div>Loading...</div> : posts.map((post) => (
            <div className="feed-card post-card" key={post._id || post.id}>
              <div className="post-header">
                <img src={post.avatar || user?.profile_pic} alt={post.user || user?.first_name} className="profile-avatar" />
                <div>
                  <strong>{post.user || user?.first_name}</strong>
                  <div className="time">{getRelativeTime(post.time) || 'Just now'}</div>
                </div>
              </div>
              {post.image && post.image.trim() !== '' && (
                <div className="post-image"><img src={post.image} alt="post" /></div>
              )}
              {post.caption && post.caption.trim() !== '' && (
                <p className="post-caption">{post.caption}</p>
              )}
              <div className="post-actions">
                <span>👍 {post.likes || 0}</span>
                <span>💬 {post.comments || 0}</span>
                <span>🔗 {post.shares || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Right News/Trending */}
      <aside className="linkedin-rightbar">
        <div className="rightbar-card news-card">
          <h3>SDM News</h3>
          <ul className="news-list">
            <li><strong>Insignia'25 grand success</strong><br /><span className="news-meta">35m ago • 65,546 readers</span></li>
            <li><strong>2 students from CSE dept got selected to Accenture as Summer Intern</strong><br /><span className="news-meta">1h ago • 12,691 readers</span></li>
            <li><strong>8 people from 3rd year got placed in Dell Technologies as Summer Intern</strong><br /><span className="news-meta">1h ago • 4,037 readers</span></li>
            <li><strong>JC Kerur Mam took a retirement</strong><br /><span className="news-meta">4h ago • 1,057 readers</span></li>
            <li><strong>Dr Ramesh Chakrasali took the charge as Principal</strong><br /><span className="news-meta">4h ago • 802 readers</span></li>
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
