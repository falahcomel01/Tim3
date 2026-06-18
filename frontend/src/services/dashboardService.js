import api from './api';

const dashboardService = {
  
  async getSummary(params = {}) {
    const response = await api.get('/dev/dashboard/summary', { params });
    return response.data;
  },

  async getRevenue(params = {}) {
    const response = await api.get('/dev/dashboard/revenue', { params });
    return response.data;
  },

  async getOrderStatus(params = {}) {
    const response = await api.get('/dev/dashboard/order-status', { params });
    return response.data;
  },

  async getTopProducts(params = {}) {
    const response = await api.get('/dev/dashboard/top-products', { params });
    return response.data;
  },

  async getLowStock(params = {}) {
    const response = await api.get('/dev/dashboard/low-stock', { params });
    return response.data;
  },

  async getRecentOrders(params = {}) {
    const response = await api.get('/dev/dashboard/recent-orders', { params });
    return response.data;
  },
};

export default dashboardService;
