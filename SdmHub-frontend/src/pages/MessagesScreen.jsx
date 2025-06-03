import React, { useState } from 'react';
import Header from './Header';
import MessageListItem from './MessageListItem';
import ChatBubble from './ChatBubble';
import '../assets/css/MessageScreen.css';

const messageListData = [
  {
    id: 'msg1',
    name: 'Sophia Carter',
    lastMessage: 'Hey, how’s it going?',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: 'msg2',
    name: 'Ethan Bennett',
    lastMessage: 'I’m excited about the new project!',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
  {
    id: 'msg3',
    name: 'Olivia Harper',
    lastMessage: 'Let’s catch up soon.',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
  },
  {
    id: 'msg4',
    name: 'Liam Foster',
    lastMessage: 'Thanks for the recommendation!',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
  },
  {
    id: 'msg5',
    name: 'Ava Mitchell',
    lastMessage: 'See you at the event.',
    avatar: 'https://randomuser.me/api/portraits/women/6.jpg',
  },
];

const chatConversationData = [
  {
    id: 'chat1',
    sender: 'other',
    name: 'Sophia Carter',
    message: 'Hey, how’s it going?',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: 'chat2',
    sender: 'you',
    message: 'I’m doing great! Just finished a new design project. How about you?',
    avatar: 'https://randomuser.me/api/portraits/women/79.jpg',
  },
  {
    id: 'chat3',
    sender: 'other',
    name: 'Sophia Carter',
    message: 'That’s awesome! I’m working on a marketing campaign for a new product launch. It’s been quite busy.',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: 'chat4',
    sender: 'you',
    message: 'Sounds exciting! Let me know if you need any help with the design aspects. Always happy to collaborate.',
    avatar: 'https://randomuser.me/api/portraits/women/79.jpg',
  },
  {
    id: 'chat5',
    sender: 'other',
    name: 'Sophia Carter',
    message: 'Thanks! I might take you up on that offer. How about we catch up over coffee next week?',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: 'chat6',
    sender: 'you',
    message: 'Sounds like a plan! I’ll check my schedule and get back to you with some available times.',
    avatar: 'https://randomuser.me/api/portraits/women/79.jpg',
  },
];

const MessagesScreen = () => {
  const [messageInput, setMessageInput] = useState('');

  return (
    <div className="messages-screen">
      <div className="main-content">
        <div className="left-panel">
          <h2>Messages</h2>
          <div className="message-list">
            {messageListData.map((item) => (
              <MessageListItem
                key={item.id}
                name={item.name}
                lastMessage={item.lastMessage}
                avatar={item.avatar}
                isActive={item.id === 'msg1'}
              />
            ))}
          </div>
        </div>
        <div className="right-panel">
          <div className="chat-header">
            <h3>Sophia Carter</h3>
          </div>
          <div className="chat-bubbles">
            {chatConversationData.map((chat) => (
              <ChatBubble
                key={chat.id}
                sender={chat.sender}
                name={chat.name}
                message={chat.message}
                avatar={chat.avatar}
              />
            ))}
          </div>
          <div className="message-input-area">
            <img
              src="https://randomuser.me/api/portraits/women/79.jpg"
              alt="You"
              className="input-avatar"
            />
            <input
              type="text"
              placeholder="Write a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="message-input"
            />
            <button className="send-button">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesScreen;
