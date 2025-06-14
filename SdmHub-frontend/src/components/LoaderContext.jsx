import React, { createContext, useState, useContext } from "react";
import Loader from "./loader";

const LoaderContext = createContext();

export function useLoader() {
  return useContext(LoaderContext);
}

export function LoaderProvider({ children }) {
  const [loading, setLoading] = useState(false);

  return (
    <LoaderContext.Provider value={{ loading, setLoading }}>
      <div style={{ position: "relative" }}>
        {/* Main content, blurred if loading */}
        <div
          style={{
            filter: loading ? "blur(4px)" : "none",
            transition: "filter 0.3s"
          }}
        >
          {children}
        </div>
        {/* Loader overlay */}
        {loading && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              pointerEvents: "all"
            }}
          >
            <Loader />
          </div>
        )}
      </div>
    </LoaderContext.Provider>
  );
} 