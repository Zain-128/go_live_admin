import api from './api';

export const reviewService = {
  // Get review statistics
  async getStats() {
    const response = await api.get('/marketplace/admin/reviews/stats');
    return response.data.data || response.data;
  },

  // Get all reviews with pagination and filters
  async getReviews(params = {}) {
    const response = await api.get('/marketplace/admin/reviews', { params });
    return response.data.data || response.data;
  },

  // Get review by ID
  async getReviewById(id) {
    const response = await api.get(`/marketplace/admin/reviews/${id}`);
    return response.data.data || response.data;
  },

  // Update review status
  async updateStatus(id, data) {
    const response = await api.patch(`/marketplace/admin/reviews/${id}/status`, data);
    return response.data.data || response.data;
  },

  // Delete review
  async deleteReview(id) {
    const response = await api.delete(`/marketplace/admin/reviews/${id}`);
    return response.data.data || response.data;
  },

  // Bulk update status
  async bulkUpdateStatus(reviewIds, status) {
    const response = await api.patch('/marketplace/admin/reviews/bulk-status', {
      reviewIds,
      status,
    });
    return response.data.data || response.data;
  },

  // Get products for filter dropdown
  async getProducts() {
    const response = await api.get('/marketplace/admin/products', {
      params: { limit: 100 },
    });
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

export default reviewService;
