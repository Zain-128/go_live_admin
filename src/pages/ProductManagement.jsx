import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
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
import {
  Package,
  Search,
  Eye,
  Check,
  X,
  Star,
  AlertTriangle,
  TrendingUp,
  DollarSign,
} from 'lucide-react';

export function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [page, setPage] = useState(1);

  // Filter options
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);

  // Dialogs
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [vendorUser, setVendorUser] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await productService.getStats();
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [vendorsData, categoriesData] = await Promise.all([
        productService.getVendors(),
        productService.getCategories(),
      ]);
      setVendors(vendorsData.vendors || []);
      setCategories(categoriesData.categories || []);
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
      };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (vendorFilter) params.vendorId = vendorFilter;

      const data = await productService.getProducts(params);
      setProducts(data.products || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, statusFilter, vendorFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleViewDetails = async (product) => {
    try {
      const data = await productService.getProductById(product._id);
      setSelectedProduct(data.product);
      setVendorUser(data.vendorUser);
      setDetailOpen(true);
    } catch (err) {
      alert('Failed to load product details');
    }
  };

  const handleOpenStatusDialog = (product, status) => {
    setSelectedProduct(product);
    setNewStatus(status);
    setStatusReason('');
    setStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedProduct) return;

    setUpdating(true);
    try {
      await productService.updateStatus(selectedProduct._id, {
        status: newStatus,
        reason: statusReason || undefined,
      });
      setStatusDialogOpen(false);
      fetchProducts();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleFeatured = async (product) => {
    try {
      await productService.toggleFeatured(product._id);
      fetchProducts();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to toggle featured');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      archived: 'bg-orange-100 text-orange-800',
    };
    const labels = {
      active: 'Active',
      draft: 'Draft',
      pending: 'Pending',
      rejected: 'Rejected',
      archived: 'Archived',
    };
    return (
      <Badge className={`${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </Badge>
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price || 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Product Management</h1>
        <p className="text-gray-500">Manage marketplace products</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Products</CardTitle>
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
              <div className="text-2xl font-bold text-green-600">{stats.byStatus?.active || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.byStatus?.pending || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Low Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.inventory?.lowStock || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Additional Stats Row */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Avg Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPrice(stats.pricing?.avgPrice)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Total Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPrice(stats.pricing?.totalValue)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Star className="w-4 h-4" /> Featured
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.featured || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Out of Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.inventory?.outOfStock || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or SKU..."
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
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>
            <select
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={vendorFilter}
              onChange={(e) => {
                setVendorFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Vendors</option>
              {vendors.map((vendor) => (
                <option key={vendor._id} value={vendor._id}>
                  {vendor.storeName}
                </option>
              ))}
            </select>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Products Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No products found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Vendor</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.images && product.images[0] ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {product.name}
                              {product.isFeatured && (
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.categoryId?.name || 'Uncategorized'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">{product.vendorId?.storeName || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{product.vendorId?.businessEmail}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{formatPrice(product.price)}</div>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <div className="text-xs text-gray-500 line-through">
                            {formatPrice(product.compareAtPrice)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-sm ${
                            product.inventory?.quantity === 0
                              ? 'text-red-600 font-medium'
                              : product.inventory?.quantity <= (product.inventory?.lowStockThreshold || 10)
                              ? 'text-orange-600'
                              : ''
                          }`}
                        >
                          {product.inventory?.quantity ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(product.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(product)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleFeatured(product)}
                            className={product.isFeatured ? 'text-yellow-600' : ''}
                          >
                            <Star className="w-4 h-4" />
                          </Button>
                          {product.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleOpenStatusDialog(product, 'active')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenStatusDialog(product, 'rejected')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {product.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenStatusDialog(product, 'archived')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                          {(product.status === 'archived' || product.status === 'rejected') && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenStatusDialog(product, 'active')}
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              {/* Product Header */}
              <div className="flex items-start gap-4">
                {selectedProduct.images && selectedProduct.images[0] ? (
                  <img
                    src={selectedProduct.images[0].url}
                    alt={selectedProduct.name}
                    className="w-24 h-24 rounded object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    {selectedProduct.name}
                    {selectedProduct.isFeatured && (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </h3>
                  <p className="text-gray-500">{selectedProduct.sku || 'No SKU'}</p>
                  <div className="flex gap-2 mt-2">
                    {getStatusBadge(selectedProduct.status)}
                    {selectedProduct.categoryId && (
                      <Badge variant="outline">{selectedProduct.categoryId.name}</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-gray-500">Description</Label>
                <p className="text-sm mt-1">
                  {selectedProduct.description || 'No description'}
                </p>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-500">Price</Label>
                  <p className="text-lg font-bold">{formatPrice(selectedProduct.price)}</p>
                </div>
                {selectedProduct.compareAtPrice && (
                  <div>
                    <Label className="text-gray-500">Compare At</Label>
                    <p className="text-lg line-through text-gray-400">
                      {formatPrice(selectedProduct.compareAtPrice)}
                    </p>
                  </div>
                )}
                {selectedProduct.costPrice && (
                  <div>
                    <Label className="text-gray-500">Cost</Label>
                    <p className="text-lg">{formatPrice(selectedProduct.costPrice)}</p>
                  </div>
                )}
              </div>

              {/* Inventory */}
              <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-md">
                <div>
                  <Label className="text-gray-500">Quantity</Label>
                  <p
                    className={`text-lg font-bold ${
                      selectedProduct.inventory?.quantity === 0
                        ? 'text-red-600'
                        : selectedProduct.inventory?.quantity <=
                          (selectedProduct.inventory?.lowStockThreshold || 10)
                        ? 'text-orange-600'
                        : ''
                    }`}
                  >
                    {selectedProduct.inventory?.quantity ?? 0}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Low Stock Alert</Label>
                  <p className="text-lg">{selectedProduct.inventory?.lowStockThreshold ?? 10}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Track Inventory</Label>
                  <p className="text-lg">
                    {selectedProduct.inventory?.trackInventory ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-2xl font-bold">{selectedProduct.viewCount || 0}</div>
                  <div className="text-xs text-gray-500">Views</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-2xl font-bold">{selectedProduct.salesCount || 0}</div>
                  <div className="text-xs text-gray-500">Sales</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-2xl font-bold">
                    {selectedProduct.reviews?.averageRating?.toFixed(1) || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">Rating</div>
                </div>
              </div>

              {/* Vendor Info */}
              {selectedProduct.vendorId && (
                <div className="border-t pt-4">
                  <Label className="text-gray-500">Vendor</Label>
                  <div className="flex items-center gap-3 mt-2">
                    {selectedProduct.vendorId.logo ? (
                      <img
                        src={selectedProduct.vendorId.logo}
                        alt={selectedProduct.vendorId.storeName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{selectedProduct.vendorId.storeName}</div>
                      <div className="text-sm text-gray-500">
                        {selectedProduct.vendorId.businessEmail}
                      </div>
                      {vendorUser && (
                        <div className="text-xs text-gray-400">
                          Owner: {vendorUser.firstName} {vendorUser.lastName} ({vendorUser.email})
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                <div>
                  <Label className="text-gray-500">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedProduct.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Images Gallery */}
              {selectedProduct.images && selectedProduct.images.length > 1 && (
                <div>
                  <Label className="text-gray-500">All Images</Label>
                  <div className="flex gap-2 mt-2 overflow-x-auto">
                    {selectedProduct.images.map((image, index) => (
                      <img
                        key={index}
                        src={image.url}
                        alt={image.alt || `Image ${index + 1}`}
                        className="w-20 h-20 rounded object-cover flex-shrink-0"
                      />
                    ))}
                  </div>
                </div>
              )}
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
              {newStatus === 'active' && 'Activate Product'}
              {newStatus === 'archived' && 'Archive Product'}
              {newStatus === 'rejected' && 'Reject Product'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {newStatus === 'active' &&
                `Are you sure you want to activate "${selectedProduct?.name}"?`}
              {newStatus === 'archived' &&
                `Are you sure you want to archive "${selectedProduct?.name}"?`}
              {newStatus === 'rejected' &&
                `Are you sure you want to reject "${selectedProduct?.name}"?`}
            </p>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <textarea
                id="reason"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Enter reason for this action..."
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={updating}
              className={
                newStatus === 'active'
                  ? 'bg-green-600 hover:bg-green-700'
                  : newStatus === 'rejected'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-orange-600 hover:bg-orange-700'
              }
            >
              {updating ? 'Updating...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProductManagement;
