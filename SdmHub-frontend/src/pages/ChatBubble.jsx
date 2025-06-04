import React from 'react';
import '../assets/css/MessageScreen.css';

const ChatBubble = ({ sender, name, message, avatar }) => {
  const isYou = sender === 'you';
  return (
    <div className={`chat-bubble ${isYou ? 'you' : 'other'}`}>
      {!isYou && <img src={avatar} alt={name} className="avatar" />}
      <div className="bubble-content">
        {!isYou && <div className="sender-name">{name}</div>}
        <div className="message-text">{message}</div>
      </div>
      {isYou && <img src={avatar} alt="You" className="avatar" />}
    </div>
  );
};

export default ChatBubble;
