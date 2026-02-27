import React from "react";
import { Navigate } from "react-router-dom";

// Prevents logged-in users from accessing public-only pages like /login and /signup.
// OLD approach: no guard on public routes — logged-in users could manually visit /login
// and then freely navigate to protected routes since the token was still valid.
const PublicRoute = ({ children }) => {
  const token = sessionStorage.getItem("authToken");

  if (token) {
    // Redirect to the correct landing page based on role
    const deptAdmin = sessionStorage.getItem("deptAdmin") === "true";
    const superAdmin = sessionStorage.getItem("superAdmin") === "true";

    if (deptAdmin && !superAdmin) {
      return <Navigate to="/unit" replace />;
    }
    return <Navigate to="/angelbot" replace />;
  }

  return children;
};

export default PublicRoute;
