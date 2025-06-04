import React from 'react';
import '../assets/css/MessageScreen.css';

const MessageListItem = ({ name, lastMessage, avatar, isActive }) => (
  <div className={`message-item ${isActive ? 'active' : ''}`}>
    <img src={avatar} alt={name} className="avatar" />
    <div className="message-info">
      <div className="name">{name}</div>
      <div className="last-message">{lastMessage}</div>
    </div>
  </div>
);

export default MessageListItem;
