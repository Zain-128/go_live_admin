import React, { useState, useEffect } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectItem } from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { SubscriptionDetailsDialog } from '../components/subscription/SubscriptionDetailsDialog';
import { SubscriptionActionsDialog } from '../components/subscription/SubscriptionActionsDialog';
import {
  CreditCard,
  Search,
  Filter,
  Eye,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  formatPrice,
  formatDate,
  getSubscriptionStatusLabel,
  getSubscriptionStatusVariant,
  getPackageTypeLabel,
  getSubscriptionStatusOptions,
  getSubscriptionTypeOptions,
  calculateDaysRemaining,
} from '../lib/subscriptionUtils';

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Dialogs
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [actionsDialogOpen, setActionsDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  const fetchSubscriptions = async (page = 1) => {
    try {
      setLoading(true);
      const response = await subscriptionService.getAllSubscriptions({
        page,
        limit: pagination.limit,
        status: selectedStatus && selectedStatus !== 'all' ? selectedStatus : undefined,
        type: selectedType && selectedType !== 'all' ? selectedType : undefined,
      });

      setSubscriptions(response.subscriptions);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      toast.error('Failed to fetch subscriptions', {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Auto-fetch when filters change
  useEffect(() => {
    fetchSubscriptions(1);
  }, [selectedStatus, selectedType]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSubscriptions(1);
  };

  const handlePageChange = (newPage) => {
    fetchSubscriptions(newPage);
  };

  const handleViewDetails = async (subscription) => {
    try {
      // Fetch full details
      const fullDetails = await subscriptionService.getSubscriptionById(subscription._id);
      setSelectedSubscription(fullDetails.subscription);
      setDetailsDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch subscription details:', error);
      toast.error('Failed to fetch subscription details');
    }
  };

  const handleActions = async (subscription) => {
    try {
      // Fetch full details
      const fullDetails = await subscriptionService.getSubscriptionById(subscription._id);
      setSelectedSubscription(fullDetails.subscription);
      setActionsDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch subscription details:', error);
      toast.error('Failed to fetch subscription details');
    }
  };

  const handleActionSuccess = () => {
    fetchSubscriptions(pagination.page);
    setSelectedSubscription(null);
  };

  const getDaysRemainingDisplay = (subscription) => {
    if (!subscription.currentPeriodEnd) return null;
    const days = calculateDaysRemaining(subscription.currentPeriodEnd);
    if (days < 0) return <span className="text-destructive">Expired</span>;
    if (days === 0) return <span className="text-yellow-600">Today</span>;
    return <span className="text-muted-foreground">{days}d left</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Subscription Management</h2>
        <p className="text-muted-foreground">View and manage all user subscriptions</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
                placeholder="Select..."
              >
                  {getSubscriptionStatusOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select
                value={selectedType}
                onValueChange={setSelectedType}
                placeholder="Select..."
              >
                  <SelectItem value="all">All types</SelectItem>
                  {getSubscriptionTypeOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('');
                  setSelectedType('');
                  fetchSubscriptions(1);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions ({pagination.total})</CardTitle>
          <CardDescription>All user subscriptions across your platform</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading subscriptions...</div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No subscriptions found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((subscription) => (
                    <TableRow key={subscription._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {subscription.userId?.firstName} {subscription.userId?.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">{subscription.userId?.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{subscription.packageId?.name || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">Tier {subscription.packageId?.tier || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getPackageTypeLabel(subscription.type)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatPrice(subscription.amountPaid || 0, subscription.currency)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSubscriptionStatusVariant(subscription.status)}>
                          {getSubscriptionStatusLabel(subscription.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(subscription.currentPeriodStart)}</div>
                          <div className="text-xs">{getDaysRemainingDisplay(subscription)}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleViewDetails(subscription)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleActions(subscription)}>
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.pages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <SubscriptionDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        subscription={selectedSubscription}
      />

      <SubscriptionActionsDialog
        open={actionsDialogOpen}
        onOpenChange={setActionsDialogOpen}
        subscription={selectedSubscription}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
};

export default SubscriptionManagement;
