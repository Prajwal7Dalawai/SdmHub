import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "../assets/css/Notifications.css";
import { notificationService } from "../services/notification.service";

const socket = io("http://localhost:5173", {
  withCredentials: true,
});

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const userId = localStorage.getItem("userId"); // or from auth context

  useEffect(() => {
    async function load() {
      const res = await notificationService.getNotifications();
      setNotifications(res.data.notifications || []);
    }
    load();

    socket.emit("register", userId);

    socket.on("new-notification", (notif) => {
      // 🔥 POP-UP effect
      setNotifications((prev) => [notif, ...prev]);

      // browser toast (optional)
      if (Notification.permission === "granted") {
        new Notification(notif.sender_id.first_name, {
          body: notif.message,
          icon: notif.sender_id.profile_pic,
        });
      }
    });

    return () => {
      socket.off("new-notification");
    };
  }, []);

  return (
    <div className="card notification-card notification-wrapper">
      <h2>Notifications</h2>

      <div className="section">
        {notifications.length === 0 ? (
          <p className="empty-text">No new notifications</p>
        ) : (
          notifications.map((n) => (
            <div key={n._id} className="notif-item pop">
              <img src={n.sender_id?.profile_pic} className="notif-avatar" />
              <div>
                <h5>{n.sender_id?.first_name}</h5>
                <p>{n.message}</p>
                <span className="notif-time">
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
