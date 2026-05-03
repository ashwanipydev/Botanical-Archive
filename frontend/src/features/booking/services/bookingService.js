import api from '../../../core/services/api';

const bookingService = {
  initiateBooking: async (bookingData) => {
    const response = await api.post('/bookings/initiate', bookingData);
    return response.data;
  },

  confirmBooking: async (bookingId, paymentId) => {
    const response = await api.post(`/bookings/confirm/${bookingId}?paymentId=${paymentId}`);
    return response.data;
  },

  getMyBookings: async () => {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },

  calculatePrice: async (slotId, adultCount, childCount, addOnIds) => {
    const params = new URLSearchParams({
      slotId,
      adultCount,
      childCount,
      ...(addOnIds?.length && { addOnIds: addOnIds.join(',') }),
    });
    const response = await api.get(`/bookings/calculate-price?${params}`);
    return response.data;
  },
};

export default bookingService;
