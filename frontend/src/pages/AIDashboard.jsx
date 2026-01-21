import React, { useState, useEffect } from 'react';
import { aiAPI } from '../utils/api';
import DrugInteractionChecker from '../components/doctor/DrugInteractionChecker';
import PrescriptionAssistant from '../components/doctor/PrescriptionAssistant';
import PatientHistorySearch from '../components/doctor/PatientHistorySearch';
import DiabetesPredictor from '../components/doctor/DiabetesPredictor';
import RetinopathyDetector from '../components/doctor/RetinopathyDetector';
import '../styles/ai.css';

const AIDashboard = () => {
  const [activeTab, setActiveTab] = useState('interactions');
  const [aiStatus, setAiStatus] = useState(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  useEffect(() => {
    checkAiStatus();
  }, []);

  const checkAiStatus = async () => {
    try {
      const response = await aiAPI.status();
      setAiStatus(response.data);
    } catch (err) {
      setAiStatus({ ai_available: false, error: err.message });
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const tabs = [
    { id: 'interactions', label: 'Drug Interactions', icon: '💊' },
    { id: 'prescription', label: 'Prescription Assistant', icon: '📝' },
    { id: 'history', label: 'Patient History', icon: '🔍' },
    { id: 'diabetes', label: 'Diabetes Predictor', icon: '🩺' },
    { id: 'retinopathy', label: 'Retinopathy Screen', icon: '👁️' },
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'interactions':
        return <DrugInteractionChecker />;
      case 'prescription':
        return <PrescriptionAssistant />;
      case 'history':
        return <PatientHistorySearch />;
      case 'diabetes':
        return <DiabetesPredictor />;
      case 'retinopathy':
        return <RetinopathyDetector />;
      default:
        return <DrugInteractionChecker />;
    }
  };

  return (
    <div className="ai-dashboard">
      <div className="ai-dashboard-header">
        <h1>AI Clinical Assistant</h1>
        <p>Powered by Ollama - Local AI for healthcare</p>

        {!isLoadingStatus && (
          <div className="ai-status-bar">
            <span className={`status-indicator ${aiStatus?.ai_available ? 'online' : 'offline'}`}>
              {aiStatus?.ai_available ? '● AI Online' : '○ AI Offline'}
            </span>
            {aiStatus?.ai_available && aiStatus?.models_loaded?.length > 0 && (
              <span className="models-info">
                Models: {aiStatus.models_loaded.slice(0, 3).join(', ')}
                {aiStatus.models_loaded.length > 3 && ` +${aiStatus.models_loaded.length - 3} more`}
              </span>
            )}
          </div>
        )}
      </div>

      <nav className="ai-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`ai-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="ai-content">
        {renderActiveComponent()}
      </div>

      {!aiStatus?.ai_available && !isLoadingStatus && (
        <div className="ai-setup-guide">
          <h3>Setup Ollama for AI Features</h3>
          <p>To enable AI-powered features, you need to have Ollama running locally.</p>
          <div className="setup-steps">
            <div className="step">
              <span className="step-number">1</span>
              <div className="step-content">
                <strong>Install Ollama</strong>
                <code>curl -fsSL https://ollama.com/install.sh | sh</code>
              </div>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <div className="step-content">
                <strong>Pull Required Models</strong>
                <code>ollama pull mistral:7b</code>
                <code>ollama pull nomic-embed-text</code>
              </div>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <div className="step-content">
                <strong>Start Ollama Server</strong>
                <code>ollama serve</code>
              </div>
            </div>
            <div className="step">
              <span className="step-number">4</span>
              <div className="step-content">
                <strong>Refresh This Page</strong>
                <button onClick={checkAiStatus} className="btn btn-secondary">
                  Check AI Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIDashboard;
