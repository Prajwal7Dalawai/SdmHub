import { useState, useEffect } from "react";
import "../assets/css/NewsFeed.css";
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
    async function fetchData() {
      try {
        const [postsRes, userRes] = await Promise.all([
          postService.getPosts(),
          authService.getProfile(),
        ]);
        setPosts(postsRes.data.posts || []);
        setUser(userRes.data.user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  /* ---------------- SOCKET ---------------- */
  useEffect(() => {
    socket.connect();

    socket.on("comment:new", ({ postId, comment }) => {
      setPosts(prev =>
        prev.map(p =>
          p._id === postId
            ? {
                ...p,
                comments: [comment, ...(p.comments || [])].slice(0, 2),
                comment_count: p.comment_count + 1,
              }
            : p
        )
      );
    });

    socket.on("comment:delete", ({ postId, commentId }) => {
      setPosts(prev =>
        prev.map(p =>
          p._id === postId
            ? {
                ...p,
                comments: p.comments.filter(c => c._id !== commentId),
                comment_count: p.comment_count - 1,
              }
            : p
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  /* ---------------- HELPERS ---------------- */
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
        image: imageUrl,
      });
      setPosts([res.data.post, ...posts]);
      setNewPost({ caption: "", image: null });
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async engagementPostId => {
    const res = await postService.likePost(engagementPostId);
    setPosts(posts =>
      posts.map(p =>
        p.engagementPostId === engagementPostId
          ? {
              ...p,
              liked: res.data.liked,
              like_count: res.data.liked
                ? p.like_count + 1
                : p.like_count - 1,
            }
          : p
      )
    );
  };

  const toggleCommentBox = id =>
    setCommentBoxOpen(prev => ({ ...prev, [id]: !prev[id] }));

  const handleCommentSubmit = async postId => {
    if (!commentInput[postId]?.trim()) return;
    const res = await postService.commentPost(postId, commentInput[postId]);
    const comment = res.data.comment;

    setPosts(posts =>
      posts.map(p =>
        p._id === postId
          ? {
              ...p,
              comments: [comment, ...(p.comments || [])].slice(0, 2),
              comment_count: p.comment_count + 1,
            }
          : p
      )
    );
    setCommentInput(prev => ({ ...prev, [postId]: "" }));
  };

  const loadAllComments = async postId => {
    const res = await postService.getAllComments(postId);
    setPosts(posts =>
      posts.map(p =>
        p._id === postId ? { ...p, comments: res.data.comments } : p
      )
    );
    setShowAllComments(prev => ({ ...prev, [postId]: true }));
  };

  const handleDeleteComment = async commentId => {
    await fetch(`http://localhost:3000/posts/comment/${commentId}`, {
      method: "DELETE",
      credentials: "include",
    });
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="linkedin-container">

      {/* CENTER FEED */}
      <main className="linkedin-feed">

        {/* CREATE POST */}
        <div className="feed-card post-creator-card">
          <input
            placeholder="Start a post"
            value={newPost.caption}
            onChange={handlePostChange}
          />
          <input type="file" onChange={handleImageUpload} />
          <button onClick={handlePostSubmit}>
            {posting ? "Posting..." : "Post"}
          </button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          posts.map(post => (
            <div className="feed-card post-card" key={post._id}>

              <p onClick={() => navigate(`/post/${post.engagementPostId}`)}>
                {post.caption}
              </p>

              <div className="post-actions">
                <button onClick={() => handleLike(post.engagementPostId)}>
                  👍 {post.like_count}
                </button>
                <button onClick={() => toggleCommentBox(post.engagementPostId)}>
                  💬 {post.comment_count}
                </button>
              </div>

              {commentBoxOpen[post.engagementPostId] && (
                <div>
                  <input
                    value={commentInput[post.engagementPostId] || ""}
                    onChange={e =>
                      setCommentInput({
                        ...commentInput,
                        [post.engagementPostId]: e.target.value,
                      })
                    }
                  />
                  <button
                    onClick={() =>
                      handleCommentSubmit(post.engagementPostId)
                    }
                  >
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
              onClick={() => handleDeleteComment(c._id, post._id)}
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


              {post.comment_count > 2 && !showAllComments[post._id] && (
                <button onClick={() => loadAllComments(post._id)}>
                  Show more
                </button>
              )}
            </div>
          ))
        )}
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="linkedin-rightbar">
        <TechNewsCard />
      </aside>
    </div>
  );
};

export default NewsFeed;
