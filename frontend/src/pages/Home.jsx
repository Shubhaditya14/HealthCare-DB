import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Smart Healthcare System</h1>
          <p className="hero-subtitle">
            Modern healthcare management for patients and doctors.
            Book appointments, manage schedules, and streamline your healthcare experience.
          </p>
          {!isAuthenticated ? (
            <div className="hero-buttons">
              <Link to="/patient/login" className="btn btn-primary btn-lg">
                Patient Portal
              </Link>
              <Link to="/doctor/login" className="btn btn-secondary btn-lg">
                Doctor Portal
              </Link>
            </div>
          ) : (
            <Link
              to={user?.user_type === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'}
              className="btn btn-primary btn-lg"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3>Easy Appointment Booking</h3>
              <p>Book appointments with your preferred doctors in just a few clicks. View available time slots and schedule visits at your convenience.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3>Secure & Private</h3>
              <p>Your health data is protected with industry-standard encryption. JWT authentication ensures only you can access your information.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3>Doctor Network</h3>
              <p>Access our network of qualified healthcare professionals across various specializations. Find the right doctor for your needs.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3>Appointment Management</h3>
              <p>Doctors can efficiently manage their schedules, track appointments, and update patient visit statuses all in one place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Create Account</h3>
              <p>Register as a patient or doctor with your details</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Browse Doctors</h3>
              <p>View available doctors and their specializations</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Book Appointment</h3>
              <p>Select a convenient date and time slot</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Get Care</h3>
              <p>Visit the doctor at your scheduled time</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of patients and doctors using Smart Healthcare System</p>
          <div className="cta-buttons">
            <Link to="/patient/register" className="btn btn-primary btn-lg">
              Register as Patient
            </Link>
            <Link to="/doctor/register" className="btn btn-outline btn-lg">
              Register as Doctor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
