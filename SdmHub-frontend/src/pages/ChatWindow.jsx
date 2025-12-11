import React, { useState, useEffect } from 'react';
import MessageListItem from './MessageListItem';
import ChatBubble from './ChatBubble';
import '../assets/css/style.css';
import usePageTitle from '../hooks/usePageTitle';

const messageListData = [
  { id: 1, name: 'Jenny Wilson', sender: 'Jenny Wilson', lastMessage: 'Hi there, nice to meet you.', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { id: 2, name: 'Bessie Cooper', sender: 'Bessie Cooper', lastMessage: 'How are you, my friend', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { id: 3, name: 'Guy Hawkins', sender: 'Guy Hawkins', lastMessage: 'Where are you right now', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { id: 4, name: 'Courtney Henry', sender: 'Courtney Henry', lastMessage: "Let's catch up tomorrow.", avatar: 'https://randomuser.me/api/portraits/women/4.jpg' },
  { id: 5, name: 'Robert Fox', sender: 'Robert Fox', lastMessage: 'Meeting rescheduled to 4 PM.', avatar: 'https://randomuser.me/api/portraits/men/5.jpg' },
  { id: 6, name: 'Leslie Alexander', sender: 'Leslie Alexander', lastMessage: "I'll send the report by tonight.", avatar: 'https://randomuser.me/api/portraits/women/6.jpg' }
];

// Add unique messages per user for demonstration
const userConversations = {
  'Jenny Wilson': [
    { id: 1, sender: 'other', message: 'Hey, how are you?', timestamp: Date.now() - 7200000, status: 'seen' },
    { id: 2, sender: 'you', message: "I'm good, thanks! How about you?", timestamp: Date.now() - 7100000, status: 'seen' },
    { id: 3, sender: 'other', message: 'Doing great! Want to catch up later?', timestamp: Date.now() - 7000000, status: 'delivered' },
    { id: 4, sender: 'you', message: 'Sure, that sounds good!', timestamp: Date.now() - 6900000, status: 'delivered' },
    { id: 5, sender: 'other', message: 'Perfect! See you then.', timestamp: Date.now() - 6800000, status: 'delivered' },
  ],
  'Bessie Cooper': [
    { id: 1, sender: 'other', message: 'You coming to the birthday party?', timestamp: Date.now() - 6600000, status: 'seen' },
    { id: 2, sender: 'you', message: "Absolutely! Can't wait 🎉", timestamp: Date.now() - 6500000, status: 'delivered' },
    { id: 3, sender: 'other', message: 'Great! It starts at 7.', timestamp: Date.now() - 6400000, status: 'seen' },
    { id: 4, sender: 'you', message: 'Got it. Bringing a gift too!', timestamp: Date.now() - 6300000, status: 'delivered' },
    { id: 5, sender: 'other', message: 'Awesome, see you there!', timestamp: Date.now() - 6200000, status: 'delivered' },
  ],
  'Guy Hawkins': [
    { id: 1, sender: 'other', message: 'Did you get the project files?', timestamp: Date.now() - 6000000, status: 'seen' },
    { id: 2, sender: 'you', message: 'Yes, I received them this morning.', timestamp: Date.now() - 5900000, status: 'seen' },
    { id: 3, sender: 'other', message: 'Perfect, let me know if you need anything.', timestamp: Date.now() - 5800000, status: 'delivered' },
    { id: 4, sender: 'you', message: 'Will do, thanks!', timestamp: Date.now() - 5700000, status: 'delivered' },
    { id: 5, sender: 'other', message: 'Anytime!', timestamp: Date.now() - 5600000, status: 'delivered' },
  ],
  'Courtney Henry': [
    { id: 1, sender: 'other', message: "Let's catch up on the marketing strategy tomorrow.", timestamp: Date.now() - 5400000, status: 'seen' },
    { id: 2, sender: 'you', message: "Sure, I've added it to my calendar.", timestamp: Date.now() - 5300000, status: 'seen' },
    { id: 3, sender: 'other', message: 'Perfect. See you at 10 AM?', timestamp: Date.now() - 5200000, status: 'delivered' },
    { id: 4, sender: 'you', message: 'Yes, 10 AM works for me.', timestamp: Date.now() - 5100000, status: 'delivered' },
    { id: 5, sender: 'other', message: 'Great, looking forward to it.', timestamp: Date.now() - 5000000, status: 'delivered' },
  ],
  'Robert Fox': [
    { id: 1, sender: 'other', message: 'The meeting is confirmed for tomorrow.', timestamp: Date.now() - 4800000, status: 'seen' },
    { id: 2, sender: 'you', message: 'Great, looking forward to it!', timestamp: Date.now() - 4700000, status: 'seen' },
    { id: 3, sender: 'other', message: 'Bring your presentation slides.', timestamp: Date.now() - 4600000, status: 'delivered' },
    { id: 4, sender: 'you', message: "I'll have them ready.", timestamp: Date.now() - 4500000, status: 'delivered' },
    { id: 5, sender: 'other', message: 'Understood. Will send an email now.', timestamp: Date.now() - 4600000, status: 'delivered' },
  ],
  'Leslie Alexander': [
    { id: 1, sender: 'other', message: 'Are the designs finalized?', timestamp: Date.now() - 4500000, status: 'seen' },
    { id: 2, sender: 'you', message: 'Yes, sent them this morning.', timestamp: Date.now() - 4400000, status: 'seen' },
    { id: 3, sender: 'other', message: "Excellent! I'll review them shortly.", timestamp: Date.now() - 4300000, status: 'delivered' },
    { id: 4, sender: 'you', message: 'Let me know if you have any feedback.', timestamp: Date.now() - 4200000, status: 'delivered' },
    { id: 5, sender: 'other', message: 'Will do. Thanks!', timestamp: Date.now() - 4100000, status: 'delivered' },
  ]
};
const ChatWindow = () => {
  usePageTitle('Messages');
  const [messageInput, setMessageInput] = useState('');
  const [selectedUser, setSelectedUser] = useState('Jenny Wilson');
  const [conversations, setConversations] = useState(userConversations);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const conversation = conversations[selectedUser] || [];

  // ✅ Handle search input
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(`http://localhost:3000/api/messages/search?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setSearchResults(data);
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    }
  };

  // ✅ Select a user from search results
  const handleSelectUserFromSearch = (user) => {
    setSelectedUser(user.first_name);
    // Initialize conversation for new user if not exists
    if (!conversations[user.first_name]) {
      setConversations(prev => ({
        ...prev,
        [user.first_name]: []
      }));
    }
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  const sendMessage = () => {
    if (messageInput.trim() === '') return;
    const newMsg = {
      id: conversation.length + 1,
      sender: 'you',
      message: messageInput,
      timestamp: Date.now(),
      status: 'delivered',
    };
    setConversations((prev) => ({
      ...prev,
      [selectedUser]: [...prev[selectedUser], newMsg],
    }));
    setMessageInput('');
  };

  const handleDelete = (id) => {
    setConversations((prev) => ({
      ...prev,
      [selectedUser]: prev[selectedUser].filter((msg) => msg.id !== id),
    }));
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Message copied!');
    });
  };

  const handleForward = (id) => {
    const msg = conversation.find((m) => m.id === id);
    alert(`Forwarding message: "${msg.message}"`);
  };

  const handleEdit = (id, newText) => {
    setConversations((prev) => ({
      ...prev,
      [selectedUser]: prev[selectedUser].map((msg) =>
        msg.id === id ? { ...msg, message: newText, timestamp: Date.now() } : msg
      ),
    }));
  };

  return (
    <div className="app-container">
      <div className="chat-panel">
        <div className="chat-list-section">
          <h3 className="chat-list-heading">Chats</h3>
          <input 
            type="text" 
            placeholder="Search users..." 
            className="chat-list-search-input"
            value={searchQuery}
            onChange={handleSearch}
          />
          <div className="chat-list">
            {/* Show search results if searching */}
            {isSearching && searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div 
                  key={user._id} 
                  onClick={() => handleSelectUserFromSearch(user)}
                  style={{ cursor: 'pointer', padding: '10px', borderRadius: '8px', marginBottom: '8px', backgroundColor: '#f0f0f0' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={user.profile_pic} alt={user.first_name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                    <div>
                      <strong>{user.first_name}</strong>
                      <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>{user.email}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : isSearching ? (
              <div style={{ padding: '10px', color: '#999' }}>No users found</div>
            ) : (
              // Show default chat list
              messageListData.map((item) => (
                <div key={item.id} onClick={() => setSelectedUser(item.name)}>
                  <MessageListItem
                    avatar={item.avatar}
                    name={item.name}
                    lastMessage={item.lastMessage}
                    active={item.name === selectedUser}
                    sender={item.sender}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="chat-box">
          <div className="chat-header-small">
            <img src={messageListData.find(u => u.name === selectedUser)?.avatar} alt={selectedUser} />
            <span>{selectedUser}</span>
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
            <button className="attachment-button">📎</button>
            <button className="send-button" onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
