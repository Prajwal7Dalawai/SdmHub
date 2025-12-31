import { useState, useEffect } from 'react'
import "../assets/css/NewsFeed.css";
import { postService } from '../services/post.service';
import { authService } from '../services/auth.service';
import { uploadService } from '../services/api.service';
import usePageTitle from '../hooks/usePageTitle';
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import TechNewsCard from './TechNewsCard';
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
  const navigate = useNavigate();

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

  const handleLike = async (engagementPostId) => {
    try {
      const res = await postService.likePost(engagementPostId);

      setPosts(posts.map(p => {
        if (p.engagementPostId === engagementPostId) {
          return {
            ...p,
            like_count: res.data.liked
              ? p.like_count + 1
              : p.like_count - 1,
            liked: res.data.liked
          };
        }
        return p;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCommentBox = (engagementPostId) => {
    setCommentBoxOpen(prev => ({
      ...prev,
      [engagementPostId]: !prev[engagementPostId]
    }));
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

  const shareToFeed = async (post) => {
    const caption = prompt("Add your thoughts (optional):");
    if (caption === null) return;

    await postService.repostPost(post.engagementPostId, caption);
    window.location.reload();
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
              <input type="file" hidden onChange={handleImageUpload} />
              📷 Photo
            </label>
            <button className="post-submit-btn" onClick={handlePostSubmit}>
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>

        {/* POSTS */}
        {loading ? (
          <div>Loading...</div>
        ) : (
          posts.map((post) => (
            <div className="feed-card post-card" key={post._id}>

              {/* HEADER */}
              <div className="post-header">
                <img src={post.avatar} className="profile-avatar" />
                <div>
                  <strong>{post.user}</strong>
                  <div className="time">{getRelativeTime(post.time)}</div>
                </div>
              </div>

              {/* IMAGE (ONLY THIS OPENS DETAIL PAGE) */}
              {post.image && (
                <div
                  className="post-image"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/post/${post.engagementPostId}`)}
                >
                  <img src={post.image} />
                </div>
              )}

              {/* CAPTION (OPTIONAL CLICK) */}
              {post.caption && (
                <p
                  className="post-caption"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/post/${post.engagementPostId}`)}
                >
                  {post.caption}
                </p>
              )}

              {/* ACTIONS */}
              <div className="post-actions">
                <button
                  className={`action-btn ${post.liked ? "active-like" : ""}`}
                  onClick={() => handleLike(post.engagementPostId)}
                >
                  👍 {post.like_count}
                </button>

                <button
                  className="action-btn"
                  onClick={() => toggleCommentBox(post.engagementPostId)}
                >
                  💬 {post.comment_count}
                </button>

                <button
                  className="action-btn"
                  onClick={() => shareToFeed(post)}
                >
                  🔁 Repost
                </button>
              </div>

              {/* COMMENT INPUT */}
              {commentBoxOpen[post.engagementPostId] && (
                <div className="comment-box">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentInput[post.engagementPostId] || ""}
                    onChange={(e) =>
                      setCommentInput({
                        ...commentInput,
                        [post.engagementPostId]: e.target.value
                      })
                    }
                  />
                  <button onClick={() => handleCommentSubmit(post.engagementPostId)}>
                    Send
                  </button>
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
        <TechNewsCard />
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
