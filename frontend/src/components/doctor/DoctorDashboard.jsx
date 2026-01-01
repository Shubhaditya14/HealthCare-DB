import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doctorAPI, appointmentAPI } from '../../utils/api';
import '../../styles/dashboard.css';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [appointmentsRes, profileRes] = await Promise.all([
        doctorAPI.getAppointments(),
        doctorAPI.getProfile(),
      ]);
      setAppointments(appointmentsRes.data.appointments);
      setDoctorInfo(profileRes.data.doctor);
      setError('');
    } catch (err) {
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    const confirmMessage = newStatus === 'completed'
      ? 'Mark this appointment as completed?'
      : 'Cancel this appointment?';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await appointmentAPI.update(appointmentId, { status: newStatus });
      setSuccessMessage(`Appointment ${newStatus} successfully`);
      setError('');
      fetchData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update appointment. Please try again.';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    }
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

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  const todayAppointments = appointments.filter((apt) => {
    const today = new Date().toISOString().split('T')[0];
    return apt.appointment_date === today && apt.status === 'scheduled';
  });

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome, Dr. {user?.first_name}!</h1>
          <p>Manage your appointments and patient care</p>
        </div>
      </div>

      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Appointments</div>
        </div>
        <div className="stat-card stat-scheduled">
          <div className="stat-value">{stats.scheduled}</div>
          <div className="stat-label">Scheduled</div>
        </div>
        <div className="stat-card stat-completed">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card stat-cancelled">
          <div className="stat-value">{stats.cancelled}</div>
          <div className="stat-label">Cancelled</div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-main">
          {/* Today's Appointments */}
          {todayAppointments.length > 0 && (
            <section className="appointments-section highlight-section">
              <h2>Today's Appointments</h2>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Time</th>
                      <th>Reason</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayAppointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td>{appointment.patient_name}</td>
                        <td>{appointment.appointment_time}</td>
                        <td className="reason-cell">{appointment.reason}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                            >
                              Complete
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* All Appointments */}
          <section className="appointments-section">
            <div className="section-header">
              <h2>All Appointments</h2>
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button
                  className={`filter-btn ${filter === 'scheduled' ? 'active' : ''}`}
                  onClick={() => setFilter('scheduled')}
                >
                  Scheduled
                </button>
                <button
                  className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                  onClick={() => setFilter('completed')}
                >
                  Completed
                </button>
                <button
                  className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
                  onClick={() => setFilter('cancelled')}
                >
                  Cancelled
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="loading">Loading appointments...</div>
            ) : filteredAppointments.length === 0 ? (
              <div className="empty-state">
                <p>No appointments found</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td>{appointment.patient_name}</td>
                        <td>{new Date(appointment.appointment_date).toLocaleDateString()}</td>
                        <td>{appointment.appointment_time}</td>
                        <td className="reason-cell">{appointment.reason}</td>
                        <td>
                          <span className={`status-badge ${getStatusClass(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td>
                          {appointment.status === 'scheduled' && (
                            <div className="action-buttons">
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                              >
                                Complete
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
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
              <span className="info-value">{doctorInfo?.full_name || user?.full_name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{doctorInfo?.email || user?.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Specialization:</span>
              <span className="info-value">{doctorInfo?.specialization}</span>
            </div>
            <div className="info-item">
              <span className="info-label">License:</span>
              <span className="info-value">{doctorInfo?.license_number}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Experience:</span>
              <span className="info-value">{doctorInfo?.years_experience} years</span>
            </div>
          </div>

          <div className="info-card" style={{ marginTop: '1.5rem', backgroundColor: '#fef3c7', border: '1px solid #f59e0b' }}>
            <h3 style={{ color: '#92400e' }}>Policy Notice</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#333' }}>
              Patients can cancel appointments at least <strong>2 days in advance</strong>.
            </p>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.5', color: '#666', marginTop: '0.5rem' }}>
              Doctors can cancel or complete appointments at any time.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DoctorDashboard;
