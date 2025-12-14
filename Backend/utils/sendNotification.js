const Notification = require("../models/notificationSchema");

async function sendNotification({ user_id, sender_id, type, post_id = null }) {
  let message = "";

  if (type === "friend_request") {
    message = "sent you a friend request.";
  }
  if (type === "friend_accept") {
    message = "accepted your friend request.";
  }
  if (type === "like") {
    message = "liked your post.";
  }
  if (type === "comment") {
    message = "commented on your post.";
  }

  const notification = await Notification.create({
    user_id,
    sender_id,
    type,
    post_id,
    message
  });

  return notification;
}

module.exports = sendNotification;
