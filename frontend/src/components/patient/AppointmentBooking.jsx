import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { appointmentSchema } from '../../utils/validation';
import { doctorAPI, appointmentAPI } from '../../utils/api';
import FormInput from '../common/FormInput';
import '../../styles/forms.css';

const AppointmentBooking = ({ onSuccess, onCancel }) => {
  const [doctors, setDoctors] = useState([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      doctor_id: '',
      appointment_date: '',
      appointment_time: '',
      reason: '',
    },
  });

  // Time slots for appointments (8 AM to 6 PM, 30-minute intervals)
  const timeSlots = [];
  for (let hour = 8; hour < 18; hour++) {
    const hourStr = hour.toString().padStart(2, '0');
    timeSlots.push({ value: `${hourStr}:00`, label: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}` });
    timeSlots.push({ value: `${hourStr}:30`, label: `${hour > 12 ? hour - 12 : hour}:30 ${hour >= 12 ? 'PM' : 'AM'}` });
  }

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await doctorAPI.list();
        setDoctors(response.data.doctors);
      } catch (err) {
        setServerError('Failed to load doctors. Please try again.');
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  const onSubmit = async (data) => {
    setServerError('');
    setIsSubmitting(true);

    try {
      await appointmentAPI.create({
        ...data,
        doctor_id: parseInt(data.doctor_id, 10),
      });
      onSuccess();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to book appointment. Please try again.';
      setServerError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get today's date for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="booking-form-container">
      <div className="form-header">
        <h2>Book an Appointment</h2>
        <p>Fill in the details below to schedule your appointment</p>
      </div>

      {serverError && (
        <div className="alert alert-error">{serverError}</div>
      )}

      {isLoadingDoctors ? (
        <div className="loading">Loading doctors...</div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <FormInput
            label="Select Doctor"
            name="doctor_id"
            type="select"
            register={register}
            error={errors.doctor_id}
            options={doctors.map(doctor => ({
              value: doctor.id,
              label: `${doctor.full_name} - ${doctor.specialization} (${doctor.years_experience} years exp.)`
            }))}
            placeholder="Choose a doctor"
            required
          />

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Appointment Date<span className="required-mark">*</span>
              </label>
              <input
                type="date"
                className={`form-input ${errors.appointment_date ? 'input-error' : ''}`}
                min={today}
                {...register('appointment_date')}
              />
              {errors.appointment_date && (
                <span className="error-message">{errors.appointment_date.message}</span>
              )}
            </div>

            <FormInput
              label="Appointment Time"
              name="appointment_time"
              type="select"
              register={register}
              error={errors.appointment_time}
              options={timeSlots}
              placeholder="Select time"
              required
            />
          </div>

          <FormInput
            label="Reason for Visit"
            name="reason"
            type="textarea"
            register={register}
            error={errors.reason}
            placeholder="Please describe your symptoms or reason for the appointment (min 10 characters)"
            required
            rows={4}
          />

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AppointmentBooking;
