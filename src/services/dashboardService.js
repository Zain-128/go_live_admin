import api from './api';

export const dashboardService = {
  // Get dashboard statistics
  getStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data.data; // Unwrap to return inner data object
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  },

  // Get recent activity
  getActivity: async (limit = 10) => {
    try {
      const response = await api.get(`/dashboard/activity?limit=${limit}`);
      return response.data.data; // Unwrap array
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
      throw error;
    }
  },

  // Get system metrics
  getMetrics: async () => {
    try {
      const response = await api.get('/dashboard/metrics');
      const metrics = response.data.data;

      // Backend provides all fields directly - no mapping needed
      return {
        databaseSize: metrics.databaseSize,
        activeSessions: metrics.activeSessions,
        apiRequestsPerHour: metrics.apiRequestsPerHour,
        averageResponse: metrics.averageResponse // Backend provides this field
      };
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
      throw error;
    }
  }
};

export default dashboardService;