// ChatWindowDynamic.jsx
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import MessageListItem from "./MessageListItem";
import ChatBubble from "./ChatBubble";
import usePageTitle from "../hooks/usePageTitle";
import "../assets/css/style.css";

// Services (you said these are already implemented)
import { authService } from "../services/auth.service";
import { chatService } from "../services/chat.service";
import { userService } from "../services/user.service";

// Socket config — change URL if needed
const SOCKET_URL = "http://localhost:8080";
const socket = io(SOCKET_URL, { transports: ["websocket"] });

const ChatWindow = () => {
  usePageTitle("Messages");

  const [currentUser, setCurrentUser] = useState(null); // logged-in user
  const [users, setUsers] = useState([]);               // all chatable users (left list)
  const [selectedUser, setSelectedUser] = useState(null); // the receiver object
  const [messages, setMessages] = useState([]);         // messages with selectedUser
  const [input, setInput] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // ---------- 1) load current user and user list ----------
  useEffect(() => {
    async function init() {
      try {
        const profileRes = await authService.getProfile();
        const me = profileRes.data.user;
        setCurrentUser(me);

        // fetch all users (exclude self)
        const usersRes = await userService.getAllUsers();
        const all = (usersRes.data || []).filter(u => u._id !== me._id);
        setUsers(all);

        // auto-select first user (optional)
        if (all.length > 0) setSelectedUser(all[0]);
      } catch (err) {
        console.error("Init error:", err);
      }
    }
    init();
  }, []);

  // ---------- 2) join socket room as soon as logged-in user is available ----------
  useEffect(() => {
    if (!currentUser) return;
    socket.emit("join", currentUser._id);
    // optionally listen to connection errors
    socket.on("connect_error", (err) => console.warn("Socket connect error", err));
    return () => {
      socket.off("connect_error");
    };
  }, [currentUser]);

  // ---------- 3) fetch messages for the selected user ----------
  useEffect(() => {
    if (!currentUser || !selectedUser) {
      setMessages([]);
      return;
    }

    async function fetchMessages() {
      setLoadingMessages(true);
      try {
        const res = await chatService.getMessages(currentUser._id, selectedUser._id);
        // expected: array of message objects matching messageSchema
        setMessages(res.data || []);
        // optional: inform backend to mark delivered/read - depends on your API
        // await chatService.markDelivered(currentUser._id, selectedUser._id);
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
      setLoadingMessages(false);
    }
    fetchMessages();
  }, [currentUser, selectedUser]);

  // ---------- 4) listen for real-time incoming messages ----------
  useEffect(() => {
    const handler = (msg) => {
      // msg should be the saved message object with sender_id, receiver_id, ciphertext, created_at, etc.
      if (!currentUser || !selectedUser) return;

      // Only append if message belongs to the open convo (sender or receiver)
      const match =
        (msg.sender_id === selectedUser._id && msg.receiver_id === currentUser._id) ||
        (msg.sender_id === currentUser._id && msg.receiver_id === selectedUser._id);

      if (match) {
        setMessages(prev => [...prev, msg]);
      }

      // you may also want to update the users list preview (last message) — implement if desired
    };

    socket.on("receiveMessage", handler);
    return () => {
      socket.off("receiveMessage", handler);
    };
  }, [currentUser, selectedUser]);

  // ---------- 5) send message ----------
  const handleSend = async () => {
    if (!input.trim() || !currentUser || !selectedUser) return;
    setSending(true);

    // Build payload according to your schema
    const payload = {
      sender_id: currentUser._id,
      receiver_id: selectedUser._id,
      ciphertext: input.trim(),
      created_at: new Date()
    };

    try {
      // Persist to backend (chatService.sendMessage should POST /api/chat and return saved doc)
      const res = await chatService.sendMessage(payload);
      const saved = res.data;

      // Emit via socket for real-time delivery
      socket.emit("sendMessage", saved);

      // Optimistically add to chat
      setMessages(prev => [...prev, saved]);
      setInput("");
    } catch (err) {
      console.error("Send failed:", err);
      // show notification to user as needed
    }

    setSending(false);
  };

  // ---------- 6) edit message ----------
  const handleEdit = async (messageId, newText) => {
    if (!messageId) return;
    try {
      const res = await chatService.editMessage(messageId, { ciphertext: newText });
      const updated = res.data;
      setMessages(prev => prev.map(m => (m._id === messageId ? updated : m)));
    } catch (err) {
      console.error("Edit error:", err);
    }
  };

  // ---------- 7) delete message ----------
  const handleDelete = async (messageId) => {
    if (!messageId) return;
    try {
      await chatService.deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m._id !== messageId));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ---------- 8) copy / forward ----------
  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      // small UX cue
      alert("Message copied to clipboard");
    });
  };

  const handleForward = (messageId) => {
    const msg = messages.find(m => m._id === messageId);
    if (!msg) return;
    // For now simple alert — implement forward UI as needed
    alert(`Forwarding: ${msg.ciphertext}`);
  };

  // ---------- 9) scroll to bottom whenever messages change ----------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------- 10) UI render ----------
  return (
    <div className="app-container">
      <div className="chat-panel">
        {/* Left: user list */}
        <div className="chat-list-section">
          <h3 className="chat-list-heading">Chats</h3>
          <input type="text" placeholder="Search..." className="chat-list-search-input" />
          <div className="chat-list">
            {users.map(u => (
              <div key={u._id} onClick={() => setSelectedUser(u)}>
                <MessageListItem
                  avatar={u.profile_pic || "https://via.placeholder.com/40"}
                  name={u.first_name || u.name || "Unknown"}
                  lastMessage={/* optional: show last message snippet, implement if you maintain it */ ""}
                  active={selectedUser?._id === u._id}
                  sender={u.first_name}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Middle: chat box */}
        <div className="chat-box">
          <div className="chat-header-small">
            <img
              src={selectedUser?.profile_pic || "https://via.placeholder.com/40"}
              alt={selectedUser?.first_name || "Select"}
            />
            <span>{selectedUser?.first_name || "Select a chat"}</span>
          </div>

          <div className="chat-messages" style={{ minHeight: 300 }}>
            {loadingMessages ? (
              <div>Loading messages...</div>
            ) : (
              <>
                {messages.map(msg => {
                  const isYou = msg.sender_id === currentUser?._id || msg.sender_id === currentUser?._id?.toString();
                  const status = msg.is_read ? "seen" : (msg.delivered ? "delivered" : "sent");
                  return (
                    <ChatBubble
                      key={msg._id}
                      id={msg._id}
                      sender={isYou ? "you" : "other"}
                      message={msg.ciphertext}
                      timestamp={msg.created_at}
                      status={status}
                      onDelete={() => handleDelete(msg._id)}
                      onEdit={(id, newText) => handleEdit(id, newText)}
                      onCopy={() => handleCopy(msg.ciphertext)}
                      onForward={() => handleForward(msg._id)}
                    />
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="input-area">
            <input
              type="text"
              placeholder={selectedUser ? `Message ${selectedUser.first_name}` : "Select a user to start"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              disabled={!selectedUser || sending}
            />
            <button className="attachment-button" disabled={!selectedUser}>📎</button>
            <button className="send-button" onClick={handleSend} disabled={!selectedUser || sending}>
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
// ChatWindowDynamic.jsx