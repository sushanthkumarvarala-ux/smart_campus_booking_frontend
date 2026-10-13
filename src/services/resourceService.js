import axiosClient from '../api/axiosClient';

export const resourceService = {
  getResources: async (params = {}) => {
    return await axiosClient.get('/resources', { params });
  },

  getResourceById: async (id) => {
    return await axiosClient.get(`/resources/${id}`);
  },

  getResourceAvailability: async (id, date) => {
    return await axiosClient.get(`/resources/${id}/availability`, {
      params: date ? { date } : {},
    });
  },

  createResource: async (data) => {
    return await axiosClient.post('/admin/resources', data);
  },

  updateResource: async (id, data) => {
    return await axiosClient.put(`/admin/resources/${id}`, data);
  },

  deleteResource: async (id) => {
    return await axiosClient.delete(`/admin/resources/${id}`);
  },

  getAdminResources: async (params = {}) => {
    return await axiosClient.get('/admin/resources', { params });
  },
};
