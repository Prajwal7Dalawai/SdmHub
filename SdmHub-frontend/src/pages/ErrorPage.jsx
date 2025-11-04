import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../assets/css/ErrorPage.css';

const ErrorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [errorDetails, setErrorDetails] = useState({
    title: 'Oops! Something went wrong',
    message: 'We encountered an unexpected error.',
    code: 'ERROR',
    type: 'general'
  });

  useEffect(() => {
    // Get error details from URL parameters
    const params = new URLSearchParams(location.search);
    const stateParam = params.get('state');
    
    if (stateParam) {
      try {
        const decodedState = JSON.parse(decodeURIComponent(stateParam));
        setErrorDetails(decodedState);
      } catch (error) {
        console.error('Error parsing state parameter:', error);
      }
    } else if (location.state) {
      // Fallback to location state if URL params are not present
      setErrorDetails(location.state);
    }

    // Log error details to the browser console
    if (errorDetails.message || errorDetails.stack) {
      console.error('Backend Error:', errorDetails.message);
      if (errorDetails.stack) {
        console.error('Stack Trace:', errorDetails.stack);
      }
    }
  }, [location]);

  // Define error type icons
  const errorIcons = {
    auth: '🔒',
    access: '🚫',
    notFound: '🔍',
    server: '⚙️',
    general: '⚠️'
  };

  // Get the appropriate icon based on error type
  const errorIcon = errorIcons[errorDetails.type] || errorIcons.general;

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="error-page">
      <div className="error-container">
        <div className="error-icon">{errorIcon}</div>
        <h1 className="error-title">{errorDetails.title}</h1>
        <p className="error-message">{errorDetails.message}</p>
        {errorDetails.code && (
          <div className="error-code">Error Code: {errorDetails.code}</div>
        )}
        <div className="error-actions">
          <button onClick={handleGoBack} className="back-button">
            Go Back
          </button>
          <button onClick={handleGoHome} className="home-button">
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage; 