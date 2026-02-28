import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  DollarSign,
  Search,
  Eye,
  Play,
  XCircle,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  Ban,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Building2,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import payoutService from '../services/payoutService';

const PayoutManagement = () => {
  const [payouts, setPayouts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
    totalPaid: 0,
    totalPending: 0,
    thisMonth: { amount: 0, count: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [vendors, setVendors] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0,
    totalPayouts: 0,
  });

  // Dialogs
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Create form
  const [createForm, setCreateForm] = useState({
    vendorId: '',
    periodStart: '',
    periodEnd: '',
    notes: '',
  });

  useEffect(() => {
    fetchStats();
    fetchPayouts();
    fetchVendors();
  }, []);

  useEffect(() => {
    fetchPayouts();
  }, [statusFilter, vendorFilter, pagination.current]);

  const fetchStats = async () => {
    try {
      const data = await payoutService.getStats();
      setStats(data);
    } catch (error) {
      toast.error('Failed to fetch payout statistics');
    }
  };

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: 10,
      };

      if (statusFilter !== 'all') params.status = statusFilter;
      if (vendorFilter !== 'all') params.vendorId = vendorFilter;
      if (search) params.search = search;

      const data = await payoutService.getPayouts(params);
      setPayouts(data.payouts || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      toast.error('Failed to fetch payouts');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const data = await payoutService.getVendors();
      setVendors(data.vendors || []);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchPayouts();
  };

  const handleViewPayout = async (payout) => {
    try {
      const data = await payoutService.getPayoutById(payout._id);
      setSelectedPayout(data.payout);
      setViewDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load payout details');
    }
  };

  const handleCreatePayout = async () => {
    if (!createForm.vendorId) {
      toast.error('Please select a vendor');
      return;
    }

    try {
      await payoutService.createPayout(createForm);
      toast.success('Payout created');
      setCreateDialogOpen(false);
      setCreateForm({ vendorId: '', periodStart: '', periodEnd: '', notes: '' });
      fetchStats();
      fetchPayouts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create payout');
    }
  };

  const handleProcessPayout = async (payout) => {
    try {
      await payoutService.processPayout(payout._id);
      toast.success('Payout processing initiated');
      fetchStats();
      fetchPayouts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process payout');
    }
  };

  const handleOpenCancelDialog = (payout) => {
    setSelectedPayout(payout);
    setCancelReason('');
    setCancelDialogOpen(true);
  };

  const handleCancelPayout = async () => {
    try {
      await payoutService.cancelPayout(selectedPayout._id, { reason: cancelReason });
      toast.success('Payout cancelled');
      setCancelDialogOpen(false);
      fetchStats();
      fetchPayouts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel payout');
    }
  };

  const handleRetryPayout = async (payout) => {
    try {
      await payoutService.retryPayout(payout._id);
      toast.success('Payout queued for retry');
      fetchStats();
      fetchPayouts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to retry payout');
    }
  };

  const handleCompleteManually = async (payout) => {
    try {
      await payoutService.updateStatus(payout._id, { status: 'completed' });
      toast.success('Payout marked as completed');
      fetchStats();
      fetchPayouts();
    } catch (error) {
      toast.error('Failed to update payout');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><AlertCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200"><Ban className="w-3 h-3 mr-1" /> Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payout Management</h1>
          <p className="text-gray-600">Manage vendor payouts and transfers</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Payout
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Payouts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
            <div className="text-sm text-gray-500">Processing</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalPaid)}</div>
            <div className="text-sm text-gray-500">Total Paid</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(stats.thisMonth?.amount)}</div>
            <div className="text-sm text-gray-500">This Month</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by vendor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={vendorFilter} onValueChange={setVendorFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Vendor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor._id} value={vendor._id}>
                    {vendor.businessName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payouts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : payouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No payouts found
                  </TableCell>
                </TableRow>
              ) : (
                payouts.map((payout) => (
                  <TableRow key={payout._id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">
                          {payout.vendorId?.businessName || 'Unknown'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(payout.amount)}
                    </TableCell>
                    <TableCell>
                      {payout.orders?.length || 0} orders
                    </TableCell>
                    <TableCell>{getStatusBadge(payout.status)}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(payout.periodStart)} - {formatDate(payout.periodEnd)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(payout.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPayout(payout)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {payout.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleProcessPayout(payout)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenCancelDialog(payout)}
                              className="text-gray-600 hover:text-red-600"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {payout.status === 'processing' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCompleteManually(payout)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenCancelDialog(payout)}
                              className="text-gray-600 hover:text-red-600"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {payout.status === 'failed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRetryPayout(payout)}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination */}
        {pagination.total > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-gray-500">
              Showing {((pagination.current - 1) * 10) + 1} to {Math.min(pagination.current * 10, pagination.totalPayouts)} of {pagination.totalPayouts}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                disabled={pagination.current === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">
                Page {pagination.current} of {pagination.total}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                disabled={pagination.current === pagination.total}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* View Payout Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payout Details</DialogTitle>
          </DialogHeader>
          {selectedPayout && (
            <div className="space-y-4">
              {/* Vendor Info */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Building2 className="w-8 h-8 text-gray-400" />
                <div>
                  <div className="font-medium">{selectedPayout.vendorId?.businessName}</div>
                  <div className="text-sm text-gray-500">
                    {selectedPayout.vendorId?.email}
                  </div>
                </div>
              </div>

              {/* Amount & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Amount</div>
                  <div className="text-xl font-bold">{formatCurrency(selectedPayout.amount)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="mt-1">{getStatusBadge(selectedPayout.status)}</div>
                </div>
              </div>

              {/* Period */}
              <div>
                <div className="text-sm text-gray-500">Period</div>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>
                    {formatDate(selectedPayout.periodStart)} - {formatDate(selectedPayout.periodEnd)}
                  </span>
                </div>
              </div>

              {/* Orders */}
              <div>
                <div className="text-sm text-gray-500 mb-2">Orders ({selectedPayout.orders?.length || 0})</div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {selectedPayout.orders?.map((order, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                      <span>{order.orderId?.orderNumber || `Order ${idx + 1}`}</span>
                      <span>{formatCurrency(order.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Failure Reason */}
              {selectedPayout.failureReason && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-sm text-red-600 font-medium mb-1">Failure Reason</div>
                  <div className="text-sm">{selectedPayout.failureReason}</div>
                </div>
              )}

              {/* Notes */}
              {selectedPayout.notes && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Notes</div>
                  <div className="text-sm">{selectedPayout.notes}</div>
                </div>
              )}

              {/* Processed By */}
              {selectedPayout.processedBy && (
                <div className="text-sm text-gray-500">
                  Processed by: {selectedPayout.processedBy.firstName} {selectedPayout.processedBy.lastName}
                </div>
              )}

              {/* Timestamps */}
              <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
                <div>Created: {formatDate(selectedPayout.createdAt)}</div>
                {selectedPayout.completedAt && (
                  <div>Completed: {formatDate(selectedPayout.completedAt)}</div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Payout Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Payout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Vendor</label>
              <Select
                value={createForm.vendorId}
                onValueChange={(value) => setCreateForm(prev => ({ ...prev, vendorId: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor._id} value={vendor._id}>
                      {vendor.businessName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Period Start</label>
                <Input
                  type="date"
                  value={createForm.periodStart}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, periodStart: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Period End</label>
                <Input
                  type="date"
                  value={createForm.periodEnd}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, periodEnd: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                value={createForm.notes}
                onChange={(e) => setCreateForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add notes about this payout..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePayout}>
              Create Payout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Payout Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Payout</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this payout? This will release the associated orders for future payouts.
            </p>
            <div>
              <label className="text-sm font-medium">Reason (optional)</label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter cancellation reason..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Payout
            </Button>
            <Button variant="destructive" onClick={handleCancelPayout}>
              Cancel Payout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayoutManagement;
