import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">Smart Healthcare</h3>
            <p className="footer-description">
              Modern healthcare management system for patients and doctors.
              Secure, efficient, and user-friendly.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/patient/login">Patient Portal</Link></li>
              <li><Link to="/doctor/login">Doctor Portal</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Features</h4>
            <ul className="footer-links">
              <li>Appointment Booking</li>
              <li>Secure Authentication</li>
              <li>Doctor Management</li>
              <li>Patient Records</li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Technology</h4>
            <ul className="footer-links">
              <li>React + Flask</li>
              <li>MySQL Database</li>
              <li>JWT Authentication</li>
              <li>RESTful API</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Smart Healthcare System. All rights reserved.</p>
          <p className="footer-credit">
            Built by Shubhaditya | Portfolio Project
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
