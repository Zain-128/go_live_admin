import api from './api';

export const topSpendersService = {
  async getTopSpenders(params = {}) {
    const { page = 1, limit = 20, search, sort = 'usd_desc', filter = 'all' } = params;
    const queryParams = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort,
      filter,
      ...(search && String(search).trim() ? { search: String(search).trim() } : {}),
    });
    const response = await api.get(`/admin/crown/top-spenders?${queryParams}`);
    return response.data.data;
  },

  async assignRuby(userId) {
    const response = await api.post('/admin/crown/ruby-assign', { userId });
    return response.data.data;
  },

  async revokeRuby(userId) {
    const response = await api.post('/admin/crown/ruby-revoke', { userId });
    return response.data.data;
  },
};
