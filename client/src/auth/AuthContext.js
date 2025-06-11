import React, { createContext, useContext, useState, useEffect } from "react";
import { UNSAFE_shouldHydrateRouteLoader } from "react-router-dom";

const AuthContext = createContext();
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);
  const API_BASE = "http://localhost:5000/api";

  const getUserIdFromToken = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.user.id;
    } catch {
      return null;
    }
  };

  const fetchUserProfile = async () => {
    if (!token) return;
    try {
      const response = await fetch(
        `${API_BASE}/users/me?userId=${getUserIdFromToken()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) setUser(await response.json());
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
        await fetchUserProfile();

        return { success: true };
      }
      return { success: false, message: data.message };
    } catch {
      return { success: false, message: "Network error" };
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
        return { success: true };
      }
      return { success: false, message: data.message }; // ✅ correct
    } catch {
      return { success: false, message: "Network error" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  const addToFavorites = async (providerId) => {
    if (!user) return { success: false, message: "Not authenticated" };
    try {
      const res = await fetch(`${API_BASE}/users/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user._id, providerId }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser((prev) => ({ ...prev, favorites: data }));
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch {
      return { success: false, message: "Network error" };
    }
  };

  const removeFromFavorites = async (providerId) => {
    if (!user) return { success: false, message: "Not authenticated" };
    try {
      const res = await fetch(
        `${API_BASE}/users/favorites/${user._id}/${providerId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setUser((prev) => ({ ...prev, favorites: data }));
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch {
      return { success: false, message: "Network error" };
    }
  };

  const hasPermission = (requiredRole) => {
    if (!user) return false;
    const roles = { user: 1, provider: 2, admin: 3 };
    return roles[user.role] >= roles[requiredRole];
  };

  useEffect(() => {
    if (token) fetchUserProfile();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        login,
        logout,
        addToFavorites,
        removeFromFavorites,
        hasPermission,
        isLogin: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
