import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { postService } from "../services/post.service";
import "../assets/css/PostDetail.css";

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [liked, setLiked] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [loading, setLoading] = useState(true);

  // ================= FETCH POST =================
  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await postService.getSinglePost(postId);
        setPost(res.data.post);
        setComments(res.data.comments);
        setLiked(res.data.liked);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    fetchPost();
  }, [postId]);

  // ================= LIKE =================
  const handleLike = async () => {
    try {
      const res = await postService.likePost(post._id);
      setLiked(res.data.liked);
      setPost(prev => ({
        ...prev,
        like_count: res.data.liked
          ? prev.like_count + 1
          : prev.like_count - 1
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // ================= COMMENT =================
  const handleCommentSubmit = async () => {
    if (!commentInput.trim()) return;

    try {
      const res = await postService.commentPost(post._id, commentInput);

      setComments(prev => [
        {
          ...res.data.comment,
          author_id: res.data.comment.author_id
        },
        ...prev
      ]);

      setPost(prev => ({
        ...prev,
        comment_count: prev.comment_count + 1
      }));

      setCommentInput("");
    } catch (err) {
      console.error(err);
    }
  };

  // ================= REPOST =================
  const handleRepost = async () => {
    const caption = prompt("Add your thoughts (optional):");
    if (caption === null) return;

    try {
      await postService.repostPost(post._id, caption);
      alert("Post reposted to your feed");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading post...</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div className="post-detail-container">
      <div className="post-detail-card">

        {/* CLOSE BUTTON */}
        <button
          className="close-btn"
          onClick={() => navigate("/feed")}
        >
          ✖
        </button>

        {/* HEADER */}
        <div className="post-header">
          <img
            src={post.author_id?.profile_pic}
            className="profile-avatar"
          />
          <strong>{post.author_id?.first_name}</strong>
        </div>

        {/* IMAGE */}
        {post.content_url && (
          <img
            src={post.content_url}
            className="post-detail-image"
          />
        )}

        {/* CAPTION */}
        <p className="post-caption">{post.caption}</p>

        

        {/* ACTION BUTTONS */}
        <div className="post-actions">
          <button
            className={`action-btn ${liked ? "active-like" : ""}`}
            onClick={handleLike}
          >
            👍 Like
          </button>

          <button className="action-btn">
            💬 Comment
          </button>

          <button
            className="action-btn"
            onClick={handleRepost}
          >
            🔁 Repost
          </button>
        </div>

        {/* COMMENT INPUT */}
        <div className="comment-box">
          <input
            type="text"
            placeholder="Write a comment..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
          />
          <button onClick={handleCommentSubmit}>
            Send
          </button>
        </div>

        {/* COMMENTS */}
        <div className="post-comments">
          {comments.map(c => (
            <div key={c._id} className="comment-item">
              <img
                src={c.author_id?.profile_pic}
                className="comment-avatar"
              />
              <div>
                <strong>{c.author_id?.first_name}</strong>
                <p>{c.content}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default PostDetail;
