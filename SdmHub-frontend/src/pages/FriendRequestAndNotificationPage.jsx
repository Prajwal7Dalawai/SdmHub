import React, { useState, useEffect } from 'react';
import '../assets/css/FriendRequestAndNotificationPage.css';
import usePageTitle from '../hooks/usePageTitle';

const DUMMY_FRIEND_REQUESTS = [
  { id: 1, name: 'Sophia Clark', mutualFriends: 2, profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop' },
  { id: 2, name: 'Ethan Carter', mutualFriends: 3, profilePic: 'https://images.unsplash.com/photo-1507003211169-e69adba4c2d9?q=80&w=1887&auto=format&fit=crop' },
];

const DUMMY_NOTIFICATIONS = [
  { id: 1, name: 'Isabella Parker', action: 'liked your post', type: 'like', time: '1h', profilePic: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop' },
  { id: 2, name: 'Noah Turner', action: 'mentioned you in a comment', type: 'mention', time: '2h', profilePic: 'https://images.unsplash.com/photo-1522075469751-3a6694fa22fa?q=80&w=2070&auto=format&fit=crop' },
  { id: 3, name: 'Mia Reynolds', action: 'sent you a message', type: 'message', time: '3h', profilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29329?q=80&w=1887&auto=format&fit=crop' },
  { id: 4, name: 'Lucas Bennett', action: 'liked your comment', type: 'like', time: '4h', profilePic: 'https://images.unsplash.com/photo-1531427186611-ecfd6d951141?q=80&w=1887&auto=format&fit=crop' },
];

const FriendRequestAndNotificationPage = () => {
  usePageTitle('Notifications');
  const [friendRequests, setFriendRequests] = useState(DUMMY_FRIEND_REQUESTS);
  const [activeTab, setActiveTab] = useState('likes');

  const handleAcceptFriendRequest = (id) => {
    setFriendRequests(friendRequests.filter(req => req.id !== id));
  };

  const handleDeclineFriendRequest = (id) => {
    setFriendRequests(friendRequests.filter(req => req.id !== id));
  };

  const renderNotificationsByType = (type) => {
    const filtered = DUMMY_NOTIFICATIONS.filter(n => n.type === type);
    return filtered.length === 0 ? (
      <p className="no-items">No {type} notifications.</p>
    ) : (
      filtered.map((notification) => (
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
    );
  };

  return (
    <div className="main-content-page">
      {/* Friend Requests Section */}
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

      {/* Notifications Section */}
      <div className="section-card">
        <h3 className="section-title">Notifications</h3>

        <div className="tab-menu">
          <button onClick={() => setActiveTab('likes')} className={activeTab === 'likes' ? 'active-tab' : ''}>Likes</button>
          <button onClick={() => setActiveTab('mention')} className={activeTab === 'mention' ? 'active-tab' : ''}>Mentions</button>
          <button onClick={() => setActiveTab('message')} className={activeTab === 'message' ? 'active-tab' : ''}>Messages</button>
        </div>

        {renderNotificationsByType(activeTab)}
      </div>
    </div>
  );
};

export default FriendRequestAndNotificationPage;
