import React, { useState, useEffect } from 'react'
import "../assets/css/NewsFeed.css";
import { postService } from '../services/post.service';
import { authService } from '../services/auth.service';
import { uploadService } from '../services/api.service';
import usePageTitle from '../hooks/usePageTitle';
import { socket } from "../socket";

const NewsFeed = () => {
  usePageTitle('Feed');

  const [newPost, setNewPost] = useState({ caption: '', image: null });
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const [commentBoxOpen, setCommentBoxOpen] = useState({});
  const [commentInput, setCommentInput] = useState({});
  const [showAllComments, setShowAllComments] = useState({});
  const [sharePopup, setSharePopup] = useState({});


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
      } catch {}
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
  socket.connect();   // ✅ THIS IS THE KEY LINE

  socket.on("connect", () => {
    console.log("SOCKET CONNECTED:", socket.id);
  });

  socket.on("comment:new", ({ postId, comment }) => {
    console.log("SOCKET RECEIVED: comment:new", postId);

    setPosts(prevPosts =>
      prevPosts.map(p =>
        p._id === postId
          ? {
              ...p,
              comments: [comment, ...(p.comments || [])].slice(0, 2),
              comment_count: p.comment_count + 1
            }
          : p
      )
    );
  });

  return () => {
    socket.off("comment:new");
    socket.disconnect();   // ✅ clean disconnect
  };
}, []);

useEffect(() => {
  socket.on("comment:delete", ({ postId, commentId }) => {
    setPosts(prev =>
      prev.map(p =>
        p._id === postId
          ? {
              ...p,
              comments: p.comments.filter(c => c._id !== commentId),
              comment_count: p.comment_count - 1
            }
          : p
      )
    );
  });

  return () => socket.off("comment:delete");
}, []);


  const handlePostChange = (e) => {
    setNewPost({ ...newPost, caption: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewPost({ ...newPost, image: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handlePostSubmit = async () => {
    if (!newPost.caption.trim() && !newPost.image) return;

    setPosting(true);
    try {
      let imageUrl = null;
      if (newPost.image) {
        const res = await fetch(newPost.image);
        const blob = await res.blob();
        const uploadRes = await uploadService.uploadPostImage(blob);
        imageUrl = uploadRes.data.url;
      }

      const res = await postService.createPost({
        caption: newPost.caption,
        image: imageUrl,
      });

      setPosts([res.data.post, ...posts]);
      setNewPost({ caption: "", image: null });
    } catch {}
    setPosting(false);
  };

  function getRelativeTime(date) {
    const now = new Date();
    const postDate = new Date(date);
    const diff = Math.floor((now - postDate) / 1000);
    if (diff < 60) return `${diff} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return postDate.toLocaleDateString();
  }

  const handleLike = async (postId) => {
    try {
      const res = await postService.likePost(postId);

      setPosts(posts.map(p =>
        p._id === postId
          ? {
              ...p,
              liked: res.data.liked,
              like_count: res.data.liked
                ? p.like_count + 1
                : p.like_count - 1
            }
          : p
      ));

    } catch (err) { console.error(err); }
  };

  const toggleCommentBox = (postId) => {
    setCommentBoxOpen(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

const handleCommentSubmit = async (postId) => {
  if (!commentInput[postId]?.trim()) return;

  try {
    const res = await postService.commentPost(
      postId,
      commentInput[postId]
    );

    const newComment = res.data.comment;

    setPosts(posts.map(p => {
      if (p._id !== postId) return p;

      const updatedComments = p.comments
        ? [newComment, ...p.comments]
        : [newComment];

      return {
        ...p,
        comments: updatedComments.slice(0, 2), // keep last 2
        comment_count: p.comment_count + 1
      };
    }));

    setCommentInput({ ...commentInput, [postId]: "" });

  } catch (err) {
    console.error(err);
  }
};



  /** ⭐ LOAD ALL COMMENTS FOR A POST */
const loadAllComments = async (postId) => {
  try {
    const res = await postService.getAllComments(postId);
    const allComments = res.data.comments;

    setPosts(posts.map(p =>
      p._id === postId 
        ? { ...p, comments: allComments } 
        : p
    ));

    setShowAllComments(prev => ({ ...prev, [postId]: true }));

  } catch (err) {
    console.error(err);
  }
};

const handleDeleteComment = async (commentId, postId) => {
  try {
    await fetch(`http://localhost:3000/posts/comment/${commentId}`, {
      method: "DELETE",
      credentials: "include"
    });

   // ❌ NO setPosts here
    // ❌ NO decrement here
    // Socket will handle UI update
  } catch (err) {
    console.error(err);
  }
};


  const handleShare = async (postId) => {
    try {
      await postService.sharePost(postId);

      setPosts(posts.map(p =>
        p._id === postId
          ? { ...p, share_count: p.share_count + 1 }
          : p
      ));
    } catch (err) { console.error(err); }
  };
  /** ⭐ Copy Post Link */
const copyLink = (postId) => {
  const url = `${window.location.origin}/post/${postId}`;
  navigator.clipboard.writeText(url);
  alert("Link copied!");
};

/** ⭐ WhatsApp Share */
const shareToWhatsApp = (postId) => {
  const url = `${window.location.origin}/post/${postId}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, "_blank");
};

/** ⭐ Share to Feed (Repost) */
const shareToFeed = async (post) => {
  const caption = prompt("Add a caption to your repost:");

  if (caption === null) return; // user cancelled

  await postService.createPost({
    caption: caption + "\n\n(Reposted)",
    image: post.image
  });

  alert("Reposted to your feed!");
};


  return (
    <div className="linkedin-container">

      {/* LEFT SIDEBAR */}
      <aside className="linkedin-sidebar">
        <div className="sidebar-card profile-card">
          <img src={user?.profile_pic} className="profile-avatar-large" />
          <h2>{user?.first_name} <span className="verified-badge">✔️</span></h2>
          <p className="profile-title">
            {user?.department} {user?.graduation_year && `, ${user.graduation_year}`}
            <br />{user?.bio}
          </p>
          <div className="profile-org">🏫 SDM College of Engg & Tech , Dharwad</div>
        </div>
      </aside>


      {/* CENTER FEED */}
      <main className="linkedin-feed">

        {/* CREATE POST */}
        <div className="feed-card post-creator-card">
          <div className="post-creator-header">
            <img src={user?.profile_pic} className="profile-avatar" />
            <input
              type="text"
              placeholder="Start a post"
              className="feed-input"
              value={newPost.caption}
              onChange={handlePostChange}
            />
          </div>

          {newPost.image && (
            <div className="post-preview">
              <img src={newPost.image} />
              <button
                className="remove-image-btn"
                onClick={() => setNewPost({ ...newPost, image: null })}
              >
                ✖
              </button>
            </div>
          )}

          <div className="post-creator-actions">
            <label className="feed-action-btn">
              <input type="file" style={{ display: "none" }} onChange={handleImageUpload} />
              📷 Photo
            </label>
            <button className="feed-action-btn">🎥 Video</button>
              <button className="feed-action-btn">📝 Write article</button>
            <button className="post-submit-btn" onClick={handlePostSubmit}>
              {posting ? "Posting..." : "Post"}
            </button>

              
          </div>
        </div>


        {/* ALL POSTS */}
        {loading ? (
          <div>Loading...</div>
        ) : (
          posts.map((post) => (
            <div className="feed-card post-card" key={post._id}>

              <div className="post-header">
                <img src={post.avatar} className="profile-avatar" />
                <div>
                  <strong>{post.user}</strong>
                  <div className="time">{getRelativeTime(post.time)}</div>
                </div>
              </div>

              {post.image && (
                <div className="post-image">
                  <img src={post.image} />
                </div>
              )}

              {post.caption && <p className="post-caption">{post.caption}</p>}

              {/* ACTION BUTTONS */}
              <div className="post-actions">

                {/* LIKE */}
                <button 
                  className={`action-btn ${post.liked ? "active-like" : ""}`} 
                  onClick={() => handleLike(post._id)}
                >
                  <span className="icon">
                    <svg className="icon" viewBox="0 0 24 24"
                      fill={post.liked ? "#0a66c2" : "none"}
                      stroke={post.liked ? "#0a66c2" : "#555"}
                      strokeWidth="2">
                      <path d="M14 9V5a3 3 0 0 0-6 0v4H5v11h11l4-8V9h-6z"/>
                    </svg>
                  </span>
                  {post.like_count}
                </button>

                {/* COMMENT */}
                <button className="action-btn" onClick={() => toggleCommentBox(post._id)}>
                  <span className="icon">
                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                      <path d="M21 11.5a8.38 8.38 0 0 1-1.9 5.4 8.5 8.5 0 0 1-11.8.9L3 21l1.2-4.1A8.38 8.38 0 0 1 3 11.5 8.5 8.5 0 0 1 11.5 3 8.5 8.5 0 0 1 21 11.5z"/>
                    </svg>
                  </span>
                  {post.comment_count}
                </button>

                {/* SHARE */}
                {/* SHARE BUTTON */}
<button
  className="action-btn"
  onClick={() =>
    setSharePopup(prev => ({ ...prev, [post._id]: !prev[post._id] }))
  }
>
  <span className="icon">
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
      <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/>
      <polyline points="16 6 12 2 8 6"/>
      <line x1="12" y1="2" x2="12" y2="15"/>
    </svg>
  </span>
</button>

{/* ⭐ SHARE POPUP ⭐ */}
{sharePopup[post._id] && (
  <div className="share-popup">
    <button onClick={() => copyLink(post._id)}>🔗 Copy link</button>
    <button onClick={() => shareToFeed(post)}>📤 Share to Feed</button>
    <button onClick={() => alert("Chat sharing coming soon!")}>💬 Send in Chat</button>
    <button onClick={() => shareToWhatsApp(post._id)}>📱 WhatsApp</button>
  </div>
)}

              </div>

              {/* COMMENT INPUT BOX */}
              {commentBoxOpen[post._id] && (
                <div className="comment-box">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentInput[post._id] || ""}
                    onChange={(e) =>
                      setCommentInput({ ...commentInput, [post._id]: e.target.value })
                    }
                  />
                  <button onClick={() => handleCommentSubmit(post._id)}>Send</button>
                </div>
              )}

              {/* COMMENT LIST */}
              {post.comments && (
  <div className="post-comments">
    {(showAllComments[post._id] ? post.comments : post.comments.slice(0, 2))
      .map((c) => (
        <div key={c._id} className="comment-item" style={{ position: "relative" }}>
          <img src={c.avatar} className="comment-avatar" />

          <div>
            <strong>{c.author}</strong>
            <p>{c.content}</p>
          </div>

          {/* ✅ DELETE BUTTON (ONLY OWN COMMENTS) */}
          {(c.author === user?.first_name || post.user === user?.first_name) && (
            <span
              title="Delete comment"
              onClick={() => handleDeleteComment(c._id)}
              style={{
                position: "absolute",
                right: "8px",
                top: "8px",
                cursor: "pointer",
                color: "red",
                fontSize: "14px"
              }}
            >
              ❌
            </span>
          )}

        </div>
      ))
    }

    {/* SHOW MORE / LESS */}
    {post.comment_count > 2 && (
      !showAllComments[post._id] ? (
        <button
          className="show-more-btn"
          onClick={() => loadAllComments(post._id)}
        >
          Show more comments ↓
        </button>
      ) : (
        <button
          className="show-more-btn"
          onClick={() =>
            setShowAllComments(prev => ({ ...prev, [post._id]: false }))
          }
        >
          Show less ↑
        </button>
      )
    )}
  </div>
)}


            </div>
          ))
        )}

      </main>
      {/* RIGHT SIDEBAR */}
      <aside className="linkedin-rightbar">
        <div className="rightbar-card news-card">
          <h3>SDM News</h3>
          <ul className="news-list">
            <li><strong>Insignia'25 grand success</strong></li>
            <li><strong>Accenture selected 2 CSE Interns</strong></li>
            <li><strong>Dell selected 8 Interns</strong></li>
            <li><strong>JC Kerur Mam retired</strong></li>
            <li><strong>Dr Ramesh Chakrasali took charge as Principal</strong></li>
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default NewsFeed;  
// import React, { useState, useEffect } from 'react';
// import "../assets/css/NewsFeed.css";
// import { postService } from '../services/post.service';
// import { authService } from '../services/auth.service';
// import { uploadService } from '../services/api.service';
// import usePageTitle from '../hooks/usePageTitle';
// import { socket } from "../socket";

// const NewsFeed = () => {
//   usePageTitle('Feed');

//   const [newPost, setNewPost] = useState({ caption: '', image: null });
//   const [posts, setPosts] = useState([]);
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [posting, setPosting] = useState(false);

//   const [commentBoxOpen, setCommentBoxOpen] = useState({});
//   const [commentInput, setCommentInput] = useState({});
//   const [showAllComments, setShowAllComments] = useState({});
//   const [sharePopup, setSharePopup] = useState({});

//   // ================= INITIAL DATA =================
//   useEffect(() => {
//     async function fetchData() {
//       setLoading(true);
//       try {
//         const [postsRes, userRes] = await Promise.all([
//           postService.getPosts(),
//           authService.getProfile()
//         ]);
//         setPosts(postsRes.data.posts || []);
//         setUser(userRes.data.user);
//       } catch {}
//       setLoading(false);
//     }
//     fetchData();
//   }, []);

//   // ================= SOCKET LISTENERS =================
//   useEffect(() => {
//     socket.on("comment:new", ({ postId, comment }) => {
//       setPosts(prev =>
//         prev.map(p =>
//           p._id === postId
//             ? {
//                 ...p,
//                 comments: [comment, ...(p.comments || [])].slice(0, 2),
//                 comment_count: p.comment_count + 1
//               }
//             : p
//         )
//       );
//       setCommentBoxOpen(prev => ({ ...prev, [postId]: true }));
//     });

//     socket.on("comment:delete", ({ postId, commentId }) => {
//       setPosts(prev =>
//         prev.map(p =>
//           p._id === postId
//             ? {
//                 ...p,
//                 comments: p.comments?.filter(c => c._id !== commentId),
//                 comment_count: Math.max(p.comment_count - 1, 0)
//               }
//             : p
//         )
//       );
//     });

//     return () => {
//       socket.off("comment:new");
//       socket.off("comment:delete");
//     };
//   }, []);

//   // ================= CREATE POST =================
//   const handlePostSubmit = async () => {
//     if (!newPost.caption.trim() && !newPost.image) return;
//     setPosting(true);

//     try {
//       let imageUrl = null;
//       if (newPost.image) {
//         const res = await fetch(newPost.image);
//         const blob = await res.blob();
//         const uploadRes = await uploadService.uploadPostImage(blob);
//         imageUrl = uploadRes.data.url;
//       }

//       const res = await postService.createPost({
//         caption: newPost.caption,
//         image: imageUrl
//       });

//       setPosts([res.data.post, ...posts]);
//       setNewPost({ caption: "", image: null });
//     } catch {}
//     setPosting(false);
//   };

//   // ================= COMMENT =================
//   const handleCommentSubmit = async (postId) => {
//     if (!commentInput[postId]?.trim()) return;
//     try {
//       await postService.commentPost(postId, commentInput[postId]);
//       setCommentInput({ ...commentInput, [postId]: "" });
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleDeleteComment = async (commentId) => {
//     if (!window.confirm("Delete this comment?")) return;
//     try {
//       await postService.deleteComment(commentId);
//     } catch {
//       alert("Not allowed to delete this comment");
//     }
//   };

//   const loadAllComments = async (postId) => {
//     const res = await postService.getAllComments(postId);
//     setPosts(posts.map(p =>
//       p._id === postId ? { ...p, comments: res.data.comments } : p
//     ));
//     setShowAllComments(prev => ({ ...prev, [postId]: true }));
//   };

//   // ================= RENDER =================
//   return (
//     <div className="linkedin-container">
//       <main className="linkedin-feed">

//         {loading ? <div>Loading...</div> : posts.map(post => (
//           <div className="feed-card post-card" key={post._id}>

//             <strong>{post.user}</strong>

//             {post.comments && (
//               <div className="post-comments">
//                 {(showAllComments[post._id] ? post.comments : post.comments.slice(0, 2))
//                   .map(c => (
//                     <div key={c._id} className="comment-item">
//                       <img src={c.avatar} className="comment-avatar" />
//                       <div>
//                         <strong>{c.author}</strong>
//                         <p>{c.content}</p>

//                         {(post.authorId === user?._id || c.authorId === user?._id) && (
//                           <button
//                             className="delete-comment-btn"
//                             onClick={() => handleDeleteComment(c._id)}
//                           >
//                             ❌
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   ))
//                 }

//                 {post.comment_count > 2 && !showAllComments[post._id] && (
//                   <button onClick={() => loadAllComments(post._id)}>
//                     Show more comments ↓
//                   </button>
//                 )}
//               </div>
//             )}

//             <div className="comment-box">
//               <input
//                 placeholder="Write a comment..."
//                 value={commentInput[post._id] || ""}
//                 onChange={(e) =>
//                   setCommentInput({ ...commentInput, [post._id]: e.target.value })
//                 }
//               />
//               <button onClick={() => handleCommentSubmit(post._id)}>Send</button>
//             </div>

//           </div>
//         ))}
//       </main>
//     </div>
//   );
// };

// export default NewsFeed;
