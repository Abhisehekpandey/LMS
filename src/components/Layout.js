import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useLocation } from "react-router-dom";
import Loading from "./Loading"; // 👈 make sure this is your custom loader component

// const Layout = ({ children, onThemeToggle }) => {
const Layout = ({ children, onThemeToggle, onSearch }) => {
  const location = useLocation();
  const path = location.pathname;

  const [loading, setLoading] = useState(true); //  control loading state

  useEffect(() => {
    setLoading(true); // Trigger loading on route change

    const timer = setTimeout(() => {
      setLoading(false); // Delay just to simulate loader effect
    }, 700); // ⏱ adjust this time as you vibe

    return () => clearTimeout(timer); // cleanup timeout
  }, [location]);

  const isAuthPage = path === "/login" || path === "/signup" || path === "/";

  //  Show loading spinner globally
  if (loading) {
    return <Loading />;
  }

  //  Auth Pages: Just render the page content (login/signup)
  if (isAuthPage) {
    return <main style={{ width: "100%", height: "100vh" }}>{children}</main>;
  }
  // example path jiske liye overflow auto chahiye
  const isScrollPath = path ===  "/user";
  const mainOverflow = isScrollPath ? "visible" : "auto";
console.log("Current Path:", path, " | isScrollPath:", isScrollPath);
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar takes fixed width */}
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Navbar onThemeToggle={onThemeToggle} onSearch={onSearch} />

        {/* content should scroll inside here, not whole page */}
        <main style={{ overflowY: mainOverflow }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
