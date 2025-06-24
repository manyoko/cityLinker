import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";

const PrivateRoute = ({ allowedRoles }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null: loading, true/false: result
  const [userRole, setUserRole] = useState(null); // Store the user's role
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // First, try to authenticate via JWT (if present)
        const token = localStorage.getItem("token");
        let headers = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        // Call a unified endpoint that uses the backend's `protect` middleware
        // This endpoint will either use the JWT from headers OR the session cookie
        const response = await axios.get(
          "http://localhost:5000/api/current_user", // This endpoint will be protected
          {
            headers: headers,
            withCredentials: true, // Crucial to send session cookies too
          }
        );

        if (response.data && (response.data.googleId || response.data._id)) {
          // Check for user ID from either source
          setIsAuthenticated(true);
          const role = response.data.role || "user"; // Ensure role is always set
          setUserRole(role);

          if (allowedRoles && !allowedRoles.includes(role)) {
            setIsAuthenticated(false);
            console.warn(
              "User does not have the required role to access this page."
            );
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
        // If JWT failed, remove it to prevent looping
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, [allowedRoles]);

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  if (isAuthenticated === false) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;

// import React, { useState, useEffect } from "react";
// import { Navigate, Outlet } from "react-router-dom";
// import axios from "axios";

// const PrivateRoute = ({ allowedRoles }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(null); // null means loading, true/false for result
//   const [userRole, setUserRole] = useState(null); // Store the user's role
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const verifyUser = async () => {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         setIsAuthenticated(false);
//         setLoading(false);
//         return;
//       }

//       try {
//         // Make an API call to a protected endpoint that checks user authentication and role
//         // A common practice is to have a /api/auth/me or /api/auth/status endpoint
//         // This endpoint should use your `auth` and `authorize` middleware on the backend.
//         const response = await axios.get(
//           "http://localhost:5000/api/users/profile",
//           {
//             // <-- Adjust this API endpoint
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         // Assuming your /api/auth/status returns user data including role on success
//         if (response.data && response.data.role) {
//           setUserRole(response.data.role);
//           if (allowedRoles && allowedRoles.includes(response.data.role)) {
//             setIsAuthenticated(true);
//           } else {
//             setIsAuthenticated(false); // User is logged in but not authorized for this route
//             console.warn(
//               "User does not have the required role to access this page."
//             );
//           }
//         } else {
//           setIsAuthenticated(false);
//         }
//       } catch (error) {
//         console.error("Authentication check failed:", error);
//         setIsAuthenticated(false);
//         // Optionally, you can clear the token if it's invalid/expired
//         localStorage.removeItem("token");
//       } finally {
//         setLoading(false);
//       }
//     };

//     verifyUser();
//   }, [allowedRoles]);

//   if (loading) {
//     // You can render a loading spinner here
//     return <div>Loading authentication...</div>;
//   }

//   // If not authenticated, redirect to login.
//   // You might want to pass state to the login page to show a "Please log in" message.
//   if (isAuthenticated === false) {
//     return <Navigate to="/login" replace />;
//   }

//   // If authenticated and authorized, render the child routes
//   return <Outlet />;
// };

// export default PrivateRoute;
