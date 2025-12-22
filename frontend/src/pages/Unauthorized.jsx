import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Unauthorized = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="error-page">
      <div className="error-container">
        <h1 className="error-code">403</h1>
        <h2 className="error-title">Access Denied</h2>
        <p className="error-message">
          You don't have permission to access this page.
          {user && (
            <span>
              {' '}You are logged in as a <strong>{user.user_type}</strong>.
            </span>
          )}
        </p>
        <div className="error-actions">
          {user?.user_type === 'patient' ? (
            <Link to="/patient/dashboard" className="btn btn-primary">
              Go to Patient Dashboard
            </Link>
          ) : user?.user_type === 'doctor' ? (
            <Link to="/doctor/dashboard" className="btn btn-primary">
              Go to Doctor Dashboard
            </Link>
          ) : (
            <Link to="/" className="btn btn-primary">
              Go to Home
            </Link>
          )}
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout & Switch Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
