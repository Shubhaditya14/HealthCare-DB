import React from 'react';

const FormInput = ({
  label,
  name,
  type = 'text',
  register,
  error,
  placeholder,
  required = false,
  disabled = false,
  options = [],
  className = '',
  ...props
}) => {
  const inputId = `input-${name}`;
  const hasError = !!error;

  // Render select input
  if (type === 'select') {
    return (
      <div className={`form-group ${className} ${hasError ? 'has-error' : ''}`}>
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
            {required && <span className="required-mark">*</span>}
          </label>
        )}
        <select
          id={inputId}
          className={`form-select ${hasError ? 'input-error' : ''}`}
          disabled={disabled}
          {...register(name)}
          {...props}
        >
          <option value="">{placeholder || 'Select an option'}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <span className="error-message">{error.message}</span>}
      </div>
    );
  }

  // Render textarea
  if (type === 'textarea') {
    return (
      <div className={`form-group ${className} ${hasError ? 'has-error' : ''}`}>
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
            {required && <span className="required-mark">*</span>}
          </label>
        )}
        <textarea
          id={inputId}
          className={`form-textarea ${hasError ? 'input-error' : ''}`}
          placeholder={placeholder}
          disabled={disabled}
          {...register(name)}
          {...props}
        />
        {error && <span className="error-message">{error.message}</span>}
      </div>
    );
  }

  // Render checkbox
  if (type === 'checkbox') {
    return (
      <div className={`form-group form-checkbox ${className} ${hasError ? 'has-error' : ''}`}>
        <label htmlFor={inputId} className="checkbox-label">
          <input
            id={inputId}
            type="checkbox"
            className={`form-checkbox-input ${hasError ? 'input-error' : ''}`}
            disabled={disabled}
            {...register(name)}
            {...props}
          />
          <span className="checkbox-text">
            {label}
            {required && <span className="required-mark">*</span>}
          </span>
        </label>
        {error && <span className="error-message">{error.message}</span>}
      </div>
    );
  }

  // Render standard input
  return (
    <div className={`form-group ${className} ${hasError ? 'has-error' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={`form-input ${hasError ? 'input-error' : ''}`}
        placeholder={placeholder}
        disabled={disabled}
        {...register(name)}
        {...props}
      />
      {error && <span className="error-message">{error.message}</span>}
    </div>
  );
};

export default FormInput;
