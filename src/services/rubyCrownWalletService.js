import api from './api';

export const rubyCrownWalletService = {
  async getEligibleUsers(params = {}) {
    const { page = 1, limit = 20, search } = params;
    const queryParams = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(search && String(search).trim() ? { search: String(search).trim() } : {}),
    });
    const response = await api.get(`/admin/crown/ruby-wallet-eligible?${queryParams}`);
    return response.data.data;
  },

  async assignRuby(userId) {
    const response = await api.post('/admin/crown/ruby-assign-by-wallet', { userId });
    return response.data.data;
  },
};
