import React, { useState } from 'react';
import { aiAPI } from '../../utils/api';
import '../../styles/ai.css';

const PrescriptionAssistant = () => {
  const [formData, setFormData] = useState({
    diagnosis: '',
    patientAge: '',
    allergies: '',
    currentMedications: '',
    conditions: '',
  });
  const [suggestion, setSuggestion] = useState(null);
  const [instructions, setInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingInstructions, setIsGeneratingInstructions] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.diagnosis.trim()) {
      setError('Please enter a diagnosis');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuggestion(null);
    setInstructions('');

    try {
      const requestData = {
        diagnosis: formData.diagnosis,
        patient_age: formData.patientAge ? parseInt(formData.patientAge) : null,
        patient_allergies: formData.allergies
          ? formData.allergies.split(',').map(a => a.trim()).filter(a => a)
          : [],
        current_medications: formData.currentMedications
          ? formData.currentMedications.split(',').map(m => m.trim()).filter(m => m)
          : [],
        patient_conditions: formData.conditions
          ? formData.conditions.split(',').map(c => c.trim()).filter(c => c)
          : [],
      };

      const response = await aiAPI.suggestPrescription(requestData);
      setSuggestion(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get prescription suggestion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInstructions = async () => {
    if (!suggestion?.suggestion) return;

    setIsGeneratingInstructions(true);

    try {
      const response = await aiAPI.generateInstructions(
        suggestion.suggestion.medication,
        suggestion.suggestion.dosage,
        formData.diagnosis,
        formData.patientAge ? parseInt(formData.patientAge) : null
      );
      setInstructions(response.data.instructions);
    } catch (err) {
      setError('Failed to generate patient instructions');
    } finally {
      setIsGeneratingInstructions(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="ai-tool-container">
      <div className="ai-tool-header">
        <h2>AI Prescription Assistant</h2>
        <p>Get AI-powered medication suggestions based on diagnosis</p>
      </div>

      <div className="ai-tool-content">
        <form onSubmit={handleSubmit} className="prescription-form">
          <div className="form-group">
            <label htmlFor="diagnosis">Diagnosis *</label>
            <input
              type="text"
              id="diagnosis"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="e.g., Type 2 Diabetes, Hypertension"
              className="ai-input"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="patientAge">Patient Age</label>
              <input
                type="number"
                id="patientAge"
                name="patientAge"
                value={formData.patientAge}
                onChange={handleChange}
                placeholder="e.g., 45"
                className="ai-input"
                min="0"
                max="150"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="allergies">Known Allergies (comma-separated)</label>
            <input
              type="text"
              id="allergies"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              placeholder="e.g., penicillin, sulfa drugs"
              className="ai-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="currentMedications">Current Medications (comma-separated)</label>
            <input
              type="text"
              id="currentMedications"
              name="currentMedications"
              value={formData.currentMedications}
              onChange={handleChange}
              placeholder="e.g., lisinopril, metformin"
              className="ai-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="conditions">Other Conditions (comma-separated)</label>
            <input
              type="text"
              id="conditions"
              name="conditions"
              value={formData.conditions}
              onChange={handleChange}
              placeholder="e.g., kidney disease, heart failure"
              className="ai-input"
            />
          </div>

          <button type="submit" disabled={isLoading} className="btn btn-primary">
            {isLoading ? 'Getting Suggestion...' : 'Get Prescription Suggestion'}
          </button>
        </form>

        {error && <div className="alert alert-error">{error}</div>}

        {suggestion?.success && suggestion.suggestion && (
          <div className="suggestion-section">
            <div className="suggestion-header">
              <h3>Suggested Prescription</h3>
              <span className={`source-badge ${suggestion.source}`}>
                {suggestion.source === 'ai' ? 'AI Generated' : 'Guidelines-Based'}
              </span>
            </div>

            <div className="suggestion-card">
              <div className="suggestion-main">
                <div className="suggestion-item">
                  <span className="item-label">Medication</span>
                  <span className="item-value medication-name">
                    {suggestion.suggestion.medication}
                  </span>
                </div>
                <div className="suggestion-item">
                  <span className="item-label">Dosage</span>
                  <span className="item-value">{suggestion.suggestion.dosage}</span>
                </div>
                {suggestion.suggestion.frequency && (
                  <div className="suggestion-item">
                    <span className="item-label">Frequency</span>
                    <span className="item-value">{suggestion.suggestion.frequency}</span>
                  </div>
                )}
                {suggestion.suggestion.duration && (
                  <div className="suggestion-item">
                    <span className="item-label">Duration</span>
                    <span className="item-value">{suggestion.suggestion.duration}</span>
                  </div>
                )}
              </div>

              {suggestion.suggestion.instructions && (
                <div className="suggestion-detail">
                  <span className="detail-label">Instructions</span>
                  <p>{suggestion.suggestion.instructions}</p>
                </div>
              )}

              {suggestion.suggestion.warnings && suggestion.suggestion.warnings.length > 0 && (
                <div className="suggestion-warnings">
                  <span className="detail-label">Warnings</span>
                  <ul>
                    {suggestion.suggestion.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {suggestion.suggestion.reasoning && (
                <div className="suggestion-reasoning">
                  <span className="detail-label">Clinical Reasoning</span>
                  <p>{suggestion.suggestion.reasoning}</p>
                </div>
              )}

              {suggestion.suggestion.alternatives && suggestion.suggestion.alternatives.length > 0 && (
                <div className="suggestion-alternatives">
                  <span className="detail-label">Alternative Medications</span>
                  <div className="alternatives-list">
                    {suggestion.suggestion.alternatives.map((alt, index) => (
                      <span key={index} className="alternative-tag">{alt}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Interaction Check Result */}
            {suggestion.interaction_check && !suggestion.interaction_check.safe && (
              <div className="interaction-alert">
                <h4>Interaction Warning</h4>
                <p>
                  Potential interactions detected with current medications.
                  Severity: <strong>{suggestion.interaction_check.severity}</strong>
                </p>
              </div>
            )}

            {/* Generate Patient Instructions Button */}
            <div className="instructions-section">
              <button
                onClick={handleGenerateInstructions}
                disabled={isGeneratingInstructions}
                className="btn btn-secondary"
              >
                {isGeneratingInstructions ? 'Generating...' : 'Generate Patient Instructions'}
              </button>

              {instructions && (
                <div className="instructions-card">
                  <div className="instructions-header">
                    <h4>Patient Instructions</h4>
                    <button
                      onClick={() => copyToClipboard(instructions)}
                      className="btn-copy"
                      title="Copy to clipboard"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="instructions-text">{instructions}</pre>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="disclaimer">
          <strong>Disclaimer:</strong> This AI-generated suggestion is for reference only.
          Always use clinical judgment and verify appropriateness for individual patients.
        </div>
      </div>
    </div>
  );
};

export default PrescriptionAssistant;
