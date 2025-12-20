// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import FriendRequestPage from "./pages/FriendRequestPage";
import ChatWindow from "./pages/ChatWindowDynamic";
import Header from "./components/Hearder";
import Landing from "./pages/Landing";
import EditProfile from "./pages/EditProfile";
import SDMHUBAuth from "./pages/SDMHUBAuth";
import NewsFeed from "./pages/NewsFeed";
import ErrorPage from "./pages/ErrorPage";
import React, { useEffect } from "react";
import PostDetail from "./pages/PostDetail";

// 🔥 ADD THESE TWO IMPORTS
import { io } from "socket.io-client";
import NotificationsPage from "./pages/NotificationsPage";  // <- your existing UI page

// Layout for authenticated pages
const LayoutWithHeader = ({ children }) => (
  <>
    <Header />
    <div>{children}</div>
  </>
);

function App() {

  // 🔥 ADD THIS useEffect (REAL-TIME NOTIFICATIONS)
  useEffect(() => {
    const socket = io("http://localhost:3000", { withCredentials: true });

    // Get userId from wherever you store it (localStorage or session)
    const storedUser = localStorage.getItem("user");

    let userId = null;
    if (storedUser) {
      try {
        userId = JSON.parse(storedUser)._id;
      } catch (e) {}
    }

    if (userId) {
      socket.emit("join", userId); // join private notification room
    }

    socket.on("newNotification", () => {
      // 🔥 Trigger global refresh for notification bell + page
      window.dispatchEvent(new Event("reloadNotifications"));
    });

    return () => socket.disconnect();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signUp" element={<SDMHUBAuth />} />
        <Route path="/" element={<Landing />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/post/:postId" element={<PostDetail />} />

        {/* 🔥 FIX THIS — it should show notification UI */}
        <Route path="/notifications" element={
          <LayoutWithHeader>
            <NotificationsPage />
          </LayoutWithHeader>
        } />

        {/* Authenticated Routes */}
        <Route
          path="/friend"
          element={
            <LayoutWithHeader>
              <FriendRequestPage />
            </LayoutWithHeader>
          }
        />
        <Route
          path="/feed"
          element={
            <LayoutWithHeader>
              <NewsFeed />
            </LayoutWithHeader>
          }
        />
        <Route
          path="/chat"
          element={
            <LayoutWithHeader>
              <ChatWindow />
            </LayoutWithHeader>
          }
        />
        <Route
          path="/notifications"
          element={
            <LayoutWithHeader>
              <Notifications />
            </LayoutWithHeader>
          }
        />
        <Route
          path="/profile"
          element={
            <LayoutWithHeader>
              <ProfilePage />
            </LayoutWithHeader>
          }
        />
        <Route
          path="/editProfile"
          element={
            <LayoutWithHeader>
              <EditProfile />
            </LayoutWithHeader>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-reset" element={<VerifyResetOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

      </Routes>
    </Router>
  );
}

export default App;
