// routes/posts.js
const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/authMiddleware');
const Post = require('../models/postSchema');
const User = require('../models/userSchema');
const Like = require('../models/likeSchema');
const Comment = require('../models/commentSchema');
const { getIO } = require("../socket");

const Notification = require("../models/notificationSchema");


// ----------------------
// GET ALL POSTS + LIKED STATUS (also last 2 comments)
// ----------------------
router.get('/', auth, async (req, res) => {
  try {
    const userId =
      req.session?.passport?.user ||
      req.session?.user?.id ||
      req.user?._id;

    const posts = await Post.find({
      visibility: 'visible',
      postType: { $in: ['original', 'repost'] }
    })
      .sort({ created_at: -1 })
      .populate('author_id', 'first_name profile_pic')
      .populate({
        path: 'originalPost',
        populate: {
          path: 'author_id',
          select: 'first_name profile_pic'
        }
      });

    const formattedPosts = await Promise.all(
      posts.map(async (post) => {

        const isRepost =
          post.postType === 'repost' && post.originalPost;

          const engagementPostId = post.originalPost._id;

        // ⭐ fetch comments
        const comments = await Comment.find({
          post_id: engagementPostId
        })
          .sort({ created_at: -1 })
          .limit(2)
          .populate('author_id', 'first_name profile_pic');

        // ⭐ liked?
        const liked = await Like.findOne({
          user_id: userId,
          post_id: engagementPostId
        });

        // ================== REPOST ==================
        if (isRepost) {
          return {
            _id: post._id,
            isRepost: true,

            repostedBy: post.author_id?.first_name || 'User',
            repostCaption: post.caption || '',

            engagementPostId,

            originalPost: {
              _id: post.originalPost._id,
              user: post.originalPost.author_id?.first_name || 'Unknown',
              avatar: post.originalPost.author_id?.profile_pic || '',
              caption: post.originalPost.caption,
              image: post.originalPost.content_url,
              time: post.originalPost.created_at,

              like_count: post.originalPost.like_count || 0,
              comment_count: post.originalPost.comment_count || 0,
              share_count: post.originalPost.share_count || 0,
              liked: !!liked,

              comments: comments.map(c => ({
                _id: c._id,
                content: c.content,
                author: c.author_id?.first_name,
                avatar: c.author_id?.profile_pic
              }))
            }
          };
        }

        // ================== ORIGINAL ==================        const totalComments = await Comment.countDocuments({ post_id: post._id });

        return {
          _id: post._id,
          isRepost: false,

          engagementPostId,

          user: post.author_id?.first_name || 'Unknown',
          avatar: post.author_id?.profile_pic || '',
          caption: post.caption,
          image: post.content_url,
          time: post.created_at,

          like_count: post.like_count || 0,
          comment_count: post.comment_count || 0,
          share_count: post.share_count || 0,
          liked: !!liked,

          comments: comments.map(c => ({
            _id: c._id,
            content: c.content,
            author: c.author_id?.first_name || 'User',
            avatar: c.author_id?.profile_pic || ''
          }))
        };
      })
    );

    res.json({ posts: formattedPosts });

  } catch (err) {
    console.error('POST FETCH ERROR:', err);
    res.status(500).json({
      error: 'Failed to fetch posts',
      details: err.message
    });
  }
});

// ----------------------
// GET USER POSTS (ORIGINAL + REPOSTS)
// ----------------------
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const posts = await Post.find({
      author_id: userId,
      visibility: 'visible'
    })
      .sort({ created_at: -1 })
      .populate('author_id', 'first_name profile_pic')
      .populate({
        path: "originalPost",
        populate: {
          path: "author_id",
          select: "first_name profile_pic"
        }
      });

    res.json({ posts });

  } catch (err) {
    console.error("USER POSTS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch user posts" });
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
// ✅ LIKE / UNLIKE POST + ✅ LIKE NOTIFICATION (FIXED)
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
      // ✅ UNLIKE
      await Like.deleteOne({ _id: existing._id });
      await Post.findByIdAndUpdate(postId, { $inc: { like_count: -1 } });
      return res.json({ liked: false });
    }

    // ✅ LIKE
    await Like.create({ user_id: userId, post_id: postId });

    const post = await Post.findByIdAndUpdate(
      postId,
      { $inc: { like_count: 1 } },
      { new: true }
    );

    // ✅ SEND LIKE NOTIFICATION
    if (post && String(post.author_id) !== String(userId)) {
      const existingNotif = await Notification.findOne({
        sender_id: userId,
        receiver_id: post.author_id,
        target_id: postId,
        type: "LIKE"
      });

      if (!existingNotif) {
        await Notification.create({
          sender_id: userId,
          receiver_id: post.author_id,
          message: `${req.session.user?.first_name} liked your post`,
          type: "LIKE",
          target_id: postId
        });

        // ✅ REAL-TIME SOCKET NOTIFICATION
        if (global.io) {
          global.io.to(String(post.author_id)).emit("newNotification");
        }
      }
    }

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

// GET SINGLE POST (FIXED FOR REPOSTS)
router.get("/:postId", async (req, res) => {
  try {
    const { postId } = req.params;

    const userId =
      req.session?.passport?.user ||
      req.session?.user?.id ||
      req.user?._id;

    let post = await Post.findById(postId)
      .populate("author_id", "first_name profile_pic")
      .populate({
        path: "originalPost",
        populate: {
          path: "author_id",
          select: "first_name profile_pic"
        }
      });

    // 🔁 IF THIS IS A REPOST → LOAD ORIGINAL POST
    if (post?.postType === "repost" && post.originalPost) {
      post = await Post.findById(post.originalPost._id)
        .populate("author_id", "first_name profile_pic");
    }

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comments = await Comment.find({ post_id: post._id })
      .sort({ created_at: -1 })
      .populate("author_id", "first_name profile_pic");

    const liked = await Like.findOne({
      user_id: userId,
      post_id: post._id
    });

    res.json({
      post,
      comments,
      liked: !!liked
    });

  } catch (err) {
    console.error("FETCH SINGLE POST ERROR:", err);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});


// ----------------------
// ✅ COMMENT POST + ✅ COMMENT NOTIFICATION
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

    // Increase comment count
    await Post.findByIdAndUpdate(postId, { $inc: { comment_count: 1 } });

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
    console.error('POST CREATE ERROR:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// ----------------------
// LIKE / UNLIKE POST (with notification)
// ----------------------
router.post('/like/:postId', async (req, res) => {
  try {
    const userId =
      req.session?.passport?.user ||
      req.session?.user?.id ||
      req.user?._id;

    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const postId = req.params.postId;

    const existing = await Like.findOne({ user_id: userId, post_id: postId });

    if (existing) {
      // Unlike
      await Like.deleteOne({ _id: existing._id });
      await Post.findByIdAndUpdate(postId, { $inc: { like_count: -1 } });

      return res.json({ liked: false });
    }

    // Create like
    await Like.create({ user_id: userId, post_id: postId });
    await Post.findByIdAndUpdate(postId, { $inc: { like_count: 1 } });

    // Send notification to post owner (if not owner)
    try {
      const post = await Post.findById(postId).lean();
      if (post && String(post.author_id) !== String(userId)) {
        await sendNotification({
          user_id: post.author_id,   // who should receive notification (post owner)
          sender_id: userId,         // who liked
          type: 'like',
          post_id: postId
        });
      }
    } catch (notifErr) {
      console.error('Notification error (like):', notifErr);
    }

    return res.json({ liked: true });
  } catch (err) {
    console.error('LIKE ERROR:', err);
    res.status(500).json({ error: 'Like error', details: err.message });
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

    if (!userId) return res.status(401).json({ error: 'Not logged in' });

    await Post.findByIdAndUpdate(postId, { $inc: { share_count: 1 } });

    // Optionally you can notify the owner that their post was shared (uncomment if desired)
    // try {
    //   const post = await Post.findById(postId).lean();
    //   if (post && String(post.author_id) !== String(userId)) {
    //     await sendNotification({ user_id: post.author_id, sender_id: userId, type: 'share', post_id: postId });
    //   }
    // } catch (err) { console.error('Notification error (share):', err); }

    res.json({ success: true });
  } catch (err) {
    console.error('SHARE ERROR:', err);
    res.status(500).json({ error: 'Share error', details: err.message });
  }
});

// ----------------------
// COMMENT POST (with notification)
// ----------------------
router.post('/comment/:postId', async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.postId;

    const userId =
      req.session?.passport?.user ||
      req.session?.user?.id ||
      req.user?._id;

    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }

    // Create the comment
    const newComment = await Comment.create({
      post_id: postId,
      author_id: userId,
      content,
      created_at: new Date()
    });

    await Post.findByIdAndUpdate(postId, { $inc: { comment_count: 1 } });

    const post = await Post.findById(postId);

    if (post && String(post.author_id) !== String(userId)) {
      await Notification.create({
        sender_id: userId,
        receiver_id: post.author_id,
        message: `${req.session.user?.first_name} commented on your post`,
        type: "COMMENT",
        target_id: postId
      });

      if (global.io) {
        global.io.to(String(post.author_id)).emit("newNotification");
      }
    }

    res.json({ success: true, comment: newComment });

  } catch (err) {
    console.error('POST CREATE ERROR:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// ----------------------
// LIKE / UNLIKE POST (with notification)
// ----------------------
router.post('/like/:postId', async (req, res) => {
  try {
    const userId =
      req.session?.passport?.user ||
      req.session?.user?.id ||
      req.user?._id;

    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const postId = req.params.postId;

    const existing = await Like.findOne({ user_id: userId, post_id: postId });

    if (existing) {
      // Unlike
      await Like.deleteOne({ _id: existing._id });
      await Post.findByIdAndUpdate(postId, { $inc: { like_count: -1 } });

      return res.json({ liked: false });
    }

    // Create like
    await Like.create({ user_id: userId, post_id: postId });
    await Post.findByIdAndUpdate(postId, { $inc: { like_count: 1 } });

    // Send notification to post owner (if not owner)
    try {
      const post = await Post.findById(postId).lean();
      if (post && String(post.author_id) !== String(userId)) {
        await sendNotification({
          user_id: post.author_id,   // who should receive notification (post owner)
          sender_id: userId,         // who liked
          type: 'like',
          post_id: postId
        });
      }
    } catch (notifErr) {
      console.error('Notification error (like):', notifErr);
    }

    return res.json({ liked: true });
  } catch (err) {
    console.error('LIKE ERROR:', err);
    res.status(500).json({ error: 'Like error', details: err.message });
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

    if (!userId) return res.status(401).json({ error: 'Not logged in' });

    await Post.findByIdAndUpdate(postId, { $inc: { share_count: 1 } });

    // Optionally you can notify the owner that their post was shared (uncomment if desired)
    // try {
    //   const post = await Post.findById(postId).lean();
    //   if (post && String(post.author_id) !== String(userId)) {
    //     await sendNotification({ user_id: post.author_id, sender_id: userId, type: 'share', post_id: postId });
    //   }
    // } catch (err) { console.error('Notification error (share):', err); }

    res.json({ success: true });
  } catch (err) {
    console.error('SHARE ERROR:', err);
    res.status(500).json({ error: 'Share error', details: err.message });
  }
});

// ----------------------
// COMMENT POST (with notification)
// ----------------------
router.post('/comment/:postId', async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.postId;

    const userId =
      req.session?.passport?.user ||
      req.session?.user?.id ||
      req.user?._id;

    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }

    // Create the comment
    const newComment = await Comment.create({
      post_id: postId,
      author_id: userId,
      content,
      created_at: new Date()
    });

    await Post.findByIdAndUpdate(postId, { $inc: { comment_count: 1 } });

    const post = await Post.findById(postId);

    if (post && String(post.author_id) !== String(userId)) {
      await Notification.create({
        sender_id: userId,
        receiver_id: post.author_id,
        message: `${req.session.user?.first_name} commented on your post`,
        type: "COMMENT",
        target_id: postId
      });

      if (global.io) {
        global.io.to(String(post.author_id)).emit("newNotification");
      }
    }

    res.json({ success: true, comment: newComment });
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
      .populate('author_id', 'first_name profile_pic');

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

// 🔁 LINKEDIN STYLE REPOST
router.post("/repost/:postId", async (req, res) => {
  try {
    const userId =
      req.session?.passport?.user ||
      req.session?.user?.id ||
      req.user?._id;

    const { caption } = req.body;
    const { postId } = req.params;

    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const originalPost = await Post.findById(postId);
    if (!originalPost) return res.status(404).json({ error: "Post not found" });

    if (originalPost.postType === "repost") {
      return res.status(400).json({ error: "Cannot repost a repost" });
    }

    const alreadyReposted = await Post.findOne({
      author_id: userId,
      originalPost: postId
    });
    if (alreadyReposted) {
      return res.status(400).json({ error: "Already reposted" });
    }

    const repost = await Post.create({
      author_id: userId,
      caption: caption || "",
      postType: "repost",
      originalPost: postId
    });

    // 🔔 notification
    if (String(originalPost.author_id) !== String(userId)) {
      await Notification.create({
        sender_id: userId,
        receiver_id: originalPost.author_id,
        message: "reposted your post",
        type: "POST",
        target_id: postId
      });

      global.io?.to(String(originalPost.author_id)).emit("newNotification");
    }

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: "Repost failed" });
  }
});

// 🔁 LINKEDIN STYLE REPOST
router.post("/repost/:postId", async (req, res) => {
  try {
    const userId =
      req.session?.passport?.user ||
      req.session?.user?.id ||
      req.user?._id;

    const { caption } = req.body;
    const { postId } = req.params;

    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const originalPost = await Post.findById(postId);
    if (!originalPost) return res.status(404).json({ error: "Post not found" });

    if (originalPost.postType === "repost") {
      return res.status(400).json({ error: "Cannot repost a repost" });
    }

    const alreadyReposted = await Post.findOne({
      author_id: userId,
      originalPost: postId
    });
    if (alreadyReposted) {
      return res.status(400).json({ error: "Already reposted" });
    }

    const repost = await Post.create({
      author_id: userId,
      caption: caption || "",
      postType: "repost",
      originalPost: postId
    });

    // 🔔 notification
    if (String(originalPost.author_id) !== String(userId)) {
      await Notification.create({
        sender_id: userId,
        receiver_id: originalPost.author_id,
        message: "reposted your post",
        type: "POST",
        target_id: postId
      });

      global.io?.to(String(originalPost.author_id)).emit("newNotification");
    }

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: "Repost failed" });
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
