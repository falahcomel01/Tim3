import api from './api';

const transactionService = {
  /**
   * Laporan transaksi (admin).
   * params: { start_date, end_date, status, group_by }
   * GET /admin/transactions/report
   */
  async getReport(params = {}) {
    const response = await api.get('/admin/transactions/report', { params });
    return response.data;
  },
};

export default transactionService;
