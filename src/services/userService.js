import api from './api';

export const userService = {
  async getAllUsers(params = {}) {
    const { page = 1, limit = 10, role, search } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(role && { role }),
      ...(search && { search })
    });

    const response = await api.get(`/admin/users?${queryParams}`);
    return response.data.data; // Unwrap to return inner data object
  },

  async getUserById(id) {
    const response = await api.get(`/admin/users/${id}`);
    return response.data.data; // Unwrap to return inner data object
  },

  async createUser(userData) {
    const response = await api.post('/admin/users', userData);
    return response.data.data; // Unwrap to return inner data object
  },

  async updateUser(id, userData) {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data.data; // Unwrap to return inner data object
  },

  async resetPassword(id) {
    const response = await api.patch(`/admin/users/${id}/reset-password`);
    return response.data.data;
  },

  async deleteUser(id) {
    await api.delete(`/admin/users/${id}`);
  },

  async blockUser(id, options = {}) {
    const response = await api.patch(`/admin/users/${id}/block`, options);
    return response.data.data;
  },

  async unblockUser(id) {
    const response = await api.patch(`/admin/users/${id}/unblock`);
    return response.data.data;
  }
};