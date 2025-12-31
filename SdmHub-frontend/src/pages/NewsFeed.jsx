import { useState, useEffect } from "react";
import "../assets/css/NewsFeed.css";
import "../assets/css/style.css";
import { postService } from "../services/post.service";
import { authService } from "../services/auth.service";
import { uploadService } from "../services/api.service";
import usePageTitle from "../hooks/usePageTitle";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import TechNewsCard from "./TechNewsCard";

const NewsFeed = () => {
  usePageTitle("Feed");

  const [newPost, setNewPost] = useState({ caption: "", image: null });
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const [commentBoxOpen, setCommentBoxOpen] = useState({});
  const [commentInput, setCommentInput] = useState({});
  const [showAllComments, setShowAllComments] = useState({});

  const navigate = useNavigate();

  /* ---------------- INITIAL FETCH ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const [postsRes, userRes] = await Promise.all([
          postService.getPosts(),
          authService.getProfile()
        ]);
        setPosts(postsRes.data.posts || []);
        setUser(userRes.data.user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------------- SOCKET ---------------- */
  useEffect(() => {
    socket.on("comment:new", ({ postId, comment }) => {
      setPosts(prev =>
        prev.map(p =>
          p.engagementPostId === postId
            ? {
                ...p,
                comments: [comment, ...(p.comments || [])].slice(0, 2),
                comment_count: p.comment_count + 1
              }
            : p
        )
      );
    });

    socket.on("comment:delete", ({ postId, commentId }) => {
      setPosts(prev =>
        prev.map(p =>
          p.engagementPostId === postId
            ? {
                ...p,
                comments: p.comments?.filter(c => c._id !== commentId),
                comment_count: Math.max(p.comment_count - 1, 0)
              }
            : p
        )
      );
    });

    return () => {
      socket.off("comment:new");
      socket.off("comment:delete");
    };
  }, []);

  /* ---------------- HELPERS ---------------- */
  function getRelativeTime(date) {
    if (!date) return "";
    const now = new Date();
    const postDate = new Date(date);
    const diff = Math.floor((now - postDate) / 1000);
    if (diff < 60) return `${diff} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return postDate.toLocaleDateString();
  }

  const handlePostChange = e =>
    setNewPost({ ...newPost, caption: e.target.value });

  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setNewPost({ ...newPost, image: reader.result });
    reader.readAsDataURL(file);
  };

  const handlePostSubmit = async () => {
  if (!newPost.caption.trim() && !newPost.image) return;
  setPosting(true);

  try {
    let imageUrl = null;

    if (newPost.image) {
      const blob = await (await fetch(newPost.image)).blob();
      const uploadRes = await uploadService.uploadPostImage(blob);
      imageUrl = uploadRes.data.url;
    }

    const res = await postService.createPost({
      caption: newPost.caption,
      image: imageUrl
    });

    const rawPost = res.data.post;

    // ✅ FORMAT IT EXACTLY LIKE FEED EXPECTS
    const formattedPost = {
      _id: rawPost._id,
      engagementPostId: rawPost._id,
      isRepost: false,

      user: user.first_name,
      avatar: user.profile_pic,
      caption: rawPost.caption,
      image: rawPost.content_url,
      time: rawPost.created_at,

      like_count: 0,
      comment_count: 0,
      share_count: 0,
      liked: false,
      comments: []
    };

    setPosts(prev => [formattedPost, ...prev]);
    setNewPost({ caption: "", image: null });

  } catch (err) {
    console.error(err);
  } finally {
    setPosting(false);
  }
};

  const handleLike = async id => {
    const res = await postService.likePost(id);
    setPosts(prev =>
      prev.map(p =>
        p.engagementPostId === id
          ? {
              ...p,
              liked: res.data.liked,
              like_count: res.data.liked
                ? p.like_count + 1
                : p.like_count - 1
            }
          : p
      )
    );
  };

  const toggleCommentBox = id =>
    setCommentBoxOpen(prev => ({ ...prev, [id]: !prev[id] }));

  const handleCommentSubmit = async (postId) => {
  if (!commentInput[postId]?.trim()) return;

  try {
    await postService.commentPost(postId, commentInput[postId]);

    // ✅ DO NOT update posts here
    // Socket will handle UI update

    setCommentInput(prev => ({ ...prev, [postId]: "" }));
  } catch (err) {
    console.error(err);
  }
};


  const loadAllComments = async id => {
    const res = await postService.getAllComments(id);
    setPosts(prev =>
      prev.map(p =>
        p.engagementPostId === id
          ? { ...p, comments: res.data.comments }
          : p
      )
    );
    setShowAllComments(prev => ({ ...prev, [id]: true }));
  };

  const shareToFeed = async post => {
    const caption = prompt("Add your thoughts (optional):");
    if (caption === null) return;
    await postService.repostPost(post.engagementPostId, caption);
    window.location.reload();
  };

  /* ---------------- RENDER ---------------- */
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

        {loading ? (
          <div>Loading...</div>
        ) : (
          posts.map(post => {
            const isRepost = post.isRepost;
            const content = isRepost ? post.originalPost : post;

            return (
              <div className="feed-card post-card" key={post._id}>
                {/* HEADER */}
                <div className="post-header">
                  <img src={content.avatar} className="profile-avatar" />
                  <div>
                    <strong>{content.user}</strong>
                    <div className="time">
                      {getRelativeTime(content.time)}
                    </div>
                    {isRepost && (
                      <div style={{ fontSize: "13px", color: "#777" }}>
                        🔁 Reposted by {post.repostedBy}
                      </div>
                    )}
                  </div>
                </div>

                {/* REPOST CAPTION */}
                {isRepost && post.repostCaption && (
                  <p className="post-caption" style={{ fontStyle: "italic" }}>
                    {post.repostCaption}
                  </p>
                )}

                {/* IMAGE */}
                {content.image && (
                  <div
                    className="post-image"
                    onClick={() =>
                      navigate(`/post/${post.engagementPostId}`)
                    }
                  >
                    <img src={content.image} />
                  </div>
                )}

                {/* CAPTION */}
                {content.caption && (
                  <p
                    className="post-caption"
                    onClick={() =>
                      navigate(`/post/${post.engagementPostId}`)
                    }
                  >
                    {content.caption}
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

                {/* COMMENTS */}
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
            );
          })
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
