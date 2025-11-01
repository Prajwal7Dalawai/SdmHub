// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import FriendRequestPage from "./pages/FriendRequestPage";
import ChatWindow from "./pages/ChatWindow";
import Header from "./components/Hearder";
import Landing from "./pages/Landing";
import EditProfile from "./pages/EditProfile";
import SDMHUBAuth from "./pages/SDMHUBAuth";
import NewsFeed from "./pages/NewsFeed";
import ErrorPage from "./pages/ErrorPage";
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
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signUp" element={<SDMHUBAuth />} />
        <Route path="/" element={<Landing />} />
        <Route path="/error" element={<ErrorPage />} />
        
        {/* Routes with Header */}
        
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
