import api from './api';

const customerService = {
  async getConversations() {
    const response = await api.get('/customer-service/conversations');
    return response.data;
  },

  async createConversation(data) {
    const response = await api.post('/customer-service/conversations', data);
    return response.data;
  },

  async getConversation(id) {
    const response = await api.get(`/customer-service/conversations/${id}`);
    return response.data;
  },

  async sendMessage(id, message) {
    const response = await api.post(`/customer-service/conversations/${id}/messages`, { message });
    return response.data;
  },
};

export default customerService;