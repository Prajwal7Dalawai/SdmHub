// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import FriendRequestAndNotificationPage from "./pages/FriendRequestAndNotificationPage";
import ChatWindow from "./pages/ChatWindow";
import SDMHUBAuth from "./pages/SDMHUBAuth";
import Header from "./components/Hearder";
import Landing from "./pages/Landing";
import EditProfile from "./pages/EditProfile";
import NewsFeed from "./pages/SDMHUBNewsPost";
import React from "react";
import Loader from "./components/loader";

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
        <Route path="/load" element={<Loader />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Landing />} />
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
        <Route
          path="/editProfile"
          element={
            <LayoutWithHeader>
              <EditProfile />
            </LayoutWithHeader>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
