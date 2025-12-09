const express = require("express");
const router = express.Router();
const Notification = require("../models/notificationSchema");

// Middleware to get logged-in user ID
function getUserId(req) {
  return (
    req.user?._id ||
    req.session?.passport?.user ||
    req.session?.user?.id ||
    null
  );
}

// GET all notifications for a user
router.get("/", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const notifications = await Notification.find({ user_id: userId })
      .populate("sender_id", "first_name profile_pic")
      .populate("post_id", "caption")
      .sort({ created_at: -1 });

    res.json({ success: true, notifications });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

// Mark notification as read
router.post("/:id/read", async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark as read" });
  }
});

// Clear all notifications
router.delete("/clear", async (req, res) => {
  try {
    const userId = getUserId(req);
    await Notification.deleteMany({ user_id: userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear notifications" });
  }
});

module.exports = router;
