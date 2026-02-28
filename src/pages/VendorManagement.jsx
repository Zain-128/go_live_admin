import React, { useState, useEffect } from 'react';
import { vendorService } from '../services/vendorService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Store, CheckCircle, XCircle, Clock, Search, Eye, Check, Ban } from 'lucide-react';

export function VendorManagement() {
  const [vendors, setVendors] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Dialogs
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await vendorService.getStats();
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
      };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const data = await vendorService.getVendors(params);
      setVendors(data.vendors || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [page, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchVendors();
  };

  const handleViewDetails = async (vendor) => {
    try {
      const data = await vendorService.getVendorById(vendor._id);
      setSelectedVendor(data.vendor);
      setDetailOpen(true);
    } catch (err) {
      alert('Failed to load vendor details');
    }
  };

  const handleOpenStatusDialog = (vendor, status) => {
    setSelectedVendor(vendor);
    setNewStatus(status);
    setStatusReason('');
    setStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedVendor) return;

    if ((newStatus === 'suspended' || newStatus === 'rejected') && !statusReason.trim()) {
      alert('Reason is required for suspend/reject');
      return;
    }

    setUpdating(true);
    try {
      await vendorService.updateStatus(selectedVendor._id, {
        status: newStatus,
        reason: statusReason || undefined,
      });
      setStatusDialogOpen(false);
      fetchVendors();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      rejected: 'bg-gray-100 text-gray-800',
    };
    const icons = {
      active: <CheckCircle className="w-3 h-3 mr-1" />,
      pending: <Clock className="w-3 h-3 mr-1" />,
      suspended: <Ban className="w-3 h-3 mr-1" />,
      rejected: <XCircle className="w-3 h-3 mr-1" />,
    };
    return (
      <Badge className={`${styles[status] || 'bg-gray-100'} inline-flex items-center`}>
        {icons[status]}
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vendor Management</h1>
        <p className="text-gray-500">Manage marketplace vendors</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">New Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.newToday}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by store name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
            </select>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Vendors Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      ) : vendors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Store className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No vendors found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Store</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Owner</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Products</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Commission</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {vendors.map((vendor) => (
                    <tr key={vendor._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {vendor.logo ? (
                            <img
                              src={vendor.logo}
                              alt={vendor.storeName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <Store className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{vendor.storeName}</div>
                            <div className="text-sm text-gray-500">{vendor.businessEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {vendor.user ? (
                          <div>
                            <div className="text-sm">
                              {vendor.user.firstName} {vendor.user.lastName}
                            </div>
                            <div className="text-xs text-gray-500">{vendor.user.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{vendor.stats?.totalProducts || 0}</span>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(vendor.status)}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{vendor.commissionRate || 10}%</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(vendor)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {vendor.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenStatusDialog(vendor, 'active')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          {vendor.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenStatusDialog(vendor, 'suspended')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          )}
                          {vendor.status === 'suspended' && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenStatusDialog(vendor, 'active')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                disabled={page === pagination.pages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
          </DialogHeader>
          {selectedVendor && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {selectedVendor.logo ? (
                  <img
                    src={selectedVendor.logo}
                    alt={selectedVendor.storeName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <Store className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold">{selectedVendor.storeName}</h3>
                  <p className="text-gray-500">{selectedVendor.businessEmail}</p>
                </div>
                {getStatusBadge(selectedVendor.status)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Description</Label>
                  <p className="text-sm">{selectedVendor.description || 'No description'}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Phone</Label>
                  <p className="text-sm">{selectedVendor.businessPhone || 'N/A'}</p>
                </div>
              </div>

              {selectedVendor.user && (
                <div>
                  <Label className="text-gray-500">Owner</Label>
                  <p className="text-sm">
                    {selectedVendor.user.firstName} {selectedVendor.user.lastName} ({selectedVendor.user.email})
                  </p>
                </div>
              )}

              <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded-md">
                <div className="text-center">
                  <div className="text-2xl font-bold">{selectedVendor.stats?.totalProducts || 0}</div>
                  <div className="text-xs text-gray-500">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{selectedVendor.stats?.totalOrders || 0}</div>
                  <div className="text-xs text-gray-500">Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    ${(selectedVendor.stats?.totalRevenue || 0).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {selectedVendor.stats?.averageRating?.toFixed(1) || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">Rating</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Commission Rate</Label>
                  <p className="text-sm font-medium">{selectedVendor.commissionRate || 10}%</p>
                </div>
                <div>
                  <Label className="text-gray-500">Created</Label>
                  <p className="text-sm">
                    {new Date(selectedVendor.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {newStatus === 'active' && 'Approve Vendor'}
              {newStatus === 'suspended' && 'Suspend Vendor'}
              {newStatus === 'rejected' && 'Reject Vendor'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {newStatus === 'active' && `Are you sure you want to approve "${selectedVendor?.storeName}"?`}
              {newStatus === 'suspended' && `Are you sure you want to suspend "${selectedVendor?.storeName}"?`}
              {newStatus === 'rejected' && `Are you sure you want to reject "${selectedVendor?.storeName}"?`}
            </p>

            {(newStatus === 'suspended' || newStatus === 'rejected') && (
              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <textarea
                  id="reason"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Enter reason for this action..."
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={updating}
              className={newStatus === 'active' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {updating ? 'Updating...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default VendorManagement;
