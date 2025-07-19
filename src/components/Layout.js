import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useLocation } from 'react-router-dom';
import Loading from './Loading'; // 👈 make sure this is your custom loader component

const Layout = ({ children, onThemeToggle }) => {
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

  // 🔥 Show loading spinner globally
  if (loading) {
    return <Loading />;
  }

  // 🧿 Auth Pages: Just render the page content (login/signup)
  if (isAuthPage) {
    return <main style={{ width: "100%", height: "100vh" }}>{children}</main>;
  }

  // 🎯 Default Layout: Sidebar + Navbar + Main Content
  return (
    <div>
      <Sidebar />
      <div>
        <Navbar onThemeToggle={onThemeToggle} />
        <main>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
