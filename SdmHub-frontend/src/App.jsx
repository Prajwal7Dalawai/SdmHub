// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import FriendRequestAndNotificationPage from "./pages/FriendRequestAndNotificationPage";
import ChatWindow from "./pages/ChatWindow";
import SDMHUBAuth from "./pages/SDMHUBAuth";
import Header from "./components/Hearder";
import NewsFeed from "./pages/SDMHUBNewsPost";
import React from "react";

// Layout for authenticated pages
const LayoutWithHeader = ({ children }) => (
  <>
    <Header />
    <div>{children}</div>
  </>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SDMHUBAuth />} />
        <Route path="/feed" element={<NewsFeed />} />

        {/* Routes with Header */}
        <Route
          path="/friendAndNotify"
          element={
            <LayoutWithHeader>
              <FriendRequestAndNotificationPage />
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
          path="/profile"
          element={
            <LayoutWithHeader>
              <ProfilePage />
            </LayoutWithHeader>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
