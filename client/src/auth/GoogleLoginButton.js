// src/components/GoogleLoginButton.jsx
import React from "react";

const GoogleLoginButton = () => {
  // Directs to your backend's Google auth endpoint
  const handleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google"; // Make sure this matches your backend URL
  };

  return <button onClick={handleLogin}>Login with Google</button>;
};

export default GoogleLoginButton;
