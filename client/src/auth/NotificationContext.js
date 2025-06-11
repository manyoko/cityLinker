// NotificationContext.js
import { createContext, useState } from "react";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  return (
    <NotificationContext.Provider value={{ notification, setNotification }}>
      {children}
      {notification && (
        <div className={`notification ${notification.severity}`}>
          {/* Notification header */}
          <div className="notification-header">
            {notification.icon && (
              <span className="notification-icon">{notification.icon}</span>
            )}
            <h4 className="notification-title">{notification.title}</h4>
            <button
              className="notification-close"
              onClick={() => setNotification(null)}
            >
              &times;
            </button>
          </div>

          {/* Notification body */}
          <div className="notification-body">
            <p>{notification.message}</p>
          </div>

          {/* Optional action button */}
          {notification.action && (
            <div className="notification-actions">
              <button
                className="notification-button"
                onClick={() => {
                  setNotification(null);
                  notification.action.handler();
                }}
              >
                {notification.action.label}
              </button>
            </div>
          )}
        </div>
      )}
    </NotificationContext.Provider>
  );
};
