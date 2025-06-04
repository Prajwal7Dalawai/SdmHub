import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import LoginScreen from './pages/LoginScreen';
import NotificationScreen from "./pages/NotificationScreen";
import MessagesScreen from './pages/MessagesScreen';
import Header from './pages/Header';
import ProfilePage from "./pages/ProfilePage";
import { Fragment } from "react";

// Component to conditionally render Header
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const hideHeader = location.pathname === "/login";

  return (
    <Fragment>
      {!hideHeader && <Header />}
      {children}
    </Fragment>
  );
};

function App() {
  return (
    <Router>
      <LayoutWrapper>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/Friendnotify" element={<NotificationScreen />} />
          <Route path="/messages" element={<MessagesScreen />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </LayoutWrapper>
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
