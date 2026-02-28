import api from './api';

/**
 * Subscription Service
 * Handles all API calls for subscription and package management
 */
export const subscriptionService = {
  // ==========================================
  // Package Management
  // ==========================================

  /**
   * Create Stripe product and price
   * @param {Object} productData - Product and price details
   * @returns {Promise} Created product and price IDs
   */
  async createStripeProduct(productData) {
    const response = await api.post('/subscription/admin/packages/stripe/create', productData);
    return response.data.data;
  },

  /**
   * Create new subscription package
   * @param {Object} packageData - Package details
   * @returns {Promise} Created package
   */
  async createPackage(packageData) {
    const response = await api.post('/subscription/admin/packages', packageData);
    return response.data.data;
  },

  /**
   * Get all packages with optional filters
   * @param {Object} params - Filter parameters (page, limit, type, tier, isActive, isPublic, search)
   * @returns {Promise} Packages list with pagination
   */
  async getAllPackages(params = {}) {
    const { page = 1, limit = 10, type, tier, isActive, isPublic, search } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(type && { type }),
      ...(tier && { tier: tier.toString() }),
      ...(isActive !== undefined && { isActive: isActive.toString() }),
      ...(isPublic !== undefined && { isPublic: isPublic.toString() }),
      ...(search && { search })
    });

    const response = await api.get(`/subscription/admin/packages?${queryParams}`);
    return response.data.data;
  },

  /**
   * Get package by ID
   * @param {string} id - Package ID
   * @returns {Promise} Package details
   */
  async getPackageById(id) {
    const response = await api.get(`/subscription/admin/packages/${id}`);
    return response.data.data;
  },

  /**
   * Update package
   * @param {string} id - Package ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise} Updated package
   */
  async updatePackage(id, updateData) {
    const response = await api.put(`/subscription/admin/packages/${id}`, updateData);
    return response.data.data;
  },

  /**
   * Delete package
   * @param {string} id - Package ID
   * @returns {Promise} Success message
   */
  async deletePackage(id) {
    const response = await api.delete(`/subscription/admin/packages/${id}`);
    return response.data;
  },

  /**
   * Toggle package visibility
   * @param {string} id - Package ID
   * @param {boolean} isPublic - Visibility status
   * @returns {Promise} Updated package
   */
  async togglePackageVisibility(id, isPublic) {
    const response = await api.patch(`/subscription/admin/packages/${id}/visibility`, { isPublic });
    return response.data.data;
  },

  // ==========================================
  // Subscription Management
  // ==========================================

  /**
   * Get subscription statistics
   * @returns {Promise} Statistics data
   */
  async getSubscriptionStats() {
    const response = await api.get('/subscription/admin/stats');
    return response.data.data;
  },

  /**
   * Get all subscriptions with optional filters
   * @param {Object} params - Filter parameters (page, limit, status, packageId, type, userId, sortBy, sortOrder)
   * @returns {Promise} Subscriptions list with pagination
   */
  async getAllSubscriptions(params = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      packageId,
      type,
      userId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
      ...(status && { status }),
      ...(packageId && { packageId }),
      ...(type && { type }),
      ...(userId && { userId })
    });

    const response = await api.get(`/subscription/admin/subscriptions?${queryParams}`);
    return response.data.data;
  },

  /**
   * Get subscription by ID
   * @param {string} id - Subscription ID
   * @returns {Promise} Subscription details
   */
  async getSubscriptionById(id) {
    const response = await api.get(`/subscription/admin/subscriptions/${id}`);
    return response.data.data;
  },

  /**
   * Cancel user subscription
   * @param {string} id - Subscription ID
   * @param {Object} data - Cancel options (reason, immediately)
   * @returns {Promise} Updated subscription
   */
  async cancelSubscription(id, data = {}) {
    const response = await api.post(`/subscription/admin/subscriptions/${id}/cancel`, data);
    return response.data.data;
  },

  /**
   * Extend subscription period
   * @param {string} id - Subscription ID
   * @param {Object} data - Extension data (days, reason)
   * @returns {Promise} Updated subscription
   */
  async extendSubscription(id, data) {
    const response = await api.post(`/subscription/admin/subscriptions/${id}/extend`, data);
    return response.data.data;
  },

  /**
   * Pause subscription
   * @param {string} id - Subscription ID
   * @param {Object} data - Pause reason
   * @returns {Promise} Updated subscription
   */
  async pauseSubscription(id, data = {}) {
    const response = await api.post(`/subscription/admin/subscriptions/${id}/pause`, data);
    return response.data.data;
  },

  /**
   * Resume paused subscription
   * @param {string} id - Subscription ID
   * @returns {Promise} Updated subscription
   */
  async resumeSubscription(id) {
    const response = await api.post(`/subscription/admin/subscriptions/${id}/resume`);
    return response.data.data;
  },

  /**
   * Update subscription notes
   * @param {string} id - Subscription ID
   * @param {Object} data - Notes data
   * @returns {Promise} Updated subscription
   */
  async updateSubscriptionNotes(id, data) {
    const response = await api.put(`/subscription/admin/subscriptions/${id}/notes`, data);
    return response.data.data;
  }
};
