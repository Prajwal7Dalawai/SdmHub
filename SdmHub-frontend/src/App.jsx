import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import Sidebar from './pages/Sidebar';
import FriendRequestAndNotificationPage from "./pages/FriendRequestAndNotificationPage";
import ChatWindow from "./pages/ChatWindow";
import React from "react";

// Layout for protected routes
const MainLayout = ({ children }) => (
  <div className="app-container" style={{ display: "flex", minHeight: "100vh" }}>
    <Sidebar />
    <div style={{ flex: 1, padding: '0px' }}>{children}</div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes with sidebar */}
        <Route
          path="/friendAndNotify"
          element={
            <MainLayout>
              <FriendRequestAndNotificationPage />
            </MainLayout>
          }
        />
        <Route
          path="/chat"
          element={
            <MainLayout>
              <ChatWindow />
            </MainLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
=======
//import './App.css'
import SDMHUBAuth from './pages/SDMHUBAuth.jsx'
import NewsFeed from './pages/SDMHUBNewsPost.jsx'

function App() {
  return (
    <div className="App">
      <SDMHUBAuth />
      <NewsFeed />
    </div>
  )
}

export default App
// import React from 'react';
// import MessagesScreen from './MessageScreen.jsx';

// function App() {
//   return (
//     <div>
//       <MessagesScreen />
//     </div>
//   );
// }

// export default App;
