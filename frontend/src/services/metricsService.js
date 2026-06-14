import api from './api';

export const metricsService = {
  getAll: async (params = {}) => {
    const response = await api.get('/metrics', { params });
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/metrics', data);
    return response.data;
  }
};
