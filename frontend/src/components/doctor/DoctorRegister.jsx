import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { doctorRegistrationSchema } from '../../utils/validation';
import FormInput from '../common/FormInput';
import '../../styles/forms.css';

const DoctorRegister = () => {
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(doctorRegistrationSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      specialization: '',
      license_number: '',
      years_experience: 0,
      password: '',
      confirm_password: '',
      agree_to_terms: false,
    },
  });

  const onSubmit = async (data) => {
    setServerError('');

    const result = await registerUser(data, 'doctor');

    if (result.success) {
      navigate('/doctor/dashboard');
    } else {
      setServerError(result.error);
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, messages]) => {
          setError(field, { type: 'server', message: messages[0] });
        });
      }
    }
  };

  const specializations = [
    'General Practice',
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'Neurology',
    'Oncology',
    'Ophthalmology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Radiology',
    'Surgery',
    'Urology',
    'Other',
  ];

  return (
    <div className="form-page">
      <div className="form-container form-container-wide">
        <div className="form-header">
          <h1>Doctor Registration</h1>
          <p>Create your doctor account to manage appointments</p>
        </div>

        {serverError && (
          <div className="alert alert-error">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <div className="form-row">
            <FormInput
              label="First Name"
              name="first_name"
              register={register}
              error={errors.first_name}
              placeholder="Enter your first name"
              required
            />
            <FormInput
              label="Last Name"
              name="last_name"
              register={register}
              error={errors.last_name}
              placeholder="Enter your last name"
              required
            />
          </div>

          <div className="form-row">
            <FormInput
              label="Email"
              name="email"
              type="email"
              register={register}
              error={errors.email}
              placeholder="Enter your email"
              required
            />
            <FormInput
              label="Phone Number"
              name="phone"
              type="tel"
              register={register}
              error={errors.phone}
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div className="form-row">
            <FormInput
              label="Specialization"
              name="specialization"
              type="select"
              register={register}
              error={errors.specialization}
              options={specializations.map(s => ({ value: s, label: s }))}
              placeholder="Select specialization"
              required
            />
            <FormInput
              label="License Number"
              name="license_number"
              register={register}
              error={errors.license_number}
              placeholder="Enter your medical license number"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Years of Experience<span className="required-mark">*</span>
            </label>
            <input
              type="number"
              className={`form-input ${errors.years_experience ? 'input-error' : ''}`}
              placeholder="Enter years of experience"
              min="0"
              max="70"
              {...register('years_experience', { valueAsNumber: true })}
            />
            {errors.years_experience && (
              <span className="error-message">{errors.years_experience.message}</span>
            )}
          </div>

          <div className="form-row">
            <FormInput
              label="Password"
              name="password"
              type="password"
              register={register}
              error={errors.password}
              placeholder="Create a strong password"
              required
            />
            <FormInput
              label="Confirm Password"
              name="confirm_password"
              type="password"
              register={register}
              error={errors.confirm_password}
              placeholder="Confirm your password"
              required
            />
          </div>

          <FormInput
            label="I agree to the Terms and Conditions"
            name="agree_to_terms"
            type="checkbox"
            register={register}
            error={errors.agree_to_terms}
            required
          />

          <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="form-footer">
          <p>
            Already have an account?{' '}
            <Link to="/doctor/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorRegister;
