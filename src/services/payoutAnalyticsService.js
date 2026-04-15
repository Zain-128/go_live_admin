import api from "./api";

export const payoutAnalyticsService = {
  async getStreamers(params = {}) {
    const response = await api.get("/admin/payout-analytics/streamers", { params });
    return response.data.data;
  },

  async getStreamerDetails(streamerId, params = {}) {
    const response = await api.get(`/admin/payout-analytics/streamers/${streamerId}`, { params });
    return response.data.data;
  },

  async getGifterDetails(gifterId, params = {}) {
    const response = await api.get(`/admin/payout-analytics/gifters/${gifterId}`, { params });
    return response.data.data;
  },

  async getStreamDetails(streamId) {
    const response = await api.get(`/admin/payout-analytics/streams/${streamId}`);
    return response.data.data;
  },
};

export default payoutAnalyticsService;
