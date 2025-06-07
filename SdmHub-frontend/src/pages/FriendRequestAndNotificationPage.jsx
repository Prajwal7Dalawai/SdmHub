import React, { useState } from 'react';
import '../assets/css/FriendRequestAndNotificationPage.css'; // Updated CSS file

const DUMMY_FRIEND_REQUESTS = [
  { id: 1, name: 'Sophia Clark', mutualFriends: 2, profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop' },
  { id: 2, name: 'Ethan Carter', mutualFriends: 3, profilePic: 'https://images.unsplash.com/photo-1507003211169-e69adba4c2d9?q=80&w=1887&auto=format&fit=crop' },
  { id: 3, name: 'Olivia Bennett', mutualFriends: 1, profilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1888&auto=format&fit=crop' },
  { id: 4, name: 'Liam Harper', mutualFriends: 4, profilePic: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop' },
  { id: 5, name: 'Ava Foster', mutualFriends: 2, profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop' },
];

const DUMMY_NOTIFICATIONS = [
  { id: 1, name: 'Isabella Parker', action: 'liked your post', time: '1h', profilePic: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop' },
  { id: 2, name: 'Noah Turner', action: 'commented on your photo', time: '2h', profilePic: 'https://images.unsplash.com/photo-1522075469751-3a6694fa22fa?q=80&w=2070&auto=format&fit=crop' },
  { id: 3, name: 'Mia Reynolds', action: 'mentioned you in a comment', time: '3h', profilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29329?q=80&w=1887&auto=format&fit=crop' },
  { id: 4, name: 'Lucas Bennett', action: 'shared your post', time: '4h', profilePic: 'https://images.unsplash.com/photo-1531427186611-ecfd6d951141?q=80&w=1887&auto=format&fit=crop' },
  { id: 5, name: 'Chloe Hayes', action: 'reacted to your story', time: '5h', profilePic: 'https://images.unsplash.com/photo-1546961342-ea58f39542c3?q=80&w=1887&auto=format&fit=crop' },
];

const FriendRequestAndNotificationPage = () => {
  const [friendRequests, setFriendRequests] = useState(DUMMY_FRIEND_REQUESTS);

  const handleAcceptFriendRequest = (id) => {
    setFriendRequests(friendRequests.filter(req => req.id !== id));
    console.log(`Accepted friend request from ID: ${id}`);
  };

  const handleDeclineFriendRequest = (id) => {
    setFriendRequests(friendRequests.filter(req => req.id !== id));
    console.log(`Declined friend request from ID: ${id}`);
  };

  return (
    <div className="main-content-page">
      {/* Friend Requests */}
      <div className="section-card">
        <h3 className="section-title">Friend Requests</h3>
        {friendRequests.length === 0 ? (
          <p className="no-items">No new friend requests.</p>
        ) : (
          friendRequests.map((request) => (
            <div key={request.id} className="request-item">
              <img src={request.profilePic} alt={request.name} className="profile-img" />
              <div className="request-info">
                <span className="request-name">{request.name}</span>
                <span className="mutual-friends">{request.mutualFriends} mutual friends</span>
              </div>
              <div className="request-actions">
                <button className="accept-button" onClick={() => handleAcceptFriendRequest(request.id)}>Accept</button>
                <button className="decline-button" onClick={() => handleDeclineFriendRequest(request.id)}>Decline</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notifications */}
      <div className="section-card">
        <h3 className="section-title">Notifications</h3>
        {DUMMY_NOTIFICATIONS.length === 0 ? (
          <p className="no-items">No recent notifications.</p>
        ) : (
          DUMMY_NOTIFICATIONS.map((notification) => (
            <div key={notification.id} className="notification-item">
              <img src={notification.profilePic} alt={notification.name} className="profile-img" />
              <div className="notification-content">
                <span className="notification-text">
                  <span className="notification-name">{notification.name}</span> {notification.action}
                </span>
                <span className="notification-time">{notification.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FriendRequestAndNotificationPage;
