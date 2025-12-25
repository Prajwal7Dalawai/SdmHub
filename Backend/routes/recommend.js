const express = require("express");
const router = express.Router();
const User = require("../models/userSchema");
const recommendations = require('../controller/recommendController');

// ✅ Helper to get logged-in user ID (same as in friends.js)
function getUserId(req) {
  return (
    req.session.user?.id ||
    req.session?.passport?.user ||
    req.body?.userId ||
    req.query?.userId ||
    null
  );
}

// ✅ Mutual friends recommendation
router.get("/mutual", async (req, res) => {
  try {
    const userId = getUserId(req);

    // 🚨 Validate userId
    if (!userId || userId === "null" || userId === "undefined") {
      return res.status(400).json({ msg: "Invalid or missing user ID" });
    }

    // ✅ Fetch current user and their friends
    const user = await User.findById(userId).populate("friendsList.friendId");
    if (!user) return res.status(404).json({ msg: "User not found" });

    const userFriendIds = new Set(
      (user.friendsList || []).map((f) => f.friendId?._id?.toString())
    );
    const mutualCount = {};

    // ✅ Fetch each friend’s friends
    const friendsOfFriends = await Promise.all(
      (user.friendsList || []).map((f) =>
        User.findById(f.friendId).populate("friendsList.friendId")
      )
    );

    // ✅ Count mutual friends
    friendsOfFriends.forEach((friendData) => {
      if (!friendData) return;
      (friendData.friendsList || []).forEach((fof) => {
        const fofId = fof.friendId?._id?.toString();
        if (!fofId || fofId === userId || userFriendIds.has(fofId)) return;
        mutualCount[fofId] = (mutualCount[fofId] || 0) + 1;
      });
    });

    // ✅ Sort by number of mutual friends
    const sortedIds = Object.keys(mutualCount).sort(
      (a, b) => mutualCount[b] - mutualCount[a]
    );

    // ✅ Fetch suggested users
    const users = await User.find({ _id: { $in: sortedIds } }).select(
      "first_name profile_pic department"
    );

    // ✅ Format for frontend
    const suggestions = users.map((u) => ({
      _id: u._id,
      name: u.first_name,
      profilePic:
        u.profile_pic ||
        "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      department: u.department || "",
      mutualFriends: mutualCount[u._id.toString()] || 0,
    }));

    // ✅ Sort suggestions by highest mutual friends first
    suggestions.sort((a, b) => b.mutualFriends - a.mutualFriends);

    res.json(suggestions);
  } catch (err) {
    console.error("Error in /recommend/mutual:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

router.get('/community', async (req,res)=>{
  console.log("entering into the community route");
  await recommendations.getInterestRecommendations(req,res);
});

module.exports = router;
