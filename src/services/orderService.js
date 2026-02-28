import api from './api';

export const orderService = {
  // Get order statistics
  async getStats() {
    const response = await api.get('/marketplace/admin/orders/stats');
    return response.data.data || response.data;
  },

  // Get all orders with pagination and filters
  async getOrders(params = {}) {
    const response = await api.get('/marketplace/admin/orders', { params });
    return response.data.data || response.data;
  },

  // Get order by ID
  async getOrderById(id) {
    const response = await api.get(`/marketplace/admin/orders/${id}`);
    return response.data.data || response.data;
  },

  // Update order status
  async updateStatus(id, data) {
    const response = await api.patch(`/marketplace/admin/orders/${id}/status`, data);
    return response.data.data || response.data;
  },

  // Update payment status
  async updatePayment(id, data) {
    const response = await api.patch(`/marketplace/admin/orders/${id}/payment`, data);
    return response.data.data || response.data;
  },

  // Process refund
  async processRefund(id, data) {
    const response = await api.post(`/marketplace/admin/orders/${id}/refund`, data);
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

export default orderService;
