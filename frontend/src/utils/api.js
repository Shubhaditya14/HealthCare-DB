import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Don't try to refresh token for login requests
      if (originalRequest.url.includes('/auth/login')) {
        return Promise.reject(error);
      }

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          // No refresh token, clear everything and reject
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/';
          return Promise.reject(error);
        }

        // Try to refresh the token
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear everything and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password, userType) =>
    api.post('/auth/login', { email, password, user_type: userType }),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Patient API
export const patientAPI = {
  register: (data) => api.post('/patients/register', data),
  getProfile: () => api.get('/patients/me'),
  updateProfile: (data) => api.put('/patients/me', data),
  getAppointments: () => api.get('/patients/appointments'),
};

// Doctor API
export const doctorAPI = {
  register: (data) => api.post('/doctors/register', data),
  getProfile: () => api.get('/doctors/me'),
  updateProfile: (data) => api.put('/doctors/me', data),
  getAppointments: () => api.get('/doctors/appointments'),
  list: () => api.get('/doctors'),
  getById: (id) => api.get(`/doctors/${id}`),
};

// Appointment API
export const appointmentAPI = {
  create: (data) => api.post('/appointments', data),
  getById: (id) => api.get(`/appointments/${id}`),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  cancel: (id) => api.delete(`/appointments/${id}`),
};

// AI API
export const aiAPI = {
  // Check AI service status
  status: () => api.get('/ai/status'),

  // Drug interaction checker
  checkInteractions: (medications, patientAllergies = [], useLlm = true) =>
    api.post('/ai/check-interactions', {
      medications,
      patient_allergies: patientAllergies,
      use_llm: useLlm,
    }),

  // Prescription suggestion
  suggestPrescription: (data) => api.post('/ai/suggest-prescription', data),

  // Generate patient instructions
  generateInstructions: (medication, dosage, diagnosis, patientAge = null) =>
    api.post('/ai/generate-instructions', {
      medication,
      dosage,
      diagnosis,
      patient_age: patientAge,
    }),

  // Search patient history (RAG)
  searchHistory: (patientId, query) =>
    api.post('/ai/search-history', {
      patient_id: patientId,
      query,
    }),

  // Ask question about patient
  askAboutPatient: (patientId, question) =>
    api.post('/ai/ask-about-patient', {
      patient_id: patientId,
      question,
    }),

  // Load synthetic data for demo
  loadSyntheticData: (force = false) =>
    api.post('/ai/load-synthetic-data', { force }),

  // Generate embeddings for all records
  embedAllRecords: () => api.post('/ai/embed-all-records'),
};

export default api;
