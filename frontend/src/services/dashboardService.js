import api from './api';

const dashboardService = {
  
  async getSummary(params = {}) {
    const response = await api.get('/admin/dashboard/summary', { params });
    return response.data;
  },

  async getRevenue(params = {}) {
    const response = await api.get('/admin/dashboard/revenue', { params });
    return response.data;
  },

  async getOrderStatus(params = {}) {
    const response = await api.get('/admin/dashboard/order-status', { params });
    return response.data;
  },

  async getTopProducts(params = {}) {
    const response = await api.get('/admin/dashboard/top-products', { params });
    return response.data;
  },

  async getLowStock(params = {}) {
    const response = await api.get('/admin/dashboard/low-stock', { params });
    return response.data;
  },

  async getRecentOrders(params = {}) {
    const response = await api.get('/admin/dashboard/recent-orders', { params });
    return response.data;
  },
};

export default dashboardService;
