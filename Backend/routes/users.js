const express = require('express');
const router = express.Router();
const User = require('../models/userSchema');

// ✅ Search users by name or email
router.get('/search', async (req, res) => {
  try {
    const query = req.query.query || "";
    if (!query.trim()) return res.json([]);

    // Case-insensitive search on first_name or email
    const users = await User.find({
      $or: [
        { first_name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } }
      ]
    }).limit(20).lean();

    // Format results
    const formatted = users.map(user => ({
      _id: user._id,
      name: user.first_name,
      email: user.email,
      profilePic: user.profile_pic || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      mutualFriends: 0 // optional, you can calculate if needed
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


module.exports = router;
