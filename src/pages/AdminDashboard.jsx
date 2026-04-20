import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Users,
  UserCheck,
  Shield,
  Activity,
  TrendingUp,
  AlertTriangle,
  Database,
  Clock,
  CreditCard,
  DollarSign,
  Package,
  TrendingDown
} from 'lucide-react';
import dashboardService from '../services/dashboardService';
import { subscriptionService } from '../services/subscriptionService';
import { formatPrice, getTierBadgeVariant, getTierLabel } from '../lib/subscriptionUtils';
import SupportDashboardWidget from '../components/SupportDashboardWidget';

const AdminDashboard = () => {
  const [stats, setStats] = useState([
    { title: 'Total Users', value: '0', change: '', changeType: 'neutral', icon: Users },
    { title: 'Active Users', value: '0', change: '', changeType: 'neutral', icon: UserCheck },
    { title: 'Admin Users', value: '0', change: '', changeType: 'neutral', icon: Shield }
  ]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState([
    { label: 'Database Size', value: 'Loading...', icon: Database },
    { label: 'Active Sessions', value: 'Loading...', icon: Activity },
    { label: 'API Requests/hr', value: 'Loading...', icon: TrendingUp },
    { label: 'Average Response', value: 'Loading...', icon: Clock }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptionStats, setSubscriptionStats] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, activityResponse, metricsResponse, subStatsResponse] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getActivity(10),
        dashboardService.getMetrics(),
        subscriptionService.getSubscriptionStats().catch(() => null) // Don't fail if subscriptions not available
      ]);

      // Update stats (dashboardService now unwraps, so we can use directly)
      const formattedStats = [
        {
          title: 'Total Users',
          value: statsResponse.totalUsers.count.toString(),
          change: statsResponse.totalUsers.change,
          changeType: statsResponse.totalUsers.changeType,
          icon: Users
        },
        {
          title: 'Active Users',
          value: statsResponse.activeUsers.count.toString(),
          change: statsResponse.activeUsers.change,
          changeType: statsResponse.activeUsers.changeType,
          icon: UserCheck
        },
        {
          title: 'Admin Users',
          value: statsResponse.adminUsers.count.toString(),
          change: statsResponse.adminUsers.change,
          changeType: statsResponse.adminUsers.changeType,
          icon: Shield
        }
      ];
      setStats(formattedStats);

      // Update recent activity (direct use, no .data)
      setRecentActivity(activityResponse || []);

      // Update system metrics (direct use, no .data)
      const formattedMetrics = [
        { label: 'Database Size', value: metricsResponse.databaseSize, icon: Database },
        { label: 'Active Sessions', value: metricsResponse.activeSessions, icon: Activity },
        { label: 'API Requests/hr', value: metricsResponse.apiRequestsPerHour, icon: TrendingUp },
        { label: 'System Uptime', value: metricsResponse.averageResponse, icon: Clock }
      ];
      setSystemMetrics(formattedMetrics);

      // Update subscription stats
      if (subStatsResponse) {
        setSubscriptionStats(subStatsResponse);
      }

    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };


  const getActivityIcon = (type) => {
    switch (type) {
      case 'user':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'role':
        return <Shield className="w-4 h-4 text-green-500" />;
      case 'status':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'security':
        return <Shield className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-red-600 mt-1">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of your system and user management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change && (
                  <p className={`text-xs ${
                    stat.changeType === 'positive' ? 'text-green-600' :
                    stat.changeType === 'negative' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {stat.change} from last month
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Support Widget */}
      <SupportDashboardWidget />

      {/* Subscription Stats */}
      {subscriptionStats && (
        <>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Subscription Overview</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subscriptionStats.subscriptionStats?.totalSubscriptions || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  All time subscriptions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {subscriptionStats.subscriptionStats?.activeSubscriptions || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trial Users</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {subscriptionStats.subscriptionStats?.trialingSubscriptions || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  In trial period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Canceled</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {subscriptionStats.subscriptionStats?.canceledSubscriptions || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Canceled subscriptions
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Packages */}
            <Card>
              <CardHeader>
                <CardTitle>Top Packages</CardTitle>
                <CardDescription>Most popular subscription packages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscriptionStats.topPackages?.length > 0 ? (
                    subscriptionStats.topPackages.map((pkg) => (
                      <div key={pkg._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{pkg.name}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant={getTierBadgeVariant(pkg.tier)} className="text-xs">
                                {getTierLabel(pkg.tier)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {pkg.subscriberCount} subscribers
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {formatPrice(pkg.revenue || 0)}
                          </p>
                          <p className="text-xs text-muted-foreground">revenue</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No packages yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Subscriptions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Subscriptions</CardTitle>
                <CardDescription>Latest subscription activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscriptionStats.recentSubscriptions?.length > 0 ? (
                    subscriptionStats.recentSubscriptions.slice(0, 5).map((sub) => (
                      <div key={sub._id} className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mt-1">
                            <Users className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {sub.userId?.firstName} {sub.userId?.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">{sub.packageId?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(sub.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {sub.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent subscriptions</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system and user activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-gray-500">No recent activity</p>
              ) : (
                recentActivity.map((activity, index) => (
                  <div key={activity.id || index} className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {activity.user}
                      </p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>System Metrics</CardTitle>
            <CardDescription>Current system performance and usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemMetrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-gray-900">
                        {metric.label}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {metric.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <span>System Alerts (Dummy Data)</span>
          </CardTitle>
          <CardDescription>Important notifications and warnings - Sample alerts for demonstration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Database backup is overdue
                </p>
                <p className="text-sm text-yellow-700">
                  Last backup was performed 8 days ago. Consider running a backup.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  High API usage detected
                </p>
                <p className="text-sm text-blue-700">
                  API requests are 15% higher than usual. Monitor for performance issues.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;