import React, { createContext, useContext, useState } from 'react';
import Loader from '../components/loader';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const value = {
    setIsLoading
  };

  return (
    <LoadingContext.Provider value={value}>
      {isLoading && <Loader />}
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}; 