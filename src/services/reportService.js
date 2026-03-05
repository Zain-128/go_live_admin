import api from './api';

export const reportService = {
  async getReportedUsers(params = {}) {
    const { page = 1, limit = 10, status } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
    });
    const response = await api.get(`/admin/reports/users?${queryParams}`);
    return response.data.data;
  },

  async getReportedPosts(params = {}) {
    const { page = 1, limit = 10, status } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
    });
    const response = await api.get(`/admin/reports/posts?${queryParams}`);
    return response.data.data;
  },

  async deleteUser(id) {
    await api.delete(`/admin/users/${id}`);
  },

  async deletePost(id) {
    await api.delete(`/admin/posts/${id}`);
  },
};
