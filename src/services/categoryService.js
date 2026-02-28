import api from './api';

export const categoryService = {
  // Get all categories with pagination and filters
  async getCategories(params = {}) {
    const response = await api.get('/marketplace/admin/categories', { params });
    return response.data.data || response.data;
  },

  // Get category by ID
  async getCategoryById(id) {
    const response = await api.get(`/marketplace/admin/categories/${id}`);
    return response.data.data || response.data;
  },

  // Create category
  async createCategory(data) {
    const response = await api.post('/marketplace/admin/categories', data);
    return response.data.data || response.data;
  },

  // Update category
  async updateCategory(id, data) {
    const response = await api.put(`/marketplace/admin/categories/${id}`, data);
    return response.data.data || response.data;
  },

  // Delete category
  async deleteCategory(id) {
    const response = await api.delete(`/marketplace/admin/categories/${id}`);
    return response.data.data || response.data;
  },

  // Reorder categories
  async reorderCategories(orderedIds) {
    const response = await api.put('/marketplace/admin/categories/reorder', {
      orderedIds,
    });
    return response.data.data || response.data;
  },

  // Get category tree (for dropdowns)
  async getCategoryTree() {
    const response = await api.get('/marketplace/categories/tree');
    return response.data.data || response.data;
  },
};

export default categoryService;
