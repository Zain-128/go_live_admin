import React, { useState, useEffect } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  DollarSign,
  Activity,
  CreditCard,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  formatPrice,
  formatDate,
  getTierLabel,
  getTierBadgeVariant,
  getSubscriptionStatusLabel,
  getSubscriptionStatusVariant,
} from '../lib/subscriptionUtils';

const SubscriptionStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await subscriptionService.getSubscriptionStats();
      setStats(response);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to fetch statistics', {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Failed to load statistics</p>
        </div>
      </div>
    );
  }

  const { subscriptionStats, packageStats, topPackages, recentSubscriptions } = stats;

  // Calculate total revenue from all currencies
  const totalRevenue = subscriptionStats?.revenue?.reduce((sum, curr) => sum + (curr.total || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Subscription Analytics</h2>
        <p className="text-muted-foreground">Overview of subscription and package performance</p>
      </div>

      {/* Subscription Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptionStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {subscriptionStats?.active || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{subscriptionStats?.active || 0}</div>
            <p className="text-xs text-muted-foreground">
              {subscriptionStats?.trialing || 0} in trial
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(totalRevenue, subscriptionStats?.revenue?.[0]?._id || 'USD')}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {subscriptionStats?.revenue?.length || 0} {subscriptionStats?.revenue?.length === 1 ? 'currency' : 'currencies'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Past Due</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{subscriptionStats?.pastDue || 0}</div>
            <p className="text-xs text-muted-foreground">
              {subscriptionStats?.canceled || 0} canceled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Package Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packageStats?.totalPackages || 0}</div>
            <p className="text-xs text-muted-foreground">
              {packageStats?.activePackages || 0} active packages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packageStats?.totalSubscribers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all packages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Package Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(packageStats?.totalRevenue || 0, 'USD')}
            </div>
            <p className="text-xs text-muted-foreground">
              From package sales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Currency */}
      {subscriptionStats?.revenue && subscriptionStats.revenue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Currency</CardTitle>
            <CardDescription>Total revenue breakdown by currency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subscriptionStats.revenue.map((rev) => (
                <div key={rev._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Currency</p>
                    <p className="text-2xl font-bold">{rev._id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-xl font-semibold">{formatPrice(rev.total, rev._id)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Packages */}
      {topPackages && topPackages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Packages</CardTitle>
            <CardDescription>Most popular subscription packages by subscriber count</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package Name</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Subscribers</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPackages.map((pkg) => (
                  <TableRow key={pkg._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pkg.name}</div>
                        <div className="text-sm text-muted-foreground">{pkg.slug}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTierBadgeVariant(pkg.tier)}>
                        {getTierLabel(pkg.tier)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {pkg.subscriberCount || 0}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(pkg.revenue || 0, 'USD')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Recent Subscriptions */}
      {recentSubscriptions && recentSubscriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Subscriptions</CardTitle>
            <CardDescription>Latest subscription activity</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSubscriptions.map((sub) => (
                  <TableRow key={sub._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {sub.userId?.firstName} {sub.userId?.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">{sub.userId?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{sub.packageId?.name || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSubscriptionStatusVariant(sub.status)}>
                        {getSubscriptionStatusLabel(sub.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(sub.amountPaid || 0, sub.currency)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(sub.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionStats;
