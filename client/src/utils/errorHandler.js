// utils/errorHandler.js
export const handleAuthError = (error) => {
  if (
    error.message.includes("Token invalidated") ||
    error.message.includes("Authentication required") ||
    error.message.includes("Not authorized")
  ) {
    // Clear any stored tokens
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");

    return {
      userFriendlyTitle: "Session Expired",
      userFriendlyMessage:
        "Your session has ended. Please log in again to continue.",
      severity: "warning", // or "error"
      action: {
        label: "Log In",
        handler: () => (window.location.href = "/login"),
      },
    };
  }
};
