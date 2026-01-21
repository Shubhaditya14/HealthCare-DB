import React, { useEffect, useState } from 'react';
import { aiAPI } from '../../utils/api';

const stageNotes = {
  'No Diabetic Retinopathy': 'No visible signs of diabetic retinopathy detected.',
  'Mild Non-Proliferative DR': 'Early microaneurysms may be present; monitor and control glucose.',
  'Moderate Non-Proliferative DR': 'More lesions visible; consider referral for full ophthalmic exam.',
  'Severe Non-Proliferative DR': 'Significant ischemia risk; urgent ophthalmology referral recommended.',
  'Proliferative DR': 'Neovascularization likely; immediate specialist intervention needed.',
};

const severityTone = {
  'No Diabetic Retinopathy': 'low',
  'Mild Non-Proliferative DR': 'low',
  'Moderate Non-Proliferative DR': 'moderate',
  'Severe Non-Proliferative DR': 'high',
  'Proliferative DR': 'critical',
};

const RetinopathyDetector = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setPrediction(null);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Please upload a retinal fundus image first.');
      return;
    }

    setIsLoading(true);
    setPrediction(null);
    setError('');

    try {
      const response = await aiAPI.predictRetinopathy(selectedFile);
      setPrediction(response.data.prediction);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Unable to run retinopathy screening right now.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setPrediction(null);
    setError('');
  };

  const formattedProbabilities = [...(prediction?.probabilities || [])].sort((a, b) => b.confidence - a.confidence);

  const severity = prediction ? (severityTone[prediction.label] || 'moderate') : 'low';

  return (
    <div className="retinopathy-tool">
      <div className="retinopathy-header">
        <div>
          <h2>Diabetic Retinopathy Screening</h2>
          <p>Upload a retinal fundus image to screen for DR severity with the built-in CNN.</p>
        </div>
        <div className="retinopathy-chip">
          <span role="img" aria-label="shield">
            🛡️
          </span>{' '}
          On-device model
        </div>
      </div>

      <div className="retinopathy-body">
        <div className="upload-column">
          <form onSubmit={handleSubmit}>
            <label className="upload-area" htmlFor="retina-upload">
              {previewUrl ? (
                <img src={previewUrl} alt="Retinal preview" className="retina-preview" />
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">📷</span>
                  <p>Drop or select a retinal fundus image (PNG/JPG)</p>
                  <small>128x128+ images are accepted; they will be resized safely.</small>
                </div>
              )}
              <input
                id="retina-upload"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>

            <div className="upload-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading || !selectedFile}
              >
                {isLoading ? 'Analyzing image…' : 'Analyze for DR'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReset}
                disabled={isLoading}
              >
                Reset
              </button>
            </div>

            {error && <div className="retinopathy-error">{error}</div>}

            <div className="retinopathy-hint">
              <h4>Capture tips</h4>
              <ul>
                <li>Use centered fundus shots with clear optic disc and macula.</li>
                <li>Avoid glare/flash artifacts and ensure even illumination.</li>
                <li>This is a screening aid; always confirm with a specialist.</li>
              </ul>
            </div>
          </form>
        </div>

        <div className="results-column">
          {prediction ? (
            <div className="retinopathy-result">
              <div className={`result-stage severity-${severity}`}>
                <div>
                  <p className="stage-label">Predicted stage</p>
                  <h3>{prediction.label}</h3>
                </div>
                <div className="stage-confidence">
                  {(prediction.confidence * 100).toFixed(1)}% confidence
                </div>
              </div>

              <div className="probabilities">
                <h4>Class probabilities</h4>
                <div className="probability-list">
                  {formattedProbabilities.map((item) => (
                    <div key={item.label} className="probability-item">
                      <div className="probability-row">
                        <span>{item.label}</span>
                        <span className="probability-score">
                          {(item.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="probability-bar">
                        <div
                          className="probability-bar-fill"
                          style={{ width: `${Math.round(item.confidence * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="stage-note">
                <h4>Clinical note</h4>
                <p>{stageNotes[prediction.label] || 'Use this screening result alongside a comprehensive eye examination.'}</p>
              </div>

              <div className="retinopathy-disclaimer">
                AI is for screening support only. Confirm findings with a comprehensive eye exam.
              </div>
            </div>
          ) : (
            <div className="retinopathy-placeholder">
              <h3>No analysis yet</h3>
              <p>Upload a retinal image to receive a DR stage prediction and class probabilities.</p>
              <div className="placeholder-grid">
                <div>
                  <strong>Privacy-first</strong>
                  <p>Inference happens on your server; images are not sent to cloud LLMs.</p>
                </div>
                <div>
                  <strong>5-class output</strong>
                  <p>Maps to no DR, mild, moderate, severe, and proliferative DR stages.</p>
                </div>
                <div>
                  <strong>Actionable</strong>
                  <p>Use alongside dilated eye exams and OCT when escalation is needed.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RetinopathyDetector;
