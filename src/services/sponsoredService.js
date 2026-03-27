import api from './api';

export const sponsoredService = {
  async getSponsoredUsers(params = {}) {
    const { page = 1, limit = 20, status = 'all', search } = params;
    const queryParams = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      status: status || 'all',
      ...(search && String(search).trim() ? { search: String(search).trim() } : {}),
    });
    const response = await api.get(`/admin/sponsored-users?${queryParams}`);
    return response.data.data;
  },

  async updateUserSponsored(id, payload) {
    const response = await api.put(`/admin/users/${id}`, payload);
    return response.data.data;
  },
};
