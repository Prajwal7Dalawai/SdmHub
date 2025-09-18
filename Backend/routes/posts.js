const express = require('express');
const router = express.Router();
const Post = require('../models/postSchema');
const User = require('../models/userSchema');

// Get all posts with author info
router.get('/', async (req, res) => {
  try {
    // Populate author info
    const posts = await Post.find({ visibility: 'visible' })
      .sort({ created_at: -1 })
      .populate('author_id', 'first_name profile_pic');

    // Format posts for frontend
    const formattedPosts = posts.map(post => ({
      _id: post._id,
      user: post.author_id?.first_name || 'Unknown',
      avatar: post.author_id?.profile_pic || '',
      caption: post.caption,
      image: post.content_url,
      time: post.created_at, // You can format this on frontend as '2h ago'
      likes: 0, // Placeholder, implement likes logic if needed
      comments: 0, // Placeholder
      shares: 0 // Placeholder
    }));

    res.json({ posts: formattedPosts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts', details: err.message });
  }
});

// Create a new post
router.post('/', async (req, res) => {
  try {
    const { caption, image } = req.body;
    const userId = req.session.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

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
    res.status(500).json({ error: 'Failed to create post' });
  }
});

module.exports = router; 