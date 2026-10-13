import axiosClient from '../api/axiosClient';

export const notificationService = {
  getNotifications: async () => {
    return await axiosClient.get('/notifications');
  },

  markAsRead: async (id) => {
    return await axiosClient.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    return await axiosClient.patch('/notifications/read-all');
  },

  getUnreadCount: async () => {
    return await axiosClient.get('/notifications/unread-count');
  },
};
