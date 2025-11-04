import React from 'react';
import '../assets/css/style.css';

const MessageListItem = ({ avatar, name, lastMessage, active, sender }) => {
  return (
    <div className={`chat-item ${active ? 'active' : ''}`}>
      <img src={avatar} alt={name} />
      <div>
        <div className="chat-item-header">
          <strong>{name}</strong>
          <span className="sender-label">{sender === 'you' ? 'You' : sender}</span>
        </div>
        <div className="chat-item-message">{lastMessage}</div>
      </div>
    </div>
  );
};

export default MessageListItem;
