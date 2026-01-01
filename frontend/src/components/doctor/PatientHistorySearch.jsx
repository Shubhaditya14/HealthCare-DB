import React, { useState, useEffect } from 'react';
import { aiAPI, patientAPI } from '../../utils/api';
import '../../styles/ai.css';

const PatientHistorySearch = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [questionResult, setQuestionResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState('');
  const [aiStatus, setAiStatus] = useState(null);

  useEffect(() => {
    loadPatients();
    checkAiStatus();
  }, []);

  const loadPatients = async () => {
    try {
      // For demo, we'll load synthetic data if no patients exist
      const response = await aiAPI.loadSyntheticData(false);
      if (response.data.loaded || response.data.patients_created > 0) {
        console.log('Synthetic data loaded');
      }
    } catch (err) {
      console.error('Could not load synthetic data:', err);
    }
  };

  const checkAiStatus = async () => {
    try {
      const response = await aiAPI.status();
      setAiStatus(response.data);
    } catch (err) {
      setAiStatus({ ai_available: false });
    }
  };

  const handleSearch = async () => {
    if (!selectedPatient) {
      setError('Please select a patient');
      return;
    }
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setError('');
    setSearchResult(null);
    setQuestionResult(null);

    try {
      const response = await aiAPI.searchHistory(parseInt(selectedPatient), query);
      setSearchResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search patient history');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!selectedPatient) {
      setError('Please select a patient');
      return;
    }
    if (!query.trim()) {
      setError('Please enter a question');
      return;
    }

    setIsAsking(true);
    setError('');
    setQuestionResult(null);
    setSearchResult(null);

    try {
      const response = await aiAPI.askAboutPatient(parseInt(selectedPatient), query);
      setQuestionResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get answer');
    } finally {
      setIsAsking(false);
    }
  };

  const getRecordTypeIcon = (type) => {
    switch (type) {
      case 'diagnosis': return '🏥';
      case 'lab_result': return '🔬';
      case 'procedure': return '⚕️';
      case 'allergy': return '⚠️';
      case 'note': return '📝';
      default: return '📋';
    }
  };

  const predefinedQueries = [
    'cardiac history',
    'diabetes management',
    'allergies and reactions',
    'recent lab results',
    'surgical history',
    'current medications',
  ];

  return (
    <div className="ai-tool-container">
      <div className="ai-tool-header">
        <h2>Patient History Search (RAG)</h2>
        <p>Search and query patient medical records using AI</p>
        {aiStatus && (
          <div className={`ai-status ${aiStatus.ai_available ? 'status-online' : 'status-offline'}`}>
            AI: {aiStatus.ai_available ? 'Online' : 'Offline'}
          </div>
        )}
      </div>

      <div className="ai-tool-content">
        <div className="search-section">
          <div className="form-group">
            <label htmlFor="patient">Select Patient</label>
            <select
              id="patient"
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="ai-select"
            >
              <option value="">-- Select a patient --</option>
              {/* Demo patients - in production, this would come from an API */}
              {[...Array(20)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Patient {i + 1}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="query">Search Query / Question</label>
            <input
              type="text"
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., 'cardiac history' or 'When was the last checkup?'"
              className="ai-input"
            />
          </div>

          <div className="quick-queries">
            <span className="quick-label">Quick searches:</span>
            {predefinedQueries.map((q, index) => (
              <button
                key={index}
                onClick={() => setQuery(q)}
                className="quick-query-btn"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="button-group">
            <button
              onClick={handleSearch}
              disabled={isSearching || !aiStatus?.ai_available}
              className="btn btn-primary"
            >
              {isSearching ? 'Searching...' : 'Search Records'}
            </button>
            <button
              onClick={handleAskQuestion}
              disabled={isAsking || !aiStatus?.ai_available}
              className="btn btn-secondary"
            >
              {isAsking ? 'Asking...' : 'Ask Question'}
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Search Results */}
        {searchResult && (
          <div className="results-section">
            <div className="results-header">
              <h3>Search Results</h3>
              <span className="results-count">
                {searchResult.records_found} record(s) found
              </span>
            </div>

            {searchResult.summary && (
              <div className="summary-card">
                <h4>AI Summary</h4>
                <p>{searchResult.summary}</p>
              </div>
            )}

            {searchResult.records && searchResult.records.length > 0 && (
              <div className="records-list">
                <h4>Relevant Records</h4>
                {searchResult.records.map((record, index) => (
                  <div key={index} className="record-card">
                    <div className="record-header">
                      <span className="record-icon">{getRecordTypeIcon(record.record_type)}</span>
                      <span className="record-title">{record.title}</span>
                      <span className="record-type">{record.record_type}</span>
                    </div>
                    <p className="record-content">{record.content}</p>
                    <div className="record-footer">
                      <span className="record-date">{record.record_date}</span>
                      {record.similarity && (
                        <span className="relevance-score">
                          Relevance: {(record.similarity * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Question Answer Results */}
        {questionResult && (
          <div className="results-section">
            <div className="results-header">
              <h3>Answer</h3>
              <span className={`confidence-badge confidence-${questionResult.confidence}`}>
                Confidence: {questionResult.confidence}
              </span>
            </div>

            <div className="answer-card">
              <p className="answer-text">{questionResult.answer}</p>
            </div>

            {questionResult.supporting_records && questionResult.supporting_records.length > 0 && (
              <div className="supporting-records">
                <h4>Supporting Records</h4>
                {questionResult.supporting_records.map((record, index) => (
                  <div key={index} className="record-card record-small">
                    <div className="record-header">
                      <span className="record-icon">{getRecordTypeIcon(record.record_type)}</span>
                      <span className="record-title">{record.title}</span>
                    </div>
                    <span className="record-date">{record.record_date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!aiStatus?.ai_available && (
          <div className="ai-offline-notice">
            <h4>AI Service Offline</h4>
            <p>
              The Ollama AI service is not running. To enable AI features:
            </p>
            <ol>
              <li>Start Ollama: <code>ollama serve</code></li>
              <li>Pull required models: <code>ollama pull mistral:7b</code></li>
              <li>Refresh this page</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientHistorySearch;
