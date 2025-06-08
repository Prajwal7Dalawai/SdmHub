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

// Starting conversation messages with timestamp and status
const initialConversation = [
  { id: 1, sender: 'other', message: 'Hi there, nice to meet you. My name is Jenny Wilson, and I’m from Jakarta.', timestamp: Date.now() - 3600000 * 5, status: 'seen' },
  { id: 2, sender: 'other', message: 'Good evening. I’d like to order a chicken salad, please.', timestamp: Date.now() - 3600000 * 4.5, status: 'seen' },
  { id: 3, sender: 'you', message: 'Hi there, nice to meet you too. I’m Savannah Nguyen from Bandung, pleased to meet you 🙏', timestamp: Date.now() - 3600000 * 4, status: 'seen' },
  { id: 4, sender: 'other', message: 'How has your day been so far?', timestamp: Date.now() - 3600000 * 3.5, status: 'seen' },
  { id: 5, sender: 'you', message: 'It’s been good! Just finishing up some design tasks at work.', timestamp: Date.now() - 3600000 * 3, status: 'delivered' },
  { id: 6, sender: 'other', message: 'That sounds productive. Let’s catch up this weekend?', timestamp: Date.now() - 3600000 * 2.5, status: 'delivered' },
  { id: 7, sender: 'you', message: 'Sure! I’d love that 😊', timestamp: Date.now() - 3600000 * 2, status: 'delivered' },
  { id: 8, sender: 'other', message: 'Great! I’ll message you the details later.', timestamp: Date.now() - 3600000 * 1.5, status: 'delivered' },
];

const ChatWindow = () => {
  const [messageInput, setMessageInput] = useState('');
  const [conversation, setConversation] = useState(initialConversation);

  // Handle sending new message
  const sendMessage = () => {
    if (messageInput.trim() === '') return;
    const newMsg = {
      id: conversation.length + 1,
      sender: 'you',
      message: messageInput,
      timestamp: Date.now(),
      status: 'delivered', // new messages start as delivered
    };
    setConversation((prev) => [...prev, newMsg]);
    setMessageInput('');
  };

  // Handle delete message
  const handleDelete = (id) => {
    setConversation((prev) => prev.filter((msg) => msg.id !== id));
  };

  // Handle copy message
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Message copied to clipboard!');
    });
  };

  // Handle forward message (you can expand this)
  const handleForward = (id) => {
    const msg = conversation.find((m) => m.id === id);
    if (msg) {
      alert(`Forwarding message: "${msg.message}" (Implement forwarding logic)`);
    }
  };

  // Handle edit message
  const handleEdit = (id, newText) => {
    setConversation((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, message: newText, timestamp: Date.now(), status: 'delivered' } : msg
      )
    );
  };

  return (
    <div className="app-container">
      <div className="chat-panel">
        <div className="chat-list-section">
          <h3 className="chat-list-heading">Chats</h3>

          <div className="chat-list-search-container">
            <input type="text" placeholder="Search chats..." className="chat-list-search-input" />
          </div>

          <div className="chat-list">
            {messageListData.map((item) => (
              <MessageListItem
                key={item.id}
                avatar={item.avatar}
                name={item.name}
                lastMessage={item.lastMessage}
                active={item.name === 'Jenny Wilson'}
                sender={item.sender}
              />
            ))}
          </div>
        </div>

        <div className="chat-box">
          <div className="chat-header-small">
            <img src="https://randomuser.me/api/portraits/women/1.jpg" alt="Jenny" />
            <span>Jenny Wilson</span>
          </div>

          <div className="chat-messages">
            {conversation.map((chat) => (
              <ChatBubble
                key={chat.id}
                id={chat.id}
                sender={chat.sender}
                message={chat.message}
                timestamp={chat.timestamp}
                status={chat.status}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onCopy={handleCopy}
                onForward={handleForward}
              />
            ))}
          </div>

          <div className="input-area">
            <img src="https://randomuser.me/api/portraits/women/50.jpg" alt="You" />
            <input
              type="text"
              placeholder="Write a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button className="attachment-button" title="Attach files">📎</button>
            <button className="send-button" onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
