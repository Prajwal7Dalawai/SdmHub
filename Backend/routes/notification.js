const express = require("express");
const router = express.Router();
const Notification = require("../models/notificationSchema");

// ✅ Helper to get logged-in user
function getUserId(req) {
  return (
    req.user?._id ||
    req.session?.passport?.user ||
    req.session?.user?.id ||
    null
  );
}

// ✅ GET ALL NOTIFICATIONS
router.get("/", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const notifications = await Notification.find({ receiver_id: userId })
      .sort({ created_at: -1 })
      .populate("sender_id", "first_name profile_pic");

    res.json({ notifications });
  } catch (err) {
    console.error("NOTIFICATION FETCH ERROR:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// ✅ MARK SINGLE NOTIFICATION AS READ
router.post("/:id/read", async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update notification" });
  }
});

// ✅ CLEAR ALL NOTIFICATIONS
router.delete("/clear", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    await Notification.deleteMany({ receiver_id: userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear notifications" });
  }
});

module.exports = router;
