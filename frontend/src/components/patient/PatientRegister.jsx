import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { patientRegistrationSchema, bloodGroupOptions } from '../../utils/validation';
import FormInput from '../common/FormInput';
import '../../styles/forms.css';

const PatientRegister = () => {
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(patientRegistrationSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      blood_group: '',
      password: '',
      confirm_password: '',
      agree_to_terms: false,
    },
  });

  const onSubmit = async (data) => {
    setServerError('');

    const result = await registerUser(data, 'patient');

    if (result.success) {
      navigate('/patient/dashboard');
    } else {
      setServerError(result.error);
      if (result.fieldErrors) {
        // Set field-specific errors in react-hook-form
        Object.entries(result.fieldErrors).forEach(([field, messages]) => {
          setError(field, { type: 'server', message: messages[0] });
        });
      }
    }
  };

  return (
    <div className="form-page">
      <div className="form-container">
        <div className="form-header">
          <h1>Patient Registration</h1>
          <p>Create your patient account to book appointments</p>
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

          <div className="form-row">
            <FormInput
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              register={register}
              error={errors.date_of_birth}
              required
            />
            <FormInput
              label="Blood Group"
              name="blood_group"
              type="select"
              register={register}
              error={errors.blood_group}
              options={bloodGroupOptions.map(bg => ({ value: bg, label: bg }))}
              placeholder="Select blood group (optional)"
            />
          </div>

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
            <Link to="/patient/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientRegister;
