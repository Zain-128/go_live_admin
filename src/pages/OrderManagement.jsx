import React, { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import {
  Package,
  Search,
  Loader2,
  Eye,
  DollarSign,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Dialog states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, statusFilter, search]);

  const fetchStats = async () => {
    try {
      const data = await orderService.getStats();
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (search) {
        params.search = search;
      }

      const data = await orderService.getOrders(params);
      setOrders(data.orders || []);
      setPagination(prev => ({
        ...prev,
        ...data.pagination,
      }));
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (order) => {
    try {
      const data = await orderService.getOrderById(order._id);
      setSelectedOrder(data.order);
      setViewDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load order details');
    }
  };

  const handleStatusClick = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusNote('');
    setStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      setUpdating(true);
      await orderService.updateStatus(selectedOrder._id, {
        status: newStatus,
        note: statusNote,
      });
      toast.success('Order status updated');
      setStatusDialogOpen(false);
      fetchOrders();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleRefund = async (order) => {
    if (!confirm(`Are you sure you want to refund order ${order.orderNumber}?`)) return;

    try {
      await orderService.processRefund(order._id, { reason: 'Admin refund' });
      toast.success('Order refunded successfully');
      fetchOrders();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process refund');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: 'outline', className: 'border-yellow-500 text-yellow-600' },
      processing: { variant: 'outline', className: 'border-blue-500 text-blue-600' },
      shipped: { variant: 'outline', className: 'border-purple-500 text-purple-600' },
      delivered: { variant: 'outline', className: 'border-green-500 text-green-600' },
      completed: { variant: 'default', className: 'bg-green-500' },
      cancelled: { variant: 'outline', className: 'border-red-500 text-red-600' },
      refunded: { variant: 'secondary', className: '' },
    };
    const config = variants[status] || { variant: 'outline', className: '' };
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const variants = {
      pending: 'outline',
      processing: 'outline',
      completed: 'default',
      failed: 'destructive',
      refunded: 'secondary',
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const statCards = [
    {
      title: 'Total Orders',
      value: stats?.total || 0,
      icon: ShoppingCart,
      color: 'text-blue-600',
    },
    {
      title: 'Pending',
      value: stats?.byStatus?.pending || 0,
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      title: 'Processing',
      value: stats?.byStatus?.processing || 0,
      icon: RefreshCw,
      color: 'text-blue-600',
    },
    {
      title: 'Completed',
      value: stats?.byStatus?.completed || 0,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Revenue',
      value: `$${(stats?.revenue?.total || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Commission',
      value: `$${(stats?.revenue?.commission || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order Management</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by order number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No orders found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>
                      {order.buyerId ? (
                        <div>
                          <p className="font-medium">
                            {order.buyerId.firstName} {order.buyerId.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{order.buyerId.email}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {order.vendorId?.storeName || 'Unknown'}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${order.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <button onClick={() => handleStatusClick(order)}>
                        {getStatusBadge(order.status)}
                      </button>
                    </TableCell>
                    <TableCell>
                      {getPaymentStatusBadge(order.payment?.status || 'pending')}
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!['cancelled', 'refunded'].includes(order.status) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRefund(order)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Showing {orders.length} of {pagination.total} orders
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Payment</Label>
                  <div className="mt-1">
                    {getPaymentStatusBadge(selectedOrder.payment?.status || 'pending')}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500">Total</Label>
                  <p className="font-bold text-lg">${selectedOrder.total.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Date</Label>
                  <p>{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-gray-500">Customer</Label>
                {selectedOrder.buyerId ? (
                  <div className="mt-1">
                    <p className="font-medium">
                      {selectedOrder.buyerId.firstName} {selectedOrder.buyerId.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{selectedOrder.buyerId.email}</p>
                  </div>
                ) : (
                  <p className="text-gray-400">Unknown</p>
                )}
              </div>

              <div>
                <Label className="text-gray-500">Shipping Address</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                  <p>
                    {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                  </p>
                  <p>{selectedOrder.shippingAddress.address1}</p>
                  <p>
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{' '}
                    {selectedOrder.shippingAddress.zipCode}
                  </p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>

              <div>
                <Label className="text-gray-500">Items</Label>
                <div className="mt-1 space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} x ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium">${item.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>${selectedOrder.shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold mt-2">
                  <span>Total</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {selectedOrder.customerNote && (
                <div>
                  <Label className="text-gray-500">Customer Note</Label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                    {selectedOrder.customerNote}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status for order {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Note (Optional)</Label>
              <Input
                className="mt-1"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Add a note..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={updating}>
              {updating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagement;
