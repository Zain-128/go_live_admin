import api from './api';

export const payoutService = {
  // Get payout statistics
  async getStats() {
    const response = await api.get('/marketplace/admin/payouts/stats');
    return response.data.data || response.data;
  },

  // Get all payouts with pagination and filters
  async getPayouts(params = {}) {
    const response = await api.get('/marketplace/admin/payouts', { params });
    return response.data.data || response.data;
  },

  // Get payout by ID
  async getPayoutById(id) {
    const response = await api.get(`/marketplace/admin/payouts/${id}`);
    return response.data.data || response.data;
  },

  // Create a new payout
  async createPayout(data) {
    const response = await api.post('/marketplace/admin/payouts', data);
    return response.data.data || response.data;
  },

  // Update payout status
  async updateStatus(id, data) {
    const response = await api.patch(`/marketplace/admin/payouts/${id}/status`, data);
    return response.data.data || response.data;
  },

  // Process payout
  async processPayout(id) {
    const response = await api.post(`/marketplace/admin/payouts/${id}/process`);
    return response.data.data || response.data;
  },

  // Cancel payout
  async cancelPayout(id, data) {
    const response = await api.post(`/marketplace/admin/payouts/${id}/cancel`, data);
    return response.data.data || response.data;
  },

  // Retry failed payout
  async retryPayout(id) {
    const response = await api.post(`/marketplace/admin/payouts/${id}/retry`);
    return response.data.data || response.data;
  },

  // Get vendor payout summary
  async getVendorSummary(vendorId) {
    const response = await api.get(`/marketplace/admin/payouts/vendor/${vendorId}/summary`);
    return response.data.data || response.data;
  },

  // Get vendors for filter dropdown
  async getVendors() {
    const response = await api.get('/marketplace/admin/vendors', {
      params: { limit: 100 },
    });
    return response.data.data || response.data;
  },
};

export default payoutService;
