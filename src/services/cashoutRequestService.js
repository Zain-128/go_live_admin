import api from './api';

export const cashoutRequestService = {
  async getCashoutRequests(params = {}) {
    const { page = 1, limit = 20, status } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
    });
    const response = await api.get(`/admin/cashout-requests?${queryParams}`);
    return response.data.data;
  },

  async approveRequest(id, adminNotes = null) {
    const response = await api.patch(`/admin/cashout-requests/${id}/approve`, { adminNotes });
    return response.data;
  },

  async rejectRequest(id, adminNotes = null) {
    const response = await api.patch(`/admin/cashout-requests/${id}/reject`, { adminNotes });
    return response.data;
  },
};
