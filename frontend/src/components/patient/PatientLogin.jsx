import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { loginSchema } from '../../utils/validation';
import FormInput from '../common/FormInput';
import '../../styles/forms.css';

const PatientLogin = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');

  const from = location.state?.from?.pathname || '/patient/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError('');

    const result = await login(data.email, data.password, 'patient');

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setServerError(result.error);
    }
  };

  return (
    <div className="form-page">
      <div className="form-container">
        <div className="form-header">
          <h1>Patient Login</h1>
          <p>Welcome back! Please login to your account</p>
        </div>

        {serverError && (
          <div className="alert alert-error">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="form">
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
            label="Password"
            name="password"
            type="password"
            register={register}
            error={errors.password}
            placeholder="Enter your password"
            required
          />

          <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="form-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/patient/register">Register here</Link>
          </p>
          <p className="form-divider">or</p>
          <p>
            Are you a doctor?{' '}
            <Link to="/doctor/login">Doctor Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientLogin;
