import api from './api';

const BASE = '/admin/stickers';

export const stickerService = {
  async getStickers() {
    const { data } = await api.get(BASE);
    return data?.data ?? [];
  },

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post(`${BASE}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data?.data ?? { url: null, previewUrl: null };
  },

  async createSticker(body) {
    const { data } = await api.post(BASE, body);
    return data?.data;
  },

  async updateSticker(id, body) {
    const { data } = await api.put(`${BASE}/${id}`, body);
    return data?.data;
  },

  async deleteSticker(id) {
    await api.delete(`${BASE}/${id}`);
    return { _id: id };
  },
};
