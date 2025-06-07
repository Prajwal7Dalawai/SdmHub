import React from 'react';
import '../assets/css/style.css';

const ChatBubble = ({ sender, message }) => {
  return (
    <div className={`chat-bubble-container ${sender === 'you' ? 'align-right' : 'align-left'}`}>
      <div className={`chat-bubble ${sender}`}>
        {message}
      </div>
    </div>
  );
};

export default ChatBubble;
