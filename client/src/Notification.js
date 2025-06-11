// components/Notification.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Notification = ({ notification }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (notification?.action?.autoTrigger) {
      notification.action.handler();
    }
  }, [notification]);

  return (
    <div className={`notification ${notification.severity}`}>
      <h3>{notification.userFriendlyTitle}</h3>
      <p>{notification.userFriendlyMessage}</p>
      {notification.action && !notification.action.autoTrigger && (
        <button onClick={notification.action.handler}>
          {notification.action.label}
        </button>
      )}
    </div>
  );
};
