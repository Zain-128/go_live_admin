import api from './api';

export const vendorService = {
  // Get vendor statistics
  async getStats() {
    const response = await api.get('/marketplace/admin/vendors/stats');
    return response.data.data || response.data;
  },

  // Get all vendors with pagination and filters
  async getVendors(params = {}) {
    const response = await api.get('/marketplace/admin/vendors', { params });
    return response.data.data || response.data;
  },

  // Get vendor by ID
  async getVendorById(id) {
    const response = await api.get(`/marketplace/admin/vendors/${id}`);
    return response.data.data || response.data;
  },

  // Update vendor status
  async updateStatus(id, data) {
    const response = await api.patch(`/marketplace/admin/vendors/${id}/status`, data);
    return response.data.data || response.data;
  },

  // Update vendor commission
  async updateCommission(id, commissionRate) {
    const response = await api.patch(`/marketplace/admin/vendors/${id}/commission`, {
      commissionRate,
    });
    return response.data.data || response.data;
  },
};

export default vendorService;
