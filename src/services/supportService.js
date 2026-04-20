import api from './api';

const BASE = '/admin/support';

export const supportService = {
  async listTickets(params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      qs.append(k, String(v));
    });
    const response = await api.get(`${BASE}?${qs.toString()}`);
    return response.data.data;
  },

  async getStats() {
    const response = await api.get(`${BASE}/stats`);
    return response.data.data;
  },

  async getTicket(id) {
    const response = await api.get(`${BASE}/${id}`);
    return response.data.data;
  },

  async patchTicket(id, changes) {
    const response = await api.patch(`${BASE}/${id}`, changes);
    return response.data.data;
  },

  async replyTicket(id, body, files = []) {
    const form = new FormData();
    form.append('body', body);
    files.forEach((f) => form.append('files', f));
    const response = await api.post(`${BASE}/${id}/reply`, form);
    return response.data.data;
  },

  async addNote(id, body) {
    const response = await api.post(`${BASE}/${id}/note`, { body });
    return response.data.data;
  },

  async deleteAttachment(id, attId) {
    const response = await api.delete(`${BASE}/${id}/attachments/${attId}`);
    return response.data.data;
  },

  async exportCsv(params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      qs.append(k, String(v));
    });
    const response = await api.get(`${BASE}/export.csv?${qs.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async staffCreate({ email, name, subject, category, description, submitterUser, files = [] }) {
    const form = new FormData();
    if (email) form.append('email', email);
    if (name) form.append('name', name);
    if (subject) form.append('subject', subject);
    if (category) form.append('category', category);
    if (description) form.append('description', description);
    if (submitterUser) form.append('submitterUser', submitterUser);
    files.forEach((f) => form.append('files', f));
    const response = await api.post(`${BASE}/staff-create`, form);
    return response.data.data;
  },

  async getSettings() {
    const response = await api.get(`${BASE}/settings/all`);
    return response.data.data;
  },

  async addRecipient({ email, label }) {
    const response = await api.post(`${BASE}/settings/recipients`, { email, label });
    return response.data.data;
  },

  async updateRecipient(recipientId, changes) {
    const response = await api.patch(`${BASE}/settings/recipients/${recipientId}`, changes);
    return response.data.data;
  },

  async removeRecipient(recipientId) {
    const response = await api.delete(`${BASE}/settings/recipients/${recipientId}`);
    return response.data.data;
  },
};

export const SUPPORT_CATEGORIES = [
  { value: 'account', label: 'Account & Login' },
  { value: 'payment', label: 'Payments & Coins' },
  { value: 'streaming', label: 'Streaming Issue' },
  { value: 'gifts_rubies', label: 'Gifts & Rubies' },
  { value: 'cashout', label: 'Cashout / Withdraw' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'other', label: 'Other' },
];

export const SUPPORT_STATUSES = [
  { value: 'open', label: 'Open', tone: 'blue' },
  { value: 'in_progress', label: 'In Progress', tone: 'amber' },
  { value: 'awaiting_user', label: 'Awaiting User', tone: 'purple' },
  { value: 'resolved', label: 'Resolved', tone: 'green' },
  { value: 'closed', label: 'Closed', tone: 'gray' },
];

export const SUPPORT_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export function categoryLabel(value) {
  return SUPPORT_CATEGORIES.find((c) => c.value === value)?.label || value;
}
export function statusMeta(value) {
  return SUPPORT_STATUSES.find((s) => s.value === value) || { value, label: value, tone: 'gray' };
}
