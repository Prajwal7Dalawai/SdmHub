// routes/posts.js
const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/authMiddleware');
const Post = require('../models/postSchema');
const User = require('../models/userSchema');
const Like = require('../models/likeSchema');
const Comment = require('../models/commentSchema');
const { getIO } = require("../socket");


// ----------------------
// GET ALL POSTS + LIKED STATUS
// ----------------------
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ visibility: 'visible' })
      .sort({ created_at: -1 })
      .populate('author_id', 'first_name profile_pic');

    const userId =
      req.session?.passport?.user ||
      req.session?.user?.id ||
      req.user?._id;

    const formattedPosts = await Promise.all(
      posts.map(async (post) => {

        // ⭐ FETCH LAST 2 COMMENTS
        const comments = await Comment.find({ post_id: post._id })
          .sort({ created_at: -1 })
          .limit(2)
          .populate("author_id", "first_name profile_pic");

        // ⭐ CHECK WHETHER USER LIKED THE POST
        const liked = await Like.findOne({
          user_id: userId,
          post_id: post._id
        });
        const totalComments = await Comment.countDocuments({ post_id: post._id });

        return {
          _id: post._id,
          user: post.author_id?.first_name || "Unknown",
          avatar: post.author_id?.profile_pic || "",
          caption: post.caption,
          image: post.content_url,
          time: post.created_at,

          like_count: post.like_count,
          comment_count: totalComments,
          share_count: post.share_count,
          liked: !!liked,

          // ⭐ SEND COMMENTS TO FRONTEND
          comments: comments.map(c => ({
            _id: c._id,
            content: c.content,
            author: c.author_id?.first_name,
            avatar: c.author_id?.profile_pic
          }))
        };
      })
    );

    res.json({ posts: formattedPosts });

  } catch (err) {
    console.error("POST FETCH ERROR:", err);
    res.status(500).json({ error: 'Failed to fetch posts', details: err.message });
  }
});

// ----------------------
// CREATE NEW POST
// ----------------------
router.post('/', async (req, res) => {
  try {
    const { caption, image } = req.body;

    const userId =
      req.session?.passport?.user ||
      req.session?.user?.id ||
      req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const newPost = new Post({
      author_id: userId,
      caption,
      content_url: image,
      created_at: new Date(),
      visibility: "visible"
    });

    await newPost.save();
    res.status(201).json({ post: newPost });

  } catch (err) {
    console.error("POST CREATE ERROR:", err);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// ----------------------
// LIKE / UNLIKE POST
// ----------------------
router.post('/like/:postId', async (req, res) => {
  try {
    const userId =
      req.session?.passport?.user ||
      req.session?.user?.id ||
      req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const postId = req.params.postId;

    const existing = await Like.findOne({ user_id: userId, post_id: postId });

    if (existing) {
      // Unlike
      await Like.deleteOne({ _id: existing._id });
      await Post.findByIdAndUpdate(postId, { $inc: { like_count: -1 } });
      return res.json({ liked: false });
    }

    // Like
    await Like.create({ user_id: userId, post_id: postId });
    await Post.findByIdAndUpdate(postId, { $inc: { like_count: 1 } });

    return res.json({ liked: true });

  } catch (err) {
    console.error("LIKE ERROR:", err);
    res.status(500).json({ error: "Like error", details: err.message });
  }
});

// ----------------------
// SHARE POST
// ----------------------
router.post('/share/:postId', async (req, res) => {
  try {
    const userId =
      req.session?.passport?.user ||
      req.session?.user?.id ||
      req.user?._id;

    const postId = req.params.postId;

    if (!userId) {
      return res.status(401).json({ error: "Not logged in" });
    }

    await Post.findByIdAndUpdate(postId, { $inc: { share_count: 1 } });

    res.json({ success: true });

  } catch (err) {
    console.error("SHARE ERROR:", err);
    res.status(500).json({ error: "Share error", details: err.message });
  }
});

// ----------------------
// COMMENT POST
// ----------------------
router.post('/comment/:postId', async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.postId;

    const userId =
      req.session?.passport?.user ||
      req.session?.user?.id ||
      req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Comment cannot be empty" });
    }

    let newComment = await Comment.create({
      post_id: postId,
      author_id: userId,
      content,
      created_at: new Date(),
    });

    newComment = await newComment.populate(
      "author_id",
      "first_name profile_pic"
    );

    await Post.findByIdAndUpdate(postId, {
      $inc: { comment_count: 1 }
    });

    const io = getIO();
    // console.log("SOCKET EMIT: comment:new", postId);
    io.emit("comment:new", {
    postId,
    comment: {
      _id: newComment._id,
      content: newComment.content,
      author: newComment.author_id.first_name,
      avatar: newComment.author_id.profile_pic,
      time: newComment.created_at
    }
   });

    res.json({
      success: true,
      comment: {
        _id: newComment._id,
        content: newComment.content,
        author: newComment.author_id.first_name,
        avatar: newComment.author_id.profile_pic,
        time: newComment.created_at
      }
    });

  } catch (err) {
    console.error("COMMENT ERROR:", err);
    res.status(500).json({ error: 'Comment error' });
  }
});


router.get("/comments/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;

    const comments = await Comment.find({ post_id: postId })
      .sort({ created_at: -1 })
      .populate("author_id", "first_name profile_pic");

    const formatted = comments.map((c) => ({
      _id: c._id,
      content: c.content,
      time: c.created_at,
      author: c.author_id?.first_name || "User",
      avatar: c.author_id?.profile_pic || "",
    }));

    res.json({ comments: formatted });
  } catch (err) {
    console.error("COMMENT FETCH ERROR:", err);
    res.status(500).json({ error: "Failed to load comments" });
  }
});

router.delete("/comment/:commentId", async (req, res) => {
  try {
    const userId =
      req.session?.passport?.user ||
      req.session?.user?.id ||
      req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // find the post
const post = await Post.findById(comment.post_id);
if (!post) {
  return res.status(404).json({ error: "Post not found" });
}

const isCommentOwner =
  comment.author_id.toString() === userId.toString();

const isPostOwner =
  post.author_id.toString() === userId.toString();

if (!isCommentOwner && !isPostOwner) {
  return res.status(403).json({ error: "Not allowed" });
}


    await Comment.deleteOne({ _id: comment._id });

    await Post.findByIdAndUpdate(comment.post_id, {
      $inc: { comment_count: -1 }
    });

    // 🔥 SOCKET EMIT
   const io = getIO();

// emit to everyone EXCEPT the user who deleted
io.emit("comment:delete", {
  postId: comment.post_id,
  commentId: comment._id
});





    res.json({ success: true });
  } catch (err) {
    console.error("DELETE COMMENT ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;
