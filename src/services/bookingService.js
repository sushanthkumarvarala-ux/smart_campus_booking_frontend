import axiosClient from '../api/axiosClient';

export const bookingService = {
  createBooking: async (bookingData) => {
    return await axiosClient.post('/bookings', bookingData);
  },

  getMyBookings: async (status) => {
    return await axiosClient.get('/bookings/my', {
      params: status ? { status } : {},
    });
  },

  getBookingById: async (id) => {
    return await axiosClient.get(`/bookings/${id}`);
  },

  cancelBooking: async (id, remark) => {
    return await axiosClient.patch(`/bookings/${id}/cancel`, { remark });
  },

  getAdminBookings: async (status) => {
    return await axiosClient.get('/admin/bookings', {
      params: status ? { status } : {},
    });
  },

  approveBooking: async (id, remark) => {
    return await axiosClient.patch(`/admin/bookings/${id}/approve`, { remark });
  },

  rejectBooking: async (id, remark) => {
    return await axiosClient.patch(`/admin/bookings/${id}/reject`, { remark });
  },

  getDashboardStats: async () => {
    return await axiosClient.get('/admin/dashboard/stats');
  },
};
