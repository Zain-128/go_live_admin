import api from './api';

export const productService = {
  // Get product statistics
  async getStats() {
    const response = await api.get('/marketplace/admin/products/stats');
    return response.data.data || response.data;
  },

  // Get all products with pagination and filters
  async getProducts(params = {}) {
    const response = await api.get('/marketplace/admin/products', { params });
    return response.data.data || response.data;
  },

  // Get product by ID with full details
  async getProductById(id) {
    const response = await api.get(`/marketplace/admin/products/${id}`);
    return response.data.data || response.data;
  },

  // Update product status (approve/reject/activate/deactivate)
  async updateStatus(id, data) {
    const response = await api.patch(`/marketplace/admin/products/${id}/status`, data);
    return response.data.data || response.data;
  },

  // Toggle product featured status
  async toggleFeatured(id) {
    const response = await api.patch(`/marketplace/admin/products/${id}/featured`);
    return response.data.data || response.data;
  },

  // Get categories for filter dropdown
  async getCategories() {
    const response = await api.get('/marketplace/admin/categories');
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

export default productService;
