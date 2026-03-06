import React, { useState, useEffect } from 'react';
import { cashoutRequestService } from '../services/cashoutRequestService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Wallet, User, Check, X, Filter } from 'lucide-react';
import { toast } from 'sonner';

const CashOutRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [actionDialog, setActionDialog] = useState({ open: false, type: null, request: null });
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async (page = 1, status = '') => {
    try {
      setLoading(true);
      const result = await cashoutRequestService.getCashoutRequests({
        page,
        limit: 10,
        status: status || undefined,
      });
      setRequests(result.requests || []);
      setPagination(result.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (error) {
      console.error('Failed to fetch cash out requests:', error);
      toast.error('Failed to fetch cash out requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    fetchRequests(1, status);
  };

  const handlePageChange = (newPage) => {
    fetchRequests(newPage, statusFilter);
  };

  const openApprove = (request) => {
    setActionDialog({ open: true, type: 'approve', request });
    setAdminNotes('');
  };

  const openReject = (request) => {
    setActionDialog({ open: true, type: 'reject', request });
    setAdminNotes('');
  };

  const closeDialog = () => {
    setActionDialog({ open: false, type: null, request: null });
    setAdminNotes('');
  };

  const handleConfirm = async () => {
    const { type, request } = actionDialog;
    if (!request?._id) return;
    try {
      setSubmitting(true);
      if (type === 'approve') {
        await cashoutRequestService.approveRequest(request._id, adminNotes || undefined);
        toast.success('Request approved. User PayPal email has been updated.');
      } else {
        await cashoutRequestService.rejectRequest(request._id, adminNotes || undefined);
        toast.success('Request rejected.');
      }
      closeDialog();
      fetchRequests(pagination.page, statusFilter);
    } catch (error) {
      console.error('Action failed:', error);
      toast.error(error.response?.data?.message || error.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cash out management</h1>
        <p className="text-gray-600 mt-1">
          PayPal email change requests from users. Approve to update their cash-out email; reject to deny.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>PayPal email change requests</CardTitle>
          <CardDescription>These requests show up when users request a change of their cash-out (PayPal) email from the app.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            {['', 'pending', 'approved', 'rejected'].map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter(s)}
              >
                {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Current PayPal</TableHead>
                  <TableHead>New PayPal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No cash out requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((req) => (
                    <TableRow key={req._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {req.user?.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {req.user?.email || '-'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {req.currentPaypalEmail || '—'}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-gray-900">
                        {req.newPaypalEmail || '—'}
                      </TableCell>
                      <TableCell>{getStatusBadge(req.status)}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(req.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {req.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => openApprove(req)}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openReject(req)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} requests
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={actionDialog.open} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'approve' ? 'Approve request' : 'Reject request'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.type === 'approve'
                ? "The user's PayPal email will be updated to the requested new email."
                : "The request will be marked as rejected. The user's current PayPal email will not change."}
            </DialogDescription>
          </DialogHeader>
          {actionDialog.request && (
            <div className="space-y-2 py-2">
              <p className="text-sm">
                <span className="font-medium">User:</span> {actionDialog.request.user?.name} ({actionDialog.request.user?.email})
              </p>
              <p className="text-sm">
                <span className="font-medium">New PayPal:</span> {actionDialog.request.newPaypalEmail}
              </p>
              <div>
                <label className="text-sm font-medium text-gray-700">Admin notes (optional)</label>
                <textarea
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  rows={2}
                  placeholder="Optional note for records"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant={actionDialog.type === 'approve' ? 'default' : 'destructive'}
              onClick={handleConfirm}
              disabled={submitting}
            >
              {submitting ? 'Processing...' : actionDialog.type === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CashOutRequests;
