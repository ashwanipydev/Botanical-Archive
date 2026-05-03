import api from '../../../core/services/api';

const slotService = {
  getAvailableSlots: async (date) => {
    const response = await api.get(`/slots/available?date=${date}`);
    return response.data;
  },

  createSlot: async (slotData) => {
    const response = await api.post('/slots/', slotData);
    return response.data;
  },

  updateSlot: async (id, slotData) => {
    const response = await api.put(`/slots/${id}`, slotData);
    return response.data;
  },
};

export default slotService;
