import React, { useEffect, useState } from "react";
import "../assets/css/Notifications.css";
import { notificationService } from "../services/notification.service";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await notificationService.getNotifications();
      setNotifications(res.data.notifications || []);
    }
    load();
  }, []);

  return (
    <div className="card notification-card">
      <h2>Notifications</h2>

      <div className="section">
        {notifications.length === 0 ? (
          <p className="empty-text">No new notifications</p>
        ) : (
          notifications.map((n) => (
            <div key={n._id} className="notif-item">
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
