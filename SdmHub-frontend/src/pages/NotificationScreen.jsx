
import React, { useState } from 'react';

import '../assets/css/NotificationScreen.css'; // Import the CSS file

const notificationsData = [
  {
    id: '1',
    name: 'Sophia',
    action: 'liked your post',
    time: '2h',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: '2',
    name: 'Liam',
    action: 'commented on your post',
    time: '4h',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
  {
    id: '3',
    name: 'Ethan',
    action: 'started following you',
    time: '6h',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
  {
    id: '4',
    name: 'Olivia',
    action: 'mentioned you in a post',
    time: '8h',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
  },
  {
    id: '5',
    name: 'Noah',
    action: 'liked your post',
    time: '10h',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
  },
  {
    id: '6',
    name: 'Ava',
    action: 'commented on your post',
    time: '12h',
    avatar: 'https://randomuser.me/api/portraits/women/6.jpg',
  },
  {
    id: '7',
    name: 'Lucas',
    action: 'started following you',
    time: '14h',
    avatar: 'https://randomuser.me/api/portraits/men/7.jpg',
  },
  {
    id: '8',
    name: 'Isabella',
    action: 'mentioned you in a post',
    time: '16h',
    avatar: 'https://randomuser.me/api/portraits/women/8.jpg',
  },
];

const friendRequestsDataInitial  = [
  {
    id: 'fr1',
    name: 'Emily',
    mutualFriends: 5,
    avatar: 'https://randomuser.me/api/portraits/women/9.jpg',
  },
  {
    id: 'fr2',
    name: 'Michael',
    mutualFriends: 3,
    avatar: 'https://randomuser.me/api/portraits/men/10.jpg',
  },
  {
    id: 'fr3',
    name: 'Charlotte',
    mutualFriends: 8,
    avatar: 'https://randomuser.me/api/portraits/women/11.jpg',
  },
];


const NotificationItem = ({ name, action, time, avatar }) => (
  <div className="notification-item">
    <img src={avatar} alt={name} className="avatar" />
    <div className="text">
      <span className="bold">{name}</span> {action}
    </div>
    <div className="time">{time}</div>
  </div>
);

const FriendRequestItem = ({ id, name, mutualFriends, avatar, onAccept, onReject }) => (
  <div className="friend-request-item">
    <img src={avatar} alt={name} className="avatar" />
    <div className="friend-info">
      <span className="bold">{name}</span>
      <span className="mutual-friends">{mutualFriends} mutual friends</span>
    </div>
    <div className="actions">
      <button className="accept-btn" onClick={() => onAccept(id)}>Accept</button>
      <button className="reject-btn" onClick={() => onReject(id)}>Reject</button>
    </div>
  </div>
);

const NotificationsScreen = () => {
  const [friendRequestsData, setFriendRequestsData] = useState(friendRequestsDataInitial);

  const handleAccept = (id) => {
    setFriendRequestsData(prev => prev.filter(fr => fr.id !== id));
  };

  const handleReject = (id) => {
    setFriendRequestsData(prev => prev.filter(fr => fr.id !== id));
  };

  return (
    <div className="screen">
      <div className="main-content notifications-friendrequests-wrapper">
        <div className="card notifications-card">
          <h2 className="title">Notifications</h2>
          <div className="tabs">
            <div className="tab active">All</div>
            <div className="tab">Mentions</div>
          </div>
          <div className="underline full" />
          <div className="underline active" />
          <div className="notification-list">
            {notificationsData.map((n) => (
              <NotificationItem key={n.id} {...n} />
            ))}
          </div>
        </div>

        <div className="card friendrequests-card">
          <h2 className="title">Friend Requests</h2>
          {friendRequestsData.length === 0 ? (
            <div className="no-requests">No friend requests</div>
          ) : (
            friendRequestsData.map(fr => (
              <FriendRequestItem
                key={fr.id}
                {...fr}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsScreen;