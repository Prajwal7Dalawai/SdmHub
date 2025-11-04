import React, { useState, useEffect, useCallback } from "react";
import "../assets/css/FriendRequestAndNotificationPage.css";
import usePageTitle from "../hooks/usePageTitle";
import axios from "axios";
import { debounce } from "lodash";

const API_BASE = "http://localhost:3000/api";

const FriendRequestPage = () => {
  usePageTitle("Friends");

  // UI state
  const [activeTabBox1, setActiveTabBox1] = useState("requests");
  const [activeTabBox2, setActiveTabBox2] = useState("friends");

  const [friendRequests, setFriendRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [friends, setFriends] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [sentRequests, setSentRequests] = useState([]);
  const [toasts, setToasts] = useState([]);

  const pushToast = (text, ttl = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter(x => x.id !== id)), ttl);
  };

  // ---------- FETCH FUNCTIONS ----------
  const fetchFriendRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/friends/requests`, { withCredentials: true });
      setFriendRequests(res.data || []);
    } catch (err) {
      console.error("Error fetching friend requests:", err);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/friends/suggestions`, { withCredentials: true });
      setSuggestions(res.data || []);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
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
      const sentIds = (res.data || []).map(u => String(u._id));
      setSentRequests(sentIds);
    } catch (err) {
      console.error("Error fetching sent requests:", err);
    }
  };

  // ---------- SEARCH ----------
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE}/users/search?query=${encodeURIComponent(query)}`, { withCredentials: true });
      const results = (res.data || []).map((u) => ({ ...u, _id: u._id || u.id }));
      setSearchResults(results);
    } catch (err) {
      console.error("Error searching users:", err);
    }
  };

  const debouncedSearch = useCallback(debounce(searchUsers, 300), []);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    debouncedSearch(query);
  };

  // ---------- ACTIONS ----------
  const handleSendFriendRequest = async (id) => {
    if (!id) return;
    setSentRequests(prev => prev.includes(id) ? prev : [...prev, id]);

    try {
      await axios.post(`${API_BASE}/friends/request/${id}`, {}, { withCredentials: true });
      pushToast("Friend request sent!");
      fetchSuggestions();
      if (activeTabBox1 === "search" && searchTerm.trim() !== "") {
        searchUsers(searchTerm);
      }
    } catch (err) {
      setSentRequests(prev => prev.filter(x => x !== id));
      const msg = err.response?.data?.msg || "Error sending request";
      console.error("Error sending friend request:", err.response?.data || err.message);
      pushToast(msg);
    }
  };

  const handleAcceptFriendRequest = async (id) => {
    if (!id) return;
    setFriendRequests(prev => prev.filter(req => String(req._id) !== String(id)));

    try {
      const userId = localStorage.getItem("userId");
      await axios.post(
        `${API_BASE}/friends/accept/${id}`,
        { userId },
        { withCredentials: true }
      );
      pushToast("Friend request accepted!");
      fetchFriends();
    } catch (err) {
      console.error("❌ Error accepting request:", err);
      pushToast(err.response?.data?.msg || "Error accepting request");
      fetchFriendRequests();
    }
  };

  const handleDeclineFriendRequest = async (id) => {
    if (!id) return;
    setFriendRequests(prev => prev.filter(req => String(req._id) !== String(id)));

    try {
      await axios.post(`${API_BASE}/friends/decline/${id}`, {}, { withCredentials: true });
      pushToast("Friend request declined");
    } catch (err) {
      console.error("Error declining request:", err);
      pushToast(err.response?.data?.msg || "Error declining request");
      fetchFriendRequests();
    }
  };

  // ---------- MOUNT ----------
  useEffect(() => {
    fetchFriendRequests();
    fetchSuggestions();
    fetchFriends();
    fetchSentRequests();
  }, []);

  // ---------- RENDER ----------
  return (
    <div className="friends-wrapper">
      {/* Toasts */}
      <div className="toasts-container" style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
        {toasts.map(t => (
          <div key={t.id} className="toast">{t.text}</div>
        ))}
      </div>

      {/* ---------- BOX 1 ---------- */}
      <div className="card engage-card">
        <h2>Connect with Others</h2>

        <div className="tabs">
          <button className={`tab ${activeTabBox1 === "requests" ? "active" : ""}`} onClick={() => setActiveTabBox1("requests")}>Friend Requests</button>
          <button className={`tab ${activeTabBox1 === "suggestions" ? "active" : ""}`} onClick={() => setActiveTabBox1("suggestions")}>People You May Know</button>
          <button className={`tab ${activeTabBox1 === "search" ? "active" : ""}`} onClick={() => setActiveTabBox1("search")}>Search Friend</button>
        </div>

        {/* FRIEND REQUESTS */}
        {activeTabBox1 === "requests" && (
          <div className="section">
            {friendRequests.length === 0 ? <p className="empty-text">No new requests</p> :
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
              ))}
          </div>
        )}

        {/* SUGGESTIONS */}
        {activeTabBox1 === "suggestions" && (
          <div className="section">
            {suggestions.length === 0 ? <p className="empty-text">No suggestions available</p> :
              suggestions.map((person) => {
                const isSent = sentRequests.includes(String(person._id));
                const isFriend = friends.some(f => String(f._id) === String(person._id));

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
              })}
          </div>
        )}

        {/* SEARCH */}
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

            {searchTerm.trim() === "" ? <p className="empty-text">Start typing to search for friends</p> :
              searchResults.length === 0 ? <p className="empty-text">No users found</p> :
                searchResults.map((person) => {
                  const isSent = sentRequests.includes(String(person._id));
                  const isFriend = friends.some(f => String(f._id) === String(person._id));

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
                })}
          </div>
        )}
      </div>

      {/* ---------- BOX 2 ---------- */}
      <div className="card network-card">
        <h2>Your Friends</h2>

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
      </div>
    </div>
  );
};

export default FriendRequestPage;
