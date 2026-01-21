import React, { useState } from 'react';
import { aiAPI } from '../../utils/api';

const DiabetesPredictor = () => {
  const [formData, setFormData] = useState({
    age: '',
    gender: '0',
    pulse_rate: '',
    systolic_bp: '',
    diastolic_bp: '',
    glucose: '',
    bmi: '',
    family_diabetes: '0',
    hypertensive: '0',
    family_hypertension: '0',
    cardiovascular_disease: '0',
    stroke: '0'
  });

  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setPrediction(null);

    try {
      // Convert all values to numbers
      const dataToSend = {};
      Object.keys(formData).forEach(key => {
        dataToSend[key] = parseFloat(formData[key]);
      });

      const response = await aiAPI.predictDiabetes(dataToSend);
      
      if (response.data.success) {
        setPrediction(response.data.prediction);
      } else {
        setError(response.data.message || 'Prediction failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get prediction. Please check your inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      age: '',
      gender: '0',
      pulse_rate: '',
      systolic_bp: '',
      diastolic_bp: '',
      glucose: '',
      bmi: '',
      family_diabetes: '0',
      hypertensive: '0',
      family_hypertension: '0',
      cardiovascular_disease: '0',
      stroke: '0'
    });
    setPrediction(null);
    setError('');
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Low': return '#28a745';
      case 'Moderate': return '#ffc107';
      case 'High': return '#fd7e14';
      case 'Very High': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div className="diabetes-predictor">
      <div className="predictor-header">
        <h2>Diabetes Risk Prediction</h2>
        <p>AI-powered diabetes risk assessment using clinical parameters</p>
      </div>

      <form onSubmit={handleSubmit} className="prediction-form">
        <div className="form-grid">
          {/* Demographics */}
          <div className="form-section">
            <h3>Demographics</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Age (years) *</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="0"
                  max="120"
                  required
                  placeholder="e.g., 52"
                />
              </div>
              <div className="form-group">
                <label>Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="0">Female</option>
                  <option value="1">Male</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vital Signs */}
          <div className="form-section">
            <h3>Vital Signs</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Pulse Rate (bpm) *</label>
                <input
                  type="number"
                  name="pulse_rate"
                  value={formData.pulse_rate}
                  onChange={handleChange}
                  min="40"
                  max="200"
                  required
                  placeholder="e.g., 75"
                />
              </div>
              <div className="form-group">
                <label>Systolic BP (mmHg) *</label>
                <input
                  type="number"
                  name="systolic_bp"
                  value={formData.systolic_bp}
                  onChange={handleChange}
                  min="70"
                  max="250"
                  required
                  placeholder="e.g., 140"
                />
              </div>
              <div className="form-group">
                <label>Diastolic BP (mmHg) *</label>
                <input
                  type="number"
                  name="diastolic_bp"
                  value={formData.diastolic_bp}
                  onChange={handleChange}
                  min="40"
                  max="150"
                  required
                  placeholder="e.g., 90"
                />
              </div>
            </div>
          </div>

          {/* Lab Values */}
          <div className="form-section">
            <h3>Lab Values & Measurements</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Glucose (mg/dL) *</label>
                <input
                  type="number"
                  name="glucose"
                  value={formData.glucose}
                  onChange={handleChange}
                  min="50"
                  max="500"
                  step="0.1"
                  required
                  placeholder="e.g., 126"
                />
              </div>
              <div className="form-group">
                <label>BMI *</label>
                <input
                  type="number"
                  name="bmi"
                  value={formData.bmi}
                  onChange={handleChange}
                  min="10"
                  max="70"
                  step="0.1"
                  required
                  placeholder="e.g., 28.5"
                />
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div className="form-section">
            <h3>Medical History</h3>
            <div className="form-row checkbox-group">
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="family_diabetes"
                    checked={formData.family_diabetes === '1'}
                    onChange={(e) => handleChange({
                      target: { name: 'family_diabetes', value: e.target.checked ? '1' : '0' }
                    })}
                  />
                  Family History of Diabetes
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="hypertensive"
                    checked={formData.hypertensive === '1'}
                    onChange={(e) => handleChange({
                      target: { name: 'hypertensive', value: e.target.checked ? '1' : '0' }
                    })}
                  />
                  Currently Hypertensive
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="family_hypertension"
                    checked={formData.family_hypertension === '1'}
                    onChange={(e) => handleChange({
                      target: { name: 'family_hypertension', value: e.target.checked ? '1' : '0' }
                    })}
                  />
                  Family History of Hypertension
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="cardiovascular_disease"
                    checked={formData.cardiovascular_disease === '1'}
                    onChange={(e) => handleChange({
                      target: { name: 'cardiovascular_disease', value: e.target.checked ? '1' : '0' }
                    })}
                  />
                  Cardiovascular Disease
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="stroke"
                    checked={formData.stroke === '1'}
                    onChange={(e) => handleChange({
                      target: { name: 'stroke', value: e.target.checked ? '1' : '0' }
                    })}
                  />
                  History of Stroke
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Analyzing...' : 'Predict Diabetes Risk'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleReset}>
            Reset Form
          </button>
        </div>
      </form>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {prediction && (
        <div className="prediction-result">
          <div className="result-header">
            <h3>Prediction Results</h3>
          </div>

          <div className="result-summary" style={{ borderColor: getRiskColor(prediction.risk_level) }}>
            <div className="risk-indicator" style={{ backgroundColor: getRiskColor(prediction.risk_level) }}>
              {prediction.risk_level} Risk
            </div>
            <div className="prediction-details">
              <div className="detail-item">
                <span className="label">Diabetes Prediction:</span>
                <span className={`value ${prediction.has_diabetes ? 'positive' : 'negative'}`}>
                  {prediction.has_diabetes ? 'Positive' : 'Negative'}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Probability:</span>
                <span className="value">{prediction.probability_percentage}%</span>
              </div>
            </div>
          </div>

          {prediction.recommendations && prediction.recommendations.length > 0 && (
            <div className="recommendations">
              <h4>Clinical Recommendations</h4>
              <ul>
                {prediction.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="disclaimer">
            <p>
              <strong>Disclaimer:</strong> This prediction is for screening purposes only and should not replace 
              professional medical diagnosis. Please consult with a healthcare provider for proper evaluation 
              and diagnosis.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiabetesPredictor;
