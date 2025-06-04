import { useState } from 'react'
import "../assets/css/SDMHUBNewsPost.css";
import prateekimg from "../assets/css/images/prateekprofile.webp";
import prajwalimg from "../assets/css/images/prajwalprofile.png";
import nehaimg from "../assets/css/images/nehaprofile.png";
import post1img from "../assets/css/images/post1.jpg";  // Add these sample images
import post2img from "../assets/css/images/post2.jpg";
import post3img from "../assets/css/images/post3.jpg";

export default function NewsFeed() {
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
      user: "Prajwal",
      time: "4h",
      caption: "Diversity forever",
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
    <div className="container">
      <aside className="sidebar">
        <div className="profile">
          <img src={prateekimg} alt="user"  className="profile-avatar" />
          <span>Prateek_psp</span>
        </div>
        <nav>
          <ul>
            <li className="active">🏠 Home</li>
            <li>🔍 Explore</li>
            <li>🔔 Notifications</li>
            <li>✉️ Messages</li>
          </ul>
        </nav>
        <button className="create-post-btn">Create Post</button>
      </aside>

      <main className="main-feed">
        <h1>Home</h1>

        <div className="post-creator">
          <img src={prateekimg} alt="user"  className="profile-avatar" />
          <input type="text" placeholder="What's on your mind?" />
          <button className="post-btn">📷 Post</button>
        </div>

        <h2>Latest Posts</h2>

        <div className="posts">
          {posts.map((post) => (
            <div className="post" key={post.id}>
              <div className="post-header">
                <img src={post.avatar} alt={post.user} className="profile-avatar" />
                <div>
                  <strong>{post.user}</strong>
                  <span className="time">{post.time}</span>
                </div>
              </div>
             
              {post.image && (
              <div className="post-image">
                <img src={post.image} alt="post" />
              </div>
               )}
              <p>{post.caption}</p>

              <div className="post-actions">
                <span>❤️ {post.likes}</span>
                <span>💬 {post.comments}</span>
                <span>⚠️ {post.shares}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}