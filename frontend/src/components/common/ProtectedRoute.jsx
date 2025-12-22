import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedUserTypes = [] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Determine which login page to redirect to based on the route
    const isDoctor = location.pathname.startsWith('/doctor');
    const loginPath = isDoctor ? '/doctor/login' : '/patient/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Check if user type is allowed
  if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(user?.user_type)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
