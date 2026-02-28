import api from './api';

export const qrCodeService = {
  // Get analytics overview
  async getAnalytics() {
    const response = await api.get('/qr-code/admin/analytics');
    return response.data.data;
  },

  // Get all QR codes with pagination and filters
  async getAllQRCodes(params = {}) {
    const { page = 1, limit = 10, status, actionType, search, sortBy, sortOrder } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(actionType && { actionType }),
      ...(search && { search }),
      ...(sortBy && { sortBy }),
      ...(sortOrder && { sortOrder })
    });
    const response = await api.get(`/qr-code/admin?${queryParams}`);
    return response.data.data;
  },

  // Create a new QR code
  async createQRCode(data) {
    const response = await api.post('/qr-code/admin', data);
    return response.data.data;
  },

  // Get QR code by ID
  async getQRCodeById(id) {
    const response = await api.get(`/qr-code/admin/${id}`);
    return response.data.data;
  },

  // Get QR code statistics
  async getQRCodeStats(id) {
    const response = await api.get(`/qr-code/admin/${id}/stats`);
    return response.data.data;
  },

  // Get QR code image
  async getQRCodeImage(id) {
    const response = await api.get(`/qr-code/admin/${id}/image`);
    return response.data.data;
  },

  // Update QR code
  async updateQRCode(id, data) {
    const response = await api.put(`/qr-code/admin/${id}`, data);
    return response.data.data;
  },

  // Revoke QR code
  async revokeQRCode(id) {
    const response = await api.post(`/qr-code/admin/${id}/revoke`);
    return response.data.data;
  },

  // Delete QR code
  async deleteQRCode(id) {
    const response = await api.delete(`/qr-code/admin/${id}`);
    return response.data;
  },

  // Get all action types
  async getActionTypes() {
    const response = await api.get('/qr-code/admin/action-types');
    return response.data.data;
  },

  // Create custom action type
  async createActionType(data) {
    const response = await api.post('/qr-code/admin/action-types', data);
    return response.data.data;
  },

  // Update action type
  async updateActionType(id, data) {
    const response = await api.put(`/qr-code/admin/action-types/${id}`, data);
    return response.data.data;
  },

  // Delete action type
  async deleteActionType(id) {
    const response = await api.delete(`/qr-code/admin/action-types/${id}`);
    return response.data;
  }
};
