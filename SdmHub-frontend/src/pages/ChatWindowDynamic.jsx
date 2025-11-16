// ChatWindowDynamic.jsx
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

import MessageListItem from "./MessageListItem";
import ChatBubble from "./ChatBubble";
import usePageTitle from "../hooks/usePageTitle";
import "../assets/css/style.css";

import { authService } from "../services/auth.service";
import { chatService } from "../services/chat.service";
import { userService } from "../services/user.service";

const SOCKET_URL = "http://localhost:3000";
const socket = io(SOCKET_URL, { transports: ["websocket"] });

const ChatWindow = () => {
  usePageTitle("Messages");

  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesEndRef = useRef(null);

  // -----------------------------------------
  // Load logged-in user + chat list
  // -----------------------------------------
  useEffect(() => {
    async function init() {
      try {
        const profile = await authService.getProfile();
        const me = profile.data.user;
        setCurrentUser(me);

        const list = await userService.getChatList();
        const filtered = (list || []).filter((u) => u.id !== me.id);
        setUsers(filtered);

        if (filtered.length > 0) setSelectedUser(filtered[0]);
      } catch (err) {}
    }
    init();
  }, []);

  // -----------------------------------------
  // Fetch messages for selected conversation
  // -----------------------------------------
  useEffect(() => {
    if (!currentUser || !selectedUser) {
      setMessages([]);
      return;
    }

    async function fetchMessages() {
      setLoadingMessages(true);
      try {
        const res = await chatService.getMessages(selectedUser.id);
        const msgs = res.messages || [];
        const convId = res.conversation_id ? res.conversation_id.toString() : null;

        setMessages(msgs);

        if (!convId) {
          if (conversationId) socket.emit("leave_conversation", conversationId);
          setConversationId(null);
          return;
        }

        setConversationId(convId);
      } catch (err) {
      } finally {
        setLoadingMessages(false);
      }
    }

    fetchMessages();
  }, [currentUser, selectedUser]);

  // -----------------------------------------
  // Join/leave socket room
  // -----------------------------------------
  useEffect(() => {
    if (!conversationId) return;

    socket.emit("join_conversation", conversationId);

    return () => {
      socket.emit("leave_conversation", conversationId);
    };
  }, [conversationId]);

  // -----------------------------------------
  // Listen for new incoming messages
  // -----------------------------------------
  useEffect(() => {
    const handler = (msg) => {
      if (msg.conversation_id !== conversationId) return;
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("new_message", handler);
    return () => socket.off("new_message", handler);
  }, [conversationId]);

  // -----------------------------------------
  // Send message
  // -----------------------------------------
  const handleSend = async () => {
    if (!input.trim() || !selectedUser || !currentUser) return;

    setSending(true);

    try {
      await chatService.sendMessage({
        recieverId: selectedUser.id,
        message: input.trim(),
      });

      setInput("");
    } catch (err) {}

    setSending(false);
  };

  // -----------------------------------------
  // Auto-scroll bottom
  // -----------------------------------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // -----------------------------------------
  // UI
  // -----------------------------------------
  return (
    <div className="app-container">
      <div className="chat-panel">

        {/* LEFT - User List */}
        <div className="chat-list-section">
          <h3 className="chat-list-heading">Chats</h3>
          <input type="text" placeholder="Search..." className="chat-list-search-input" />

          <div className="chat-list">
            {users.map((u) => (
              <div key={u.id} onClick={() => setSelectedUser(u)}>
                <MessageListItem
                  avatar={u.profile_pic}
                  name={u.name}
                  active={selectedUser?.id === u.id}
                />
              </div>
            ))}
          </div>
        </div>

        {/* MIDDLE - Chat Window */}
        <div className="chat-box">
          <div className="chat-header-small">
            <img src={selectedUser?.profile_pic} alt="" />
            <span>{selectedUser?.name || "Select a chat"}</span>
          </div>

          {/* Messages */}
          <div className="chat-messages" style={{ minHeight: 300 }}>
            {loadingMessages ? (
              <div>Loading messages...</div>
            ) : (
              <>
                {messages.map((msg) => {
                  const isYou =
                    msg.sender_id?._id?.toString() === currentUser?._id?.toString()
                      ? "you"
                      : "other";

                  return (
                    <ChatBubble
                      key={msg._id}
                      sender={isYou}
                      message={msg.content}
                      timestamp={msg.updatedAt}
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
              value={input}
              placeholder={selectedUser ? `Message ${selectedUser.name}` : ""}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={!selectedUser || sending}
            />

            <button className="attachment-button" disabled={!selectedUser}>📎</button>

            <button
              className="send-button"
              onClick={handleSend}
              disabled={!selectedUser || sending}
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
