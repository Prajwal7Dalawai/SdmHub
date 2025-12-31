const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/authMiddleware");

const Post = require("../models/postSchema");
const Like = require("../models/likeSchema");
const Comment = require("../models/commentSchema");
const Notification = require("../models/notificationSchema");

const { getIO } = require("../socket");

/* ======================================================
   GET ALL POSTS (ORIGINAL + REPOST)
====================================================== */
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const posts = await Post.find({
      visibility: "visible",
      postType: { $in: ["original", "repost"] }
    })
      .sort({ created_at: -1 })
      .populate("author_id", "first_name profile_pic")
      .populate({
        path: "originalPost",
        populate: {
          path: "author_id",
          select: "first_name profile_pic"
        }
      });

    const formattedPosts = await Promise.all(
      posts.map(async (post) => {
        const isRepost = post.postType === "repost" && post.originalPost;
        const engagementPostId = isRepost ? post.originalPost._id : post._id;

        const comments = await Comment.find({ post_id: engagementPostId })
          .sort({ created_at: -1 })
          .limit(2)
          .populate("author_id", "first_name profile_pic");

        const liked = await Like.findOne({
          user_id: userId,
          post_id: engagementPostId
        });

        if (isRepost) {
          return {
            _id: post._id,
            isRepost: true,
            repostedBy: post.author_id.first_name,
            repostCaption: post.caption || "",
            engagementPostId,

            originalPost: {
              _id: post.originalPost._id,
              user: post.originalPost.author_id.first_name,
              avatar: post.originalPost.author_id.profile_pic,
              caption: post.originalPost.caption,
              image: post.originalPost.content_url,
              time: post.originalPost.created_at,
              like_count: post.originalPost.like_count,
              comment_count: post.originalPost.comment_count,
              share_count: post.originalPost.share_count,
              liked: !!liked,
              comments: comments.map(c => ({
                _id: c._id,
                content: c.content,
                author: c.author_id.first_name,
                avatar: c.author_id.profile_pic,
                time: c.created_at
              }))
            }
          };
        }

        return {
          _id: post._id,
          isRepost: false,
          engagementPostId,
          user: post.author_id.first_name,
          avatar: post.author_id.profile_pic,
          caption: post.caption,
          image: post.content_url,
          time: post.created_at,
          like_count: post.like_count,
          comment_count: post.comment_count,
          share_count: post.share_count,
          liked: !!liked,
          comments: comments.map(c => ({
            _id: c._id,
            content: c.content,
            author: c.author_id.first_name,
            avatar: c.author_id.profile_pic,
            time: c.created_at
          }))
        };
      })
    );

    res.json({ posts: formattedPosts });
  } catch (err) {
    console.error("FETCH POSTS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

/* ======================================================
   CREATE POST
====================================================== */
router.post("/", auth, async (req, res) => {
  try {
    const { caption, image } = req.body;

    const post = await Post.create({
      author_id: req.user._id,
      caption,
      content_url: image,
      created_at: new Date(),
      visibility: "visible",
      postType: "original"
    });

    res.status(201).json({ post });
  } catch (err) {
    console.error("CREATE POST ERROR:", err);
    res.status(500).json({ error: "Post creation failed" });
  }
});

/* ======================================================
   LIKE / UNLIKE POST
====================================================== */
router.post("/like/:postId", auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const existing = await Like.findOne({ user_id: userId, post_id: postId });

    if (existing) {
      await Like.deleteOne({ _id: existing._id });
      await Post.findByIdAndUpdate(postId, { $inc: { like_count: -1 } });
      return res.json({ liked: false });
    }

    await Like.create({ user_id: userId, post_id: postId });
    await Post.findByIdAndUpdate(postId, { $inc: { like_count: 1 } });

    res.json({ liked: true });
  } catch (err) {
    console.error("LIKE ERROR:", err);
    res.status(500).json({ error: "Like failed" });
  }
});

/* ======================================================
   COMMENT POST (SOCKET SAFE)
====================================================== */
router.post("/comment/:postId", auth, async (req, res) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;

    if (!content.trim()) {
      return res.status(400).json({ error: "Empty comment" });
    }

    let comment = await Comment.create({
      post_id: postId,
      author_id: req.user._id,
      content,
      created_at: new Date()
    });

    comment = await comment.populate("author_id", "first_name profile_pic");

    await Post.findByIdAndUpdate(postId, { $inc: { comment_count: 1 } });

    const io = getIO();
    io.emit("comment:new", {
      postId,
      authorId: req.user._id.toString(),
      comment: {
        _id: comment._id,
        content: comment.content,
        author: comment.author_id.first_name,
        avatar: comment.author_id.profile_pic,
        time: comment.created_at
      }
    });

    res.json({
      comment: {
        _id: comment._id,
        content: comment.content,
        author: comment.author_id.first_name,
        avatar: comment.author_id.profile_pic,
        time: comment.created_at
      }
    });
  } catch (err) {
    console.error("COMMENT ERROR:", err);
    res.status(500).json({ error: "Comment failed" });
  }
});

/* ======================================================
   DELETE COMMENT
====================================================== */
router.delete("/comment/:commentId", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Not found" });

    const post = await Post.findById(comment.post_id);

    const isOwner =
      comment.author_id.equals(req.user._id) ||
      post.author_id.equals(req.user._id);

    if (!isOwner) return res.status(403).json({ error: "Forbidden" });

    await Comment.deleteOne({ _id: comment._id });
    await Post.findByIdAndUpdate(comment.post_id, {
      $inc: { comment_count: -1 }
    });

    getIO().emit("comment:delete", {
      postId: comment.post_id,
      commentId: comment._id
    });

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE COMMENT ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

/* ======================================================
   REPOST (SINGLE SOURCE OF TRUTH)
====================================================== */
router.post("/repost/:postId", auth, async (req, res) => {
  try {
    const { caption } = req.body;
    const { postId } = req.params;

    const original = await Post.findById(postId);
    if (!original) return res.status(404).json({ error: "Post not found" });
    if (original.postType === "repost")
      return res.status(400).json({ error: "Cannot repost a repost" });

    const already = await Post.findOne({
      author_id: req.user._id,
      originalPost: postId
    });

    if (already) return res.status(400).json({ error: "Already reposted" });

    await Post.create({
      author_id: req.user._id,
      caption: caption || "",
      postType: "repost",
      originalPost: postId,
      created_at: new Date()
    });

    await Post.findByIdAndUpdate(postId, { $inc: { share_count: 1 } });

    res.json({ success: true });
  } catch (err) {
    console.error("REPOST ERROR:", err);
    res.status(500).json({ error: "Repost failed" });
  }
});

// ----------------------
// GET POSTS BY USER (ORIGINAL + REPOSTS)
// ----------------------
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const posts = await Post.find({
      author_id: userId,
      visibility: "visible",
      postType: { $in: ["original", "repost"] }
    })
      .sort({ created_at: -1 })
      .populate("author_id", "first_name profile_pic")
      .populate({
        path: "originalPost",
        populate: {
          path: "author_id",
          select: "first_name profile_pic"
        }
      });

    res.json({ posts });
  } catch (err) {
    console.error("FETCH USER POSTS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch user posts" });
  }
});


module.exports = router;
