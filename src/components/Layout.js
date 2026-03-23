import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useLocation } from "react-router-dom";
import Loading from "./Loading"; // 👈 make sure this is your custom loader component

// const Layout = ({ children, onThemeToggle }) => {
const Layout = ({ children, onThemeToggle, onSearch }) => {
  const location = useLocation();
  const path = location.pathname;

  const [loading, setLoading] = useState(true); // 🔥 control loading state

  useEffect(() => {
    setLoading(true); // Trigger loading on route change

    const timer = setTimeout(() => {
      setLoading(false); // Delay just to simulate loader effect
    }, 700); // ⏱️ adjust this time as you vibe

    return () => clearTimeout(timer); // cleanup timeout
  }, [location]);

  const isAuthPage = path === "/login" || path === "/signup" || path === "/";

  // 🧿 Auth Pages: Just render the page content (login/signup)
  if (isAuthPage) {
    return <main style={{ width: "100%", height: "100vh" }}>{children}</main>;
  }

  // 🎯 Default Layout: Sidebar + Navbar + Main Content
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flexGrow: 1, position: "relative", minHeight: "100vh" }}>
        <Navbar onThemeToggle={onThemeToggle} onSearch={onSearch} />

        {/* Keep children mounted to prevent state loss and redundant API calls */}
        <div style={{ display: loading ? "none" : "block" }}>
          <main>{children}</main>
        </div>

        {loading && (
          <div
            style={{
              position: "absolute",
              top: "64px", // Adjust based on Navbar height
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000,
              background: "inherit",
            }}
          >
            <Loading />
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;
