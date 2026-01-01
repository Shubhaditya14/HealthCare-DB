import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { patientAPI, appointmentAPI } from '../../utils/api';
import AppointmentBooking from './AppointmentBooking';
import '../../styles/dashboard.css';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await patientAPI.getAppointments();
      setAppointments(response.data.appointments);
      setError('');
    } catch (err) {
      setError('Failed to load appointments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const canCancelAppointment = (appointmentDate) => {
    const today = new Date();
    const aptDate = new Date(appointmentDate);
    const daysUntilAppointment = Math.floor((aptDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilAppointment >= 2;
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await appointmentAPI.cancel(appointmentId);
      setSuccessMessage('Appointment cancelled successfully');
      setError('');
      fetchAppointments();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to cancel appointment. Please try again.';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    setSuccessMessage('Appointment booked successfully!');
    fetchAppointments();
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'scheduled':
        return 'status-scheduled';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const upcomingAppointments = appointments.filter(
    apt => apt.status === 'scheduled' && new Date(apt.appointment_date) >= new Date().setHours(0, 0, 0, 0)
  );
  const pastAppointments = appointments.filter(
    apt => apt.status !== 'scheduled' || new Date(apt.appointment_date) < new Date().setHours(0, 0, 0, 0)
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome, {user?.first_name}!</h1>
          <p>Manage your appointments and health records</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowBookingForm(!showBookingForm)}
        >
          {showBookingForm ? 'Cancel' : 'Book New Appointment'}
        </button>
      </div>

      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {showBookingForm && (
        <div className="booking-section">
          <AppointmentBooking
            onSuccess={handleBookingSuccess}
            onCancel={() => setShowBookingForm(false)}
          />
        </div>
      )}

      <div className="dashboard-content">
        <div className="dashboard-main">
          <section className="appointments-section">
            <h2>Upcoming Appointments</h2>
            {isLoading ? (
              <div className="loading">Loading appointments...</div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="empty-state">
                <p>No upcoming appointments</p>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowBookingForm(true)}
                >
                  Book an Appointment
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingAppointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td>{appointment.doctor_name}</td>
                        <td>{new Date(appointment.appointment_date).toLocaleDateString()}</td>
                        <td>{appointment.appointment_time}</td>
                        <td>
                          <span className={`status-badge ${getStatusClass(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td>
                          {canCancelAppointment(appointment.appointment_date) ? (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleCancelAppointment(appointment.id)}
                            >
                              Cancel
                            </button>
                          ) : (
                            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                              Cannot cancel
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="appointments-section">
            <h2>Past Appointments</h2>
            {pastAppointments.length === 0 ? (
              <div className="empty-state">
                <p>No past appointments</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastAppointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td>{appointment.doctor_name}</td>
                        <td>{new Date(appointment.appointment_date).toLocaleDateString()}</td>
                        <td>{appointment.appointment_time}</td>
                        <td>
                          <span className={`status-badge ${getStatusClass(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <aside className="dashboard-sidebar">
          <div className="info-card">
            <h3>Your Information</h3>
            <div className="info-item">
              <span className="info-label">Name:</span>
              <span className="info-value">{user?.full_name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{user?.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Account Type:</span>
              <span className="info-value">Patient</span>
            </div>
          </div>

          <div className="info-card" style={{ marginTop: '1.5rem', backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9' }}>
            <h3 style={{ color: '#0369a1' }}>Cancellation Policy</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#333' }}>
              Appointments can be cancelled at least <strong>2 days in advance</strong>.
            </p>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.5', color: '#666', marginTop: '0.5rem' }}>
              For cancellations within 2 days of your appointment, please contact the office directly.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PatientDashboard;
