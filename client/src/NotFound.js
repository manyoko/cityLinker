// src/pages/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';
import './notFound.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-icon">
          <FaExclamationTriangle />
        </div>
        <h1>404 - Page Not Found</h1>
        <p className="not-found-text">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <p className="not-found-subtext">
          You might have mistyped the address or the page may have moved.
        </p>
        <Link to="/" className="not-found-button">
          <FaHome className="button-icon" />
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;