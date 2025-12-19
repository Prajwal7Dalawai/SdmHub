// ChatWindowDynamic.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import { debounce } from "lodash";
import axios from "axios";

import MessageListItem from "./MessageListItem";
import ChatBubble from "./ChatBubble";
import usePageTitle from "../hooks/usePageTitle";
import "../assets/css/style.css";
import plusIcon from "../assets/images/plus.png";

import { authService } from "../services/auth.service";
import { chatService } from "../services/chat.service";
import { userService } from "../services/user.service";
import CreateGroupModal from "./createGroupModal.jsx";

const API_BASE = "http://localhost:3000/api";
const SOCKET_URL = "http://localhost:3000";

const socket = io(SOCKET_URL, { transports: ["websocket"] });

const ChatWindow = () => {
  usePageTitle("Messages");

  const [currentUser, setCurrentUser] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const messagesEndRef = useRef(null);

  /* ---------------- SEARCH USERS / GROUPS ---------------- */
  const searchChats = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await axios.get(
        `${API_BASE}/messages/search?query=${encodeURIComponent(query)}`,
        { withCredentials: true }
      );  
      const results = (res.data || []).map((c) => ({
        id: c.id,
        type: c.type,
        name: c.name,
        profile_pic: c.profilePic,
        conversationId: c.conversationId
      }));

      setSearchResults(results);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const debouncedSearch = useCallback(debounce(searchChats, 300), []);
  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  const handleSearchInput = (e) => {
    const q = e.target.value;
    setSearchTerm(q);
    debouncedSearch(q);
  };

  /* ---------------- LOAD USER + CHAT LIST ---------------- */
  useEffect(() => {
    async function init() {
      try {
        const profile = await authService.getProfile();
        setCurrentUser(profile.data.user);

        const list = await userService.getChatList();
        console.log("Chat list -",list)
        setChatList(list);

        if (list.length > 0) setSelectedChat(list[0]);
      } catch (err) {
        console.error(err);
      }
    }
    init();
  }, []);

  /* ---------------- FETCH MESSAGES ---------------- */
  useEffect(() => {
    if (!currentUser || !selectedChat) {
      setMessages([]);
      return;
    }

    async function fetchMessages() {
      setLoadingMessages(true);
      try {
        let res;
        console.log("Seletced chat:",selectedChat);
        if (selectedChat.type === "group") {
          res = await chatService.getGroupMessages(selectedChat.conversationId);
        } else {
          res = await chatService.getMessages(selectedChat.conversationId); // USER ID
        }
        setMessages([]);
        setMessages(res.messages || []);
        console.log("Messages:", messages);
        setConversationId(res.conversation_id);
      } catch (err) {
        console.error("Fetch messages error:", err);
      } finally {
        setLoadingMessages(false);
      }
    }


    fetchMessages();
  }, [currentUser, selectedChat]);

  /* ---------------- SOCKET JOIN / LEAVE ---------------- */
  useEffect(() => {
    if (!conversationId) return;

    socket.emit("join_conversation", conversationId);

    return () => {
      socket.emit("leave_conversation", conversationId);
    };
  }, [conversationId]);

  /* ---------------- NEW MESSAGE LISTENER ---------------- */
  useEffect(() => {
    const handler = (msg) => {
      if (msg.conversation_id !== conversationId) return;
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("new_message", handler);
    return () => socket.off("new_message", handler);
  }, [conversationId]);

  /* ---------------- SEND MESSAGE ---------------- */
  const handleSend = async () => {
  if (!input.trim() || !selectedChat) return;

  setSending(true);

  try {
    await chatService.sendMessage({
      conversationId:
        selectedChat.type === "dm"
          ? selectedChat.conversationId
          : selectedChat.id,
      message: input.trim(),
    });

    setInput("");
  } catch (err) {
    console.error("Send message error:", err);
  } finally {
    setSending(false);
  }
};


const handleDeleteMessage = async (messageId) => {
  await chatService.deleteMessage(messageId);

  setMessages(prev =>
    prev.filter(msg => msg._id !== messageId)
  );
};



  /* ---------------- AUTOSCROLL ---------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------- ESC CLOSE MODAL ---------------- */
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsCreateGroupOpen(false);
    };

    if (isCreateGroupOpen) {
      window.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isCreateGroupOpen]);

  /* ---------------- UI ---------------- */
  return (
    <div className="app-container">
      <div className="chat-panel">

        {/* LEFT */}
        <div className="chat-list-section">
          <div className="heading-bar">
            <h3>Chats</h3>
            <button
              className="add-chat-btn"
              onClick={() => setIsCreateGroupOpen(true)}
            >
              <img src={plusIcon} className="add-chatIcon" />
            </button>
          </div>

          {isCreateGroupOpen && (
            <CreateGroupModal
              onClose={() => setIsCreateGroupOpen(false)}
              groupName={groupName}
              setGroupName={setGroupName}
              memberSearch={memberSearch}
              setMemberSearch={setMemberSearch}
              users={chatList.filter((c) => c.type === "dm")}
              selectedMembers={selectedMembers}
              setSelectedMembers={setSelectedMembers}
            />
          )}

          <input
            className="chat-list-search-input"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchInput}
          />

          {searchResults.length > 0 && (
            <div className="chat-list">
              {searchResults.map((c) => (
                <div
                  key={c.id}
                  onClick={async () => {
                    try {
                      const res = await chatService.startDM(c.id);
                      const conversationId = res.conversationId;

                      setSelectedChat({
                        id: c.id,
                        conversationId,
                        type: 'dm',
                        name: c.name,
                        profile_pic: c.profile_pic,
                      });

                      setSearchTerm("");
                      setSearchResults([]);

                    } catch (err) {
                      console.error("Failed to start DM:", err);
                    }
                  }}
                >
                  <MessageListItem
                    avatar={c.profile_pic}
                    name={c.name}
                    active={selectedChat?.id === c.id}
                  />
                </div>

              ))}
            </div>
          )}

          <div className="chat-list">
            {chatList.map((c) => (
              <div key={c._id} onClick={() => setSelectedChat(c)}>
                <MessageListItem
                  avatar={c.profile_pic}
                  name={c.name}
                  active={selectedChat?.id === c.id}
                />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="chat-box">
          <div className="chat-header-small">
            <img src={selectedChat?.profile_pic} />
            <span>{selectedChat?.name || "Select a chat"}</span>
          </div>

          <div className="chat-messages">
            {loadingMessages ? (
              <div>Loading...</div>
            ) : (
              <>
                {messages.map((msg) => (
                  <ChatBubble
                    key={msg._id} 
                    messageId={msg._id}   // for YOUR component
                    sender={
                      msg.sender_id?._id === currentUser?._id
                        ? "you"
                        : "other"
                    }
                    senderName={
                        msg.sender_id?._id === currentUser?._id
                          ? "You"
                          : msg.sender_id?.first_name || "Unknown"
                      }
                    message={msg.content}
                    timestamp={msg.updatedAt}
                    onDelete={handleDeleteMessage}
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="input-area">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
              placeholder={
                selectedChat ? `Message ${selectedChat.name}` : ""
              }
              disabled={!selectedChat}
            />
            <button
              className="send-button"
              onClick={handleSend}
              disabled={!selectedChat || sending}
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
