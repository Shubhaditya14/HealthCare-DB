import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
          <span className="navbar-brand-icon">+</span>
          Smart Healthcare
        </Link>

        <button
          className={`navbar-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/" className="nav-link" onClick={closeMobileMenu}>Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/about" className="nav-link" onClick={closeMobileMenu}>About</Link>
            </li>
            {!isAuthenticated ? (
              <>
                <li className="nav-item dropdown">
                  <span className="nav-link dropdown-toggle">Patient Portal</span>
                  <ul className="dropdown-menu">
                    <li>
                      <Link to="/patient/login" className="dropdown-item" onClick={closeMobileMenu}>
                        Login
                      </Link>
                    </li>
                    <li>
                      <Link to="/patient/register" className="dropdown-item" onClick={closeMobileMenu}>
                        Register
                      </Link>
                    </li>
                  </ul>
                </li>
                <li className="nav-item dropdown">
                  <span className="nav-link dropdown-toggle">Doctor Portal</span>
                  <ul className="dropdown-menu">
                    <li>
                      <Link to="/doctor/login" className="dropdown-item" onClick={closeMobileMenu}>
                        Login
                      </Link>
                    </li>
                    <li>
                      <Link to="/doctor/register" className="dropdown-item" onClick={closeMobileMenu}>
                        Register
                      </Link>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link
                    to={user?.user_type === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'}
                    className="nav-link"
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item user-info">
                  <span className="user-welcome">Welcome, {user?.first_name}</span>
                </li>
                <li className="nav-item">
                  <button className="btn-logout" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>

        <img
          src="/Logo-2.png"
          alt="Company Logo"
          className="navbar-logo"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>
    </nav>
  );
};

export default Navbar;
