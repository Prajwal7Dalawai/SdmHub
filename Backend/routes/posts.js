// routes/posts.js
const express = require('express');
const router = express.Router();

const Post = require('../models/postSchema');
const User = require('../models/userSchema');
const Like = require('../models/likeSchema');
const Comment = require('../models/commentSchema');
const sendNotification = require('../utils/sendNotification'); // <- your helper

// ----------------------
// GET ALL POSTS + LIKED STATUS (also last 2 comments)
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

        // fetch last 2 comments
        const comments = await Comment.find({ post_id: post._id })
          .sort({ created_at: -1 })
          .limit(2)
          .populate('author_id', 'first_name profile_pic');

        // check whether current user liked the post
        const liked = userId ? await Like.findOne({
          user_id: userId,
          post_id: post._id
        }) : null;

        return {
          _id: post._id,
          user: post.author_id?.first_name || 'Unknown',
          avatar: post.author_id?.profile_pic || '',
          caption: post.caption,
          image: post.content_url,
          time: post.created_at,

          like_count: post.like_count || 0,
          comment_count: post.comment_count || 0,
          share_count: post.share_count || 0,
          liked: !!liked,

          // include short comment list for frontend
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
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const newPost = new Post({
      author_id: userId,
      caption,
      content_url: image,
      created_at: new Date(),
      visibility: 'visible'
    });

    await newPost.save();
    res.status(201).json({ post: newPost });
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

    // Increase comment count
    await Post.findByIdAndUpdate(postId, { $inc: { comment_count: 1 } });

    // Notify post owner (if not owner)
    try {
      const post = await Post.findById(postId).lean();
      if (post && String(post.author_id) !== String(userId)) {
        await sendNotification({
          user_id: post.author_id,
          sender_id: userId,
          type: 'comment',
          post_id: postId,
          meta: { commentId: newComment._id, contentSnippet: content.slice(0, 120) }
        });
      }
    } catch (notifErr) {
      console.error('Notification error (comment):', notifErr);
    }

    res.json({ success: true, comment: newComment });
  } catch (err) {
    console.error('COMMENT ERROR:', err);
    res.status(500).json({ error: 'Comment error', details: err.message });
  }
});

// ----------------------
// GET ALL COMMENTS FOR A POST
// ----------------------
router.get('/comments/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;

    const comments = await Comment.find({ post_id: postId })
      .sort({ created_at: -1 })
      .populate('author_id', 'first_name profile_pic');

    const formatted = comments.map((c) => ({
      _id: c._id,
      content: c.content,
      time: c.created_at,
      author: c.author_id?.first_name || 'User',
      avatar: c.author_id?.profile_pic || ''
    }));

    res.json({ comments: formatted });
  } catch (err) {
    console.error('COMMENT FETCH ERROR:', err);
    res.status(500).json({ error: 'Failed to load comments' });
  }
});

module.exports = router;
