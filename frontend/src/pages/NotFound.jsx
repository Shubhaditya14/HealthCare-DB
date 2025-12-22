import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="error-page">
      <div className="error-container">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Page Not Found</h2>
        <p className="error-message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="error-actions">
          <Link to="/" className="btn btn-primary">
            Go to Home
          </Link>
          <Link to="/about" className="btn btn-secondary">
            About Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
