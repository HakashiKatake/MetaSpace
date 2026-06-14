import api from './api';

export const assetService = {
  getAll: async (params = {}) => {
    const response = await api.get('/assets', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/assets', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/assets/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/assets/stats');
    return response.data;
  }
};
