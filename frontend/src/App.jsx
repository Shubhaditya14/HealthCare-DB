import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

// Patient Components
import PatientRegister from './components/patient/PatientRegister';
import PatientLogin from './components/patient/PatientLogin';
import PatientDashboard from './components/patient/PatientDashboard';

// Doctor Components
import DoctorRegister from './components/doctor/DoctorRegister';
import DoctorLogin from './components/doctor/DoctorLogin';
import DoctorDashboard from './components/doctor/DoctorDashboard';

// AI Components
import AIDashboard from './pages/AIDashboard';

// Auth Context
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />

          {/* Patient Routes */}
          <Route
            path="/patient/register"
            element={
              isAuthenticated && user?.user_type === 'patient' ? (
                <Navigate to="/patient/dashboard" replace />
              ) : (
                <PatientRegister />
              )
            }
          />
          <Route
            path="/patient/login"
            element={
              isAuthenticated && user?.user_type === 'patient' ? (
                <Navigate to="/patient/dashboard" replace />
              ) : (
                <PatientLogin />
              )
            }
          />
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute allowedUserTypes={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          {/* Doctor Routes */}
          <Route
            path="/doctor/register"
            element={
              isAuthenticated && user?.user_type === 'doctor' ? (
                <Navigate to="/doctor/dashboard" replace />
              ) : (
                <DoctorRegister />
              )
            }
          />
          <Route
            path="/doctor/login"
            element={
              isAuthenticated && user?.user_type === 'doctor' ? (
                <Navigate to="/doctor/dashboard" replace />
              ) : (
                <DoctorLogin />
              )
            }
          />
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute allowedUserTypes={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/ai-assistant"
            element={
              <ProtectedRoute allowedUserTypes={['doctor']}>
                <AIDashboard />
              </ProtectedRoute>
            }
          />

          {/* Error Routes */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
