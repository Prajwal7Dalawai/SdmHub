// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import FriendRequestAndNotificationPage from "./pages/FriendRequestAndNotificationPage";
import ChatWindow from "./pages/ChatWindow";
import SDMHUBAuth from "./pages/SDMHUBAuth";
import Header from "./components/Hearder";
import Landing from "./pages/Landing";
import EditProfile from "./pages/EditProfile";
import NewsFeed from "./pages/SDMHUBNewsPost";
import React, { Suspense, useEffect } from "react";
import { LoadingProvider, useLoading } from "./context/LoadingContext";
import './assets/css/responsive.css'; // Import responsive styles

// Layout for authenticated pages
const LayoutWithHeader = ({ children }) => (
  <>
    <Header />
    <div>{children}</div>
  </>
);

// Component to handle page titles and loading state
const PageHandler = () => {
  const location = useLocation();
  const { setIsLoading } = useLoading();
  
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate a minimum loading time of 500ms
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [location.pathname, setIsLoading]);

  useEffect(() => {
    const pathToTitle = {
      '/': 'SDMHUB',
      '/login': 'Login - SDMHUB',
      '/signup': 'Sign Up - SDMHUB',
      '/feed': 'News Feed - SDMHUB',
      '/friendAndNotify': 'Friends & Notifications - SDMHUB',
      '/chat': 'Messages - SDMHUB',
      '/profile': 'Profile - SDMHUB',
      '/editProfile': 'Edit Profile - SDMHUB'
    };

    const title = pathToTitle[location.pathname] || 'SDMHUB';
    document.title = title;
  }, [location.pathname]);

  return null;
};

// Wrap each route component with Suspense
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={null}>
    {children}
  </Suspense>
);

function App() {
  return (
    <Router>
      <LoadingProvider>
        <PageHandler />
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <SuspenseWrapper>
                <LoginPage />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <SuspenseWrapper>
                <SDMHUBAuth />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="/" 
            element={
              <SuspenseWrapper>
                <Landing />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="/feed" 
            element={
              <SuspenseWrapper>
                <NewsFeed />
              </SuspenseWrapper>
            } 
          />

          {/* Routes with Header */}
          <Route
            path="/friendAndNotify"
            element={
              <SuspenseWrapper>
                <LayoutWithHeader>
                  <FriendRequestAndNotificationPage />
                </LayoutWithHeader>
              </SuspenseWrapper>
            }
          />
          <Route
            path="/chat"
            element={
              <SuspenseWrapper>
                <LayoutWithHeader>
                  <ChatWindow />
                </LayoutWithHeader>
              </SuspenseWrapper>
            }
          />
          <Route
            path="/profile"
            element={
              <SuspenseWrapper>
                <LayoutWithHeader>
                  <ProfilePage />
                </LayoutWithHeader>
              </SuspenseWrapper>
            }
          />
          <Route
            path="/editProfile"
            element={
              <SuspenseWrapper>
                <LayoutWithHeader>
                  <EditProfile />
                </LayoutWithHeader>
              </SuspenseWrapper>
            }
          />
        </Routes>
      </LoadingProvider>
    </Router>
  );
}

export default App;
