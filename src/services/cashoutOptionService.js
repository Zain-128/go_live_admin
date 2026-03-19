import api from './api';

const BASE = '/admin/cashout-options';

export const cashoutOptionService = {
  async getAll() {
    const { data } = await api.get(BASE);
    return data?.data ?? [];
  },

  async create(body) {
    const { data } = await api.post(BASE, body);
    return data?.data;
  },

  async update(id, body) {
    const { data } = await api.put(`${BASE}/${id}`, body);
    return data?.data;
  },

  async remove(id) {
    await api.delete(`${BASE}/${id}`);
    return { _id: id };
  },
};
