import React from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "./AuthContext";
import "./Logout.css";

const Logout = () => {
  const { logout } = useAuth();

  return (
    <button onClick={logout} className="logout-button">
      <LogOut className="logout-icon" /> Logout
    </button>
  );
};

export default Logout;
