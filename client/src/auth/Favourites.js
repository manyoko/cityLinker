import React from "react";
import { useAuth } from "./AuthContext";
import { Heart } from "lucide-react";
import "./Favorites.css";

const Favorites = () => {
  const { user, removeFromFavorites } = useAuth();

  if (!user?.favorites?.length) return <p>No favorites yet.</p>;

  return (
    <div className="favorites-container">
      <h2 className="favorites-title">Your Favorites</h2>
      <ul className="favorites-list">
        {user.favorites.map((provider) => (
          <li key={provider._id} className="favorite-item">
            <span>{provider.name}</span>
            <button
              onClick={() => removeFromFavorites(provider._id)}
              className="remove-btn"
            >
              Remove <Heart className="heart-icon" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Favorites;
