import React, { useState } from 'react';
import { aiAPI } from '../../utils/api';
import '../../styles/ai.css';

const DrugInteractionChecker = () => {
  const [medications, setMedications] = useState(['']);
  const [allergies, setAllergies] = useState(['']);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const addMedication = () => {
    setMedications([...medications, '']);
  };

  const removeMedication = (index) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  const updateMedication = (index, value) => {
    const updated = [...medications];
    updated[index] = value;
    setMedications(updated);
  };

  const addAllergy = () => {
    setAllergies([...allergies, '']);
  };

  const removeAllergy = (index) => {
    if (allergies.length > 1) {
      setAllergies(allergies.filter((_, i) => i !== index));
    }
  };

  const updateAllergy = (index, value) => {
    const updated = [...allergies];
    updated[index] = value;
    setAllergies(updated);
  };

  const handleCheck = async () => {
    const validMedications = medications.filter(m => m.trim());
    if (validMedications.length < 1) {
      setError('Please enter at least one medication');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const validAllergies = allergies.filter(a => a.trim());
      const response = await aiAPI.checkInteractions(validMedications, validAllergies);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check interactions');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'critical': return 'severity-critical';
      case 'high': return 'severity-high';
      case 'moderate': return 'severity-moderate';
      case 'low': return 'severity-low';
      default: return 'severity-none';
    }
  };

  return (
    <div className="ai-tool-container">
      <div className="ai-tool-header">
        <h2>Drug Interaction Checker</h2>
        <p>Check for potential drug-drug interactions and allergy conflicts</p>
      </div>

      <div className="ai-tool-content">
        <div className="input-section">
          <div className="input-group">
            <label>Medications</label>
            {medications.map((med, index) => (
              <div key={index} className="input-row">
                <input
                  type="text"
                  value={med}
                  onChange={(e) => updateMedication(index, e.target.value)}
                  placeholder="Enter medication name"
                  className="ai-input"
                />
                {medications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="btn-icon btn-remove"
                  >
                    -
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addMedication} className="btn-add">
              + Add Medication
            </button>
          </div>

          <div className="input-group">
            <label>Patient Allergies (Optional)</label>
            {allergies.map((allergy, index) => (
              <div key={index} className="input-row">
                <input
                  type="text"
                  value={allergy}
                  onChange={(e) => updateAllergy(index, e.target.value)}
                  placeholder="Enter known allergy"
                  className="ai-input"
                />
                {allergies.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAllergy(index)}
                    className="btn-icon btn-remove"
                  >
                    -
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addAllergy} className="btn-add">
              + Add Allergy
            </button>
          </div>

          <button
            onClick={handleCheck}
            disabled={isLoading}
            className="btn btn-primary btn-check"
          >
            {isLoading ? 'Checking...' : 'Check Interactions'}
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {result && (
          <div className="result-section">
            <div className={`result-header ${result.safe ? 'result-safe' : 'result-unsafe'}`}>
              <span className="result-icon">{result.safe ? '✓' : '⚠'}</span>
              <span className="result-status">
                {result.safe ? 'No Major Interactions Found' : 'Potential Interactions Detected'}
              </span>
              <span className={`severity-badge ${getSeverityClass(result.severity)}`}>
                {result.severity.toUpperCase()}
              </span>
            </div>

            {result.warnings && result.warnings.length > 0 && (
              <div className="warnings-list">
                <h3>Warnings</h3>
                {result.warnings.map((warning, index) => (
                  <div key={index} className={`warning-card ${getSeverityClass(warning.severity)}`}>
                    <div className="warning-header">
                      <span className="warning-drugs">
                        {warning.drugs?.join(' + ') || 'General Warning'}
                      </span>
                      <span className={`severity-tag ${getSeverityClass(warning.severity)}`}>
                        {warning.severity}
                      </span>
                    </div>
                    <p className="warning-message">{warning.warning}</p>
                    <span className="warning-source">Source: {warning.source}</span>
                  </div>
                ))}
              </div>
            )}

            {result.general_advice && (
              <div className="advice-section">
                <h3>General Advice</h3>
                <p>{result.general_advice}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DrugInteractionChecker;
