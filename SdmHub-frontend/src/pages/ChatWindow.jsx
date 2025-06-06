import React, { useState } from 'react';
import MessageListItem from './MessageListItem';
import ChatBubble from './ChatBubble';
import '../assets/css/style.css';

const messageListData = [
  { id: 1, name: 'Jenny Wilson', sender: 'Jenny Wilson', lastMessage: 'Hi there, nice to meet you.', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { id: 2, name: 'Bessie Cooper', sender: 'Bessie Cooper', lastMessage: 'How are you, my friend', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { id: 3, name: 'Guy Hawkins', sender: 'Guy Hawkins', lastMessage: 'Where are you right now', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { id: 4, name: 'Courtney Henry', sender: 'Courtney Henry', lastMessage: 'Let’s catch up tomorrow.', avatar: 'https://randomuser.me/api/portraits/women/4.jpg' },
  { id: 5, name: 'Robert Fox', sender: 'Robert Fox', lastMessage: 'Meeting rescheduled to 4 PM.', avatar: 'https://randomuser.me/api/portraits/men/5.jpg' },
  { id: 6, name: 'Leslie Alexander', sender: 'Leslie Alexander', lastMessage: 'I’ll send the report by tonight.', avatar: 'https://randomuser.me/api/portraits/women/6.jpg' },
];

const chatConversationData = [
  { id: 1, sender: 'other', message: 'Hi there, nice to meet you. My name is Jenny Wilson, and I’m from Jakarta.' },
  { id: 2, sender: 'other', message: 'Good evening. I’d like to order a chicken salad, please.' },
  { id: 3, sender: 'you', message: 'Hi there, nice to meet you too. I’m Savannah Nguyen from Bandung, pleased to meet you 🙏' },
  { id: 4, sender: 'other', message: 'How has your day been so far?' },
  { id: 5, sender: 'you', message: 'It’s been good! Just finishing up some design tasks at work.' },
  { id: 6, sender: 'other', message: 'That sounds productive. Let’s catch up this weekend?' },
  { id: 7, sender: 'you', message: 'Sure! I’d love that 😊' },
  { id: 8, sender: 'other', message: 'Great! I’ll message you the details later.' },
];

const ChatWindow = () => {
  const [messageInput, setMessageInput] = useState('');

  return (
    <div className="app-container">
      <div className="chat-panel">
        <div className="chat-list-section">
          <h3 className="chat-list-heading">Chats</h3>

          {/* Search Bar */}
          <div className="chat-list-search-container">
            <input
              type="text"
              placeholder="Search chats..."
              className="chat-list-search-input"
            />
          </div>

          <div className="chat-list">
            {messageListData.map((item) => (
              <MessageListItem
                key={item.id}
                avatar={item.avatar}
                name={item.name}
                lastMessage={item.lastMessage}
                active={item.name === 'Jenny Wilson'}
              />
            ))}
          </div>

          {/* New Chat Button */}
          <div className="new-chat-btn-container">
            <button className="new-chat-btn">+ New Chat</button>
          </div>
        </div>

        <div className="chat-box">
          <div className="chat-header-small">
            <img src="https://randomuser.me/api/portraits/women/1.jpg" alt="Jenny" />
            <span>Jenny Wilson</span>
          </div>

          <div className="chat-messages">
            {chatConversationData.map((chat) => (
              <ChatBubble key={chat.id} sender={chat.sender} message={chat.message} />
            ))}
          </div>

          <div className="input-area">
            <img src="https://randomuser.me/api/portraits/women/50.jpg" alt="You" />
            <input
              type="text"
              placeholder="Write a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />
            <button className="attachment-button">📎</button>
            <button className="send-button">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
