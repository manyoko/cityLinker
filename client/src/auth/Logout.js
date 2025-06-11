import React from "react";
import { HomeIcon, LogOut } from "lucide-react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import "./Logout.css";

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="logout-container">
      <div className="logout-form">
        <button onClick={logout} className="logout-button">
          <LogOut className="logout-icon" /> Logout
        </button>
        <button onClick={handleLogout} className="logout-button">
          <HomeIcon className="logout-icon" /> Back to home page
        </button>
      </div>
    </div>
  );
};

export default Logout;
