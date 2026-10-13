import axiosClient from '../api/axiosClient';

export const authService = {
  login: async (email, password) => {
    return await axiosClient.post('/auth/login', { email, password });
  },

  register: async (userData) => {
    return await axiosClient.post('/auth/register', userData);
  },

  getCurrentUser: async () => {
    return await axiosClient.get('/auth/me');
  },
};
