import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
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
  DialogDescription,
} from '../components/ui/dialog';
import { toast } from 'sonner';
import {
  QrCode,
  Search,
  Plus,
  Eye,
  Trash2,
  Ban,
  BarChart3,
  Link,
  Zap,
  Copy,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Download,
} from 'lucide-react';
import { qrCodeService } from '../services/qrCodeService';

export default function QRCodeManagement() {
  const [qrCodes, setQRCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [actionTypes, setActionTypes] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionTypeFilter, setActionTypeFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedQR, setSelectedQR] = useState(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    maxScans: '',
    status: 'active',
  });

  // Create form state
  const [createForm, setCreateForm] = useState({
    actionType: 'redirect',
    name: '',
    description: '',
    payload: { url: '' },
    expiresIn: '7d',
    maxScans: '',
    oneTimeUse: false,
  });

  useEffect(() => {
    fetchData();
    fetchActionTypes();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    fetchData();
  }, [pagination.page, statusFilter, actionTypeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(actionTypeFilter !== 'all' && { actionType: actionTypeFilter }),
        ...(search && { search }),
      };
      const response = await qrCodeService.getAllQRCodes(params);
      setQRCodes(response.qrCodes || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 1,
      }));
    } catch (error) {
      console.error('Failed to fetch QR codes:', error);
      toast.error('Failed to load QR codes');
    } finally {
      setLoading(false);
    }
  };

  const fetchActionTypes = async () => {
    try {
      const response = await qrCodeService.getActionTypes();
      setActionTypes(response.actionTypes || []);
    } catch (error) {
      console.error('Failed to fetch action types:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await qrCodeService.getAnalytics();
      setAnalytics(response);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchData();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const data = {
        actionType: createForm.actionType,
        name: createForm.name,
        description: createForm.description,
        payload: createForm.actionType === 'redirect'
          ? { url: createForm.payload.url }
          : createForm.payload,
        expiresIn: createForm.expiresIn,
        ...(createForm.maxScans && { maxScans: parseInt(createForm.maxScans) }),
        oneTimeUse: createForm.oneTimeUse,
        createdByType: 'admin',
      };

      const result = await qrCodeService.createQRCode(data);
      toast.success('QR code created successfully!');
      setCreateDialogOpen(false);
      setSelectedQR(result);
      setViewDialogOpen(true);
      fetchData();
      fetchAnalytics();

      // Reset form
      setCreateForm({
        actionType: 'redirect',
        name: '',
        description: '',
        payload: { url: '' },
        expiresIn: '7d',
        maxScans: '',
        oneTimeUse: false,
      });
    } catch (error) {
      console.error('Failed to create QR code:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to create QR code');
    }
  };

  const handleRevoke = async (id) => {
    if (!confirm('Are you sure you want to revoke this QR code?')) return;

    try {
      await qrCodeService.revokeQRCode(id);
      toast.success('QR code revoked');
      fetchData();
      fetchAnalytics();
    } catch (error) {
      toast.error('Failed to revoke QR code');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this QR code? This action cannot be undone.')) return;

    try {
      await qrCodeService.deleteQRCode(id);
      toast.success('QR code deleted');
      fetchData();
      fetchAnalytics();
    } catch (error) {
      toast.error('Failed to delete QR code');
    }
  };

  const handleView = async (qr) => {
    try {
      // Fetch both stats and image in parallel
      const [stats, imageData] = await Promise.all([
        qrCodeService.getQRCodeStats(qr._id).catch(() => ({})),
        qrCodeService.getQRCodeImage(qr._id).catch(() => ({})),
      ]);
      setSelectedQR({ ...qr, ...stats, ...imageData });
      setViewDialogOpen(true);
    } catch (error) {
      setSelectedQR(qr);
      setViewDialogOpen(true);
    }
  };

  const handleEdit = (qr) => {
    setSelectedQR(qr);
    setEditForm({
      name: qr.name || '',
      description: qr.description || '',
      maxScans: qr.maxScans?.toString() || '',
      status: qr.status || 'active',
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const data = {
        name: editForm.name,
        description: editForm.description,
        status: editForm.status,
        ...(editForm.maxScans && { maxScans: parseInt(editForm.maxScans) }),
      };

      await qrCodeService.updateQRCode(selectedQR._id, data);
      toast.success('QR code updated successfully!');
      setEditDialogOpen(false);
      fetchData();
      fetchAnalytics();
    } catch (error) {
      console.error('Failed to update QR code:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to update QR code');
    }
  };

  const handleDownload = () => {
    if (!selectedQR?.qrImage) return;

    const link = document.createElement('a');
    link.href = selectedQR.qrImage;
    link.download = `qr-${selectedQR.qrCode?.code || selectedQR.code || 'code'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'default',
      expired: 'secondary',
      revoked: 'destructive',
      limit_reached: 'outline',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'redirect':
        return <Link className="h-4 w-4" />;
      case 'api_trigger':
        return <Zap className="h-4 w-4" />;
      default:
        return <QrCode className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">QR Code Management</h1>
          <p className="text-muted-foreground">Create and manage QR codes</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create QR Code
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total QR Codes</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.overview?.totalQRCodes || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
            <QrCode className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.overview?.activeQRCodes || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.overview?.totalScans || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scans (24h)</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.overview?.scansLast24h || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
                <SelectItem value="limit_reached">Limit Reached</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="redirect">Redirect</SelectItem>
                <SelectItem value="api_trigger">API Trigger</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* QR Codes Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : qrCodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No QR codes found
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Scans</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qrCodes.map((qr) => (
                    <TableRow key={qr._id}>
                      <TableCell className="font-mono">{qr.code}</TableCell>
                      <TableCell>{qr.name || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(qr.actionType)}
                          {qr.actionType}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(qr.status)}</TableCell>
                      <TableCell>{qr.scanCount}</TableCell>
                      <TableCell>
                        {new Date(qr.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(qr)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(qr)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {qr.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevoke(qr._id)}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(qr._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {qrCodes.length} of {pagination.total} QR codes
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                    disabled={pagination.page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="flex items-center px-2 text-sm">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                    disabled={pagination.page >= pagination.pages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create QR Code</DialogTitle>
            <DialogDescription>
              Create a new QR code with custom actions
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm(f => ({ ...f, name: e.target.value }))}
                placeholder="My QR Code"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={createForm.description}
                onChange={(e) => setCreateForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Action Type</label>
              <Select
                value={createForm.actionType}
                onValueChange={(v) => setCreateForm(f => ({
                  ...f,
                  actionType: v,
                  payload: v === 'redirect' ? { url: '' } : { endpoint: '', method: 'POST', data: {} }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="redirect">Redirect URL</SelectItem>
                  <SelectItem value="api_trigger">API Trigger</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {createForm.actionType === 'redirect' && (
              <div>
                <label className="text-sm font-medium">URL</label>
                <Input
                  value={createForm.payload.url || ''}
                  onChange={(e) => setCreateForm(f => ({
                    ...f,
                    payload: { ...f.payload, url: e.target.value }
                  }))}
                  placeholder="https://example.com"
                  required
                />
              </div>
            )}

            {createForm.actionType === 'api_trigger' && (
              <>
                <div>
                  <label className="text-sm font-medium">Endpoint</label>
                  <Input
                    value={createForm.payload.endpoint || ''}
                    onChange={(e) => setCreateForm(f => ({
                      ...f,
                      payload: { ...f.payload, endpoint: e.target.value }
                    }))}
                    placeholder="/api/v1/qr-code/webhook-test"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    <strong>Test endpoint:</strong> Use <code className="bg-muted px-1 rounded">/api/v1/qr-code/webhook-test</code> to test API triggers.
                    The backend will make the HTTP request to this URL when scanned.
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Method</label>
                  <Select
                    value={createForm.payload.method || 'POST'}
                    onValueChange={(v) => setCreateForm(f => ({
                      ...f,
                      payload: { ...f.payload, method: v }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium">Expires In</label>
              <Select
                value={createForm.expiresIn}
                onValueChange={(v) => setCreateForm(f => ({ ...f, expiresIn: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="365d">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Max Scans (optional)</label>
              <Input
                type="number"
                value={createForm.maxScans}
                onChange={(e) => setCreateForm(f => ({ ...f, maxScans: e.target.value }))}
                placeholder="Unlimited"
                min="1"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="oneTimeUse"
                checked={createForm.oneTimeUse}
                onChange={(e) => setCreateForm(f => ({ ...f, oneTimeUse: e.target.checked }))}
              />
              <label htmlFor="oneTimeUse" className="text-sm">One-time use</label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>QR Code Details</DialogTitle>
          </DialogHeader>
          {selectedQR && (
            <div className="space-y-4">
              {/* QR Image */}
              {selectedQR.qrImage && (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={selectedQR.qrImage}
                    alt="QR Code"
                    className="w-48 h-48 border rounded"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}

              {/* Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium">Code</label>
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded">{selectedQR.qrCode?.code || selectedQR.code}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(selectedQR.qrCode?.code || selectedQR.code)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="font-medium">Status</label>
                  <div>{getStatusBadge(selectedQR.qrCode?.status || selectedQR.status)}</div>
                </div>
                <div>
                  <label className="font-medium">Name</label>
                  <div>{selectedQR.qrCode?.name || selectedQR.name || '-'}</div>
                </div>
                <div>
                  <label className="font-medium">Action Type</label>
                  <div className="flex items-center gap-2">
                    {getActionIcon(selectedQR.qrCode?.actionType || selectedQR.actionType)}
                    {selectedQR.qrCode?.actionType || selectedQR.actionType}
                  </div>
                </div>
                <div>
                  <label className="font-medium">Total Scans</label>
                  <div>{selectedQR.stats?.totalScans || selectedQR.scanCount || 0}</div>
                </div>
                <div>
                  <label className="font-medium">Unique Users</label>
                  <div>{selectedQR.stats?.uniqueUsers || 0}</div>
                </div>
              </div>

              {/* URL */}
              {selectedQR.url && (
                <div>
                  <label className="font-medium text-sm">Scan URL</label>
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded text-xs flex-1 overflow-hidden text-ellipsis">
                      {selectedQR.url}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(selectedQR.url)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit QR Code</DialogTitle>
            <DialogDescription>
              Update QR code details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                placeholder="QR Code name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={editForm.description}
                onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={editForm.status}
                onValueChange={(v) => setEditForm(f => ({ ...f, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Max Scans</label>
              <Input
                type="number"
                value={editForm.maxScans}
                onChange={(e) => setEditForm(f => ({ ...f, maxScans: e.target.value }))}
                placeholder="Unlimited"
                min="1"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
