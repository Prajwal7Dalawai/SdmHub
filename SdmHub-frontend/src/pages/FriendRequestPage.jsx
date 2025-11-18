import React, { useState, useEffect, useCallback } from "react";
import "../assets/css/FriendRequestAndNotificationPage.css";
import usePageTitle from "../hooks/usePageTitle";
import axios from "axios";
import { debounce } from "lodash";

const API_BASE = "http://localhost:3000/api";

const FriendRequestPage = () => {
  usePageTitle("Friends");

  const [activeTabBox1, setActiveTabBox1] = useState("requests");
  const [activeSuggestionFilter, setActiveSuggestionFilter] = useState("mutual"); // default mutual

  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [toasts, setToasts] = useState([]);

  const pushToast = (text, ttl = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ttl);
  };

  // ---------- Fetch Functions ----------
  const fetchFriendRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/friends/requests`, { withCredentials: true });
      setFriendRequests(res.data || []);
    } catch (err) {
      console.error("Error fetching friend requests:", err);
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await axios.get(`${API_BASE}/friends`, { withCredentials: true });
      setFriends(res.data || []);
    } catch (err) {
      console.error("Error fetching friends:", err);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/friends/sent`, { withCredentials: true });
      const sentIds = (res.data || []).map((u) => String(u._id));
      setSentRequests(sentIds);
    } catch (err) {
      console.error("Error fetching sent requests:", err);
    }
  };

  // ---------- Suggestions Fetcher ----------
  const fetchSuggestions = async (filter = activeSuggestionFilter) => {
    try {
      let endpoint = `${API_BASE}/recommend/mutual`;

      if (filter === "community") {
        endpoint = `${API_BASE}/community`;
      }

      const res = await axios.get(endpoint, { withCredentials: true });
      let data = res.data || [];

      if (filter === "mutual") {
        // ✅ Show only top 5 based on mutual friends
        data = data.sort((a, b) => b.mutualFriends - a.mutualFriends).slice(0, 5);
      }

      setSuggestions(data);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    }
  };

  // ---------- Search ----------
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE}/users/search?query=${encodeURIComponent(query)}`, {
        withCredentials: true,
      });
      const results = (res.data || []).map((u) => ({ ...u, _id: u._id || u.id }));
      setSearchResults(results);
    } catch (err) {
      console.error("Error searching users:", err);
    }
  };

  const debouncedSearch = useCallback(debounce(searchUsers, 300), []);
  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    debouncedSearch(query);
  };

  // ---------- Actions ----------
  const handleSendFriendRequest = async (id) => {
    if (!id) return;
    setSentRequests((prev) => (prev.includes(id) ? prev : [...prev, id]));
    try {
      await axios.post(`${API_BASE}/friends/request/${id}`, {}, { withCredentials: true });
      pushToast("Friend request sent!");
      fetchSuggestions(activeSuggestionFilter);
      if (activeTabBox1 === "search" && searchTerm.trim() !== "") searchUsers(searchTerm);
    } catch (err) {
      setSentRequests((prev) => prev.filter((x) => x !== id));
      pushToast(err.response?.data?.msg || "Error sending request");
    }
  };

  const handleAcceptFriendRequest = async (id) => {
    if (!id) return;
    setFriendRequests((prev) => prev.filter((req) => String(req._id) !== String(id)));
    try {
      await axios.post(`${API_BASE}/friends/accept/${id}`, {}, { withCredentials: true });
      pushToast("Friend request accepted!");
      fetchFriends();
    } catch (err) {
      pushToast(err.response?.data?.msg || "Error accepting request");
      fetchFriendRequests();
    }
  };

  const handleDeclineFriendRequest = async (id) => {
    if (!id) return;
    setFriendRequests((prev) => prev.filter((req) => String(req._id) !== String(id)));
    try {
      await axios.post(`${API_BASE}/friends/decline/${id}`, {}, { withCredentials: true });
      pushToast("Friend request declined");
    } catch (err) {
      pushToast(err.response?.data?.msg || "Error declining request");
      fetchFriendRequests();
    }
  };

  // ---------- Effects ----------
  useEffect(() => {
    fetchFriendRequests();
    fetchFriends();
    fetchSuggestions(activeSuggestionFilter);
    fetchSentRequests();
  }, []);

  useEffect(() => {
    fetchSuggestions(activeSuggestionFilter);
  }, [activeSuggestionFilter]);

  const filteredSuggestions = suggestions;

  // ---------- Render ----------
  return (
    <div className="friends-wrapper">
      {/* Toasts */}
      <div className="toasts-container" style={{ position: "fixed", top: 16, right: 16, zIndex: 9999 }}>
        {toasts.map((t) => (
          <div key={t.id} className="toast">{t.text}</div>
        ))}
      </div>

      {/* ---------- BOX 1 ---------- */}
      <div className="card engage-card">
        <h2>Connect with Others</h2>

        <div className="tabs">
          <button className={`tab ${activeTabBox1 === "requests" ? "active" : ""}`} onClick={() => setActiveTabBox1("requests")}>
            Friend Requests
          </button>
          <button className={`tab ${activeTabBox1 === "friends" ? "active" : ""}`} onClick={() => setActiveTabBox1("friends")}>
            Your Friends
          </button>
          <button className={`tab ${activeTabBox1 === "search" ? "active" : ""}`} onClick={() => setActiveTabBox1("search")}>
            Search Friend
          </button>
        </div>

        {/* ---------- Friend Requests ---------- */}
        {activeTabBox1 === "requests" && (
          <div className="section">
            {friendRequests.length === 0 ? (
              <p className="empty-text">No new requests</p>
            ) : (
              friendRequests.map((req) => (
                <div key={req._id} className="people-item">
                  <div className="person-info">
                    <img src={req.profilePic} alt={req.name} />
                    <div>
                      <h5>{req.name}</h5>
                      <p>{req.mutualFriends || 0} mutual friends</p>
                    </div>
                  </div>
                  <div className="action-btns">
                    <button className="btn accept" onClick={() => handleAcceptFriendRequest(req._id)}>✅ Accept</button>
                    <button className="btn decline" onClick={() => handleDeclineFriendRequest(req._id)}>❌ Decline</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ---------- Your Friends ---------- */}
        {activeTabBox1 === "friends" && (
          <div className="section">
            {friends.length === 0 ? (
              <p className="empty-text">You have no friends yet</p>
            ) : (
              friends.map((f) => (
                <div key={f._id} className="people-item">
                  <div className="person-info">
                    <img src={f.profilePic} alt={f.name} />
                    <div>
                      <h5>{f.name}</h5>
                      <p>{f.mutualFriends || 0} mutual friends</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ---------- Search Friend ---------- */}
        {activeTabBox1 === "search" && (
          <div className="section">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Search for a friend..."
                value={searchTerm}
                onChange={handleSearchInput}
                className="search-input"
              />
            </div>
            {searchTerm.trim() === "" ? (
              <p className="empty-text">Start typing to search for friends</p>
            ) : searchResults.length === 0 ? (
              <p className="empty-text">No users found</p>
            ) : (
              searchResults.map((person) => {
                const isSent = sentRequests.includes(String(person._id));
                const isFriend = friends.some((f) => String(f._id) === String(person._id));
                return (
                  <div key={person._id} className="people-item">
                    <div className="person-info">
                      <img src={person.profilePic} alt={person.name} />
                      <div>
                        <h5>{person.name}</h5>
                        <p>{person.mutualFriends || 0} mutual friends</p>
                      </div>
                    </div>
                    <button
                      className={`btn ${isFriend ? "friend" : isSent ? "sent" : "add"}`}
                      onClick={() => handleSendFriendRequest(person._id)}
                      disabled={isFriend || isSent}
                    >
                      {isFriend ? "✔ Already Friend" : isSent ? "✅ Request Sent" : "➕ Add Friend"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ---------- BOX 2 ---------- */}
      <div className="card network-card">
        <h2>People You May Know</h2>

        {/* ✅ Two Filters */}
        <div className="tabs small-tabs">
          <button
            className={`tab ${activeSuggestionFilter === "mutual" ? "active" : ""}`}
            onClick={() => setActiveSuggestionFilter("mutual")}
          >
            Based on Mutual Friends
          </button>
          <button
            className={`tab ${activeSuggestionFilter === "community" ? "active" : ""}`}
            onClick={() => setActiveSuggestionFilter("community")}
          >
            Explore by Domain
          </button>
        </div>

        <div className="section">
          {filteredSuggestions.length === 0 ? (
            <p className="empty-text">No suggestions available</p>
          ) : (
            filteredSuggestions.map((person) => {
              const isSent = sentRequests.includes(String(person._id));
              const isFriend = friends.some((f) => String(f._id) === String(person._id));
              return (
                <div key={person._id} className="people-item">
                  <div className="person-info">
                    <img src={person.profilePic} alt={person.name} />
                    <div>
                      <h5>{person.name}</h5>
                      <p>{person.mutualFriends || 0} mutual friends</p>
                    </div>
                  </div>
                  <button
                    className={`btn ${isFriend ? "friend" : isSent ? "sent" : "add"}`}
                    onClick={() => handleSendFriendRequest(person._id)}
                    disabled={isFriend || isSent}
                  >
                    {isFriend
                      ? "✔ Already Friend"
                      : isSent
                      ? "✅ Request Sent"
                      : "➕ Add Friend"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendRequestPage;
