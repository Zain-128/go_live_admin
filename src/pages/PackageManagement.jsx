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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { PackageFormDialog } from '../components/subscription/PackageFormDialog';
import { StripeProductDialog } from '../components/subscription/StripeProductDialog';
import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  formatPrice,
  getPackageTypeLabel,
  getIntervalText,
  getTierBadgeVariant,
  getTierLabel,
  getActiveStatusLabel,
  getActiveBadgeVariant,
  getSubscriptionTypeOptions,
  getTierOptions,
} from '../lib/subscriptionUtils';

const PackageManagement = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Dialogs
  const [packageFormOpen, setPackageFormOpen] = useState(false);
  const [stripeProductOpen, setStripeProductOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);

  const fetchPackages = async (page = 1) => {
    try {
      setLoading(true);
      const response = await subscriptionService.getAllPackages({
        page,
        limit: pagination.limit,
        search: searchTerm,
        type: selectedType && selectedType !== 'all' ? selectedType : undefined,
        tier: selectedTier && selectedTier !== 'all' ? selectedTier : undefined,
        isActive: selectedStatus && selectedStatus !== 'all' ? selectedStatus === 'active' : undefined,
      });

      setPackages(response.packages);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch packages:', error);
      toast.error('Failed to fetch packages', {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // Auto-fetch when filters change
  useEffect(() => {
    fetchPackages(1);
  }, [selectedType, selectedTier, selectedStatus]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPackages(1);
  };

  const handlePageChange = (newPage) => {
    fetchPackages(newPage);
  };

  const handleCreatePackage = () => {
    setEditingPackage(null);
    setPackageFormOpen(true);
  };

  const handleEditPackage = (pkg) => {
    setEditingPackage(pkg);
    setPackageFormOpen(true);
  };

  const handleDeleteClick = (pkg) => {
    setPackageToDelete(pkg);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!packageToDelete) return;

    try {
      await subscriptionService.deletePackage(packageToDelete._id);
      toast.success('Package deleted successfully');
      fetchPackages(pagination.page);
      setDeleteDialogOpen(false);
      setPackageToDelete(null);
    } catch (error) {
      console.error('Failed to delete package:', error);
      toast.error('Failed to delete package', {
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const handleStripeProductSuccess = (productData) => {
    toast.success('Now create the package in database', {
      description: 'Stripe product created. Fill in the remaining details.',
    });

    // Pre-fill the package form with Stripe data
    setEditingPackage({
      name: productData.name,
      type: productData.type,
      interval: productData.interval,
      intervalCount: productData.intervalCount,
      stripeProductId: productData.stripeProductId,
      stripePriceId: productData.stripePriceId,
    });
    setPackageFormOpen(true);
  };

  const handlePackageSuccess = () => {
    fetchPackages(pagination.page);
    setEditingPackage(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Package Management</h2>
        <p className="text-muted-foreground">Manage subscription packages and pricing</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search packages..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStripeProductOpen(true)}>
            <Zap className="mr-2 h-4 w-4" />
            Create in Stripe
          </Button>
          <Button onClick={handleCreatePackage}>
            <Plus className="mr-2 h-4 w-4" />
            New Package
          </Button>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            <div>
              <label className="text-sm font-medium mb-2 block">Tier</label>
              <Select
                value={selectedTier}
                onValueChange={setSelectedTier}
                placeholder="Select..."
              >
                  <SelectItem value="all">All tiers</SelectItem>
                  {getTierOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
                placeholder="Select..."
              >
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('');
                  setSelectedTier('');
                  setSelectedStatus('');
                  fetchPackages(1);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Packages Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Packages ({pagination.total})
          </CardTitle>
          <CardDescription>
            Manage your subscription packages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading packages...</div>
          ) : packages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No packages found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Subscribers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map((pkg) => (
                    <TableRow key={pkg._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{pkg.name}</div>
                          <div className="text-sm text-muted-foreground">{pkg.slug}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getPackageTypeLabel(pkg.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatPrice(pkg.price?.amount || 0, pkg.price?.currency)}
                          </div>
                          {pkg.type === 'recurring' && (
                            <div className="text-xs text-muted-foreground">
                              {getIntervalText(pkg.interval, pkg.intervalCount)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTierBadgeVariant(pkg.tier)}>
                          {getTierLabel(pkg.tier)}
                        </Badge>
                      </TableCell>
                      <TableCell>{pkg.subscriberCount || 0}</TableCell>
                      <TableCell>
                        <Badge variant={getActiveBadgeVariant(pkg.isActive)}>
                          {getActiveStatusLabel(pkg.isActive)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditPackage(pkg)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(pkg)}
                            disabled={pkg.subscriberCount > 0}
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
      <PackageFormDialog
        open={packageFormOpen}
        onOpenChange={setPackageFormOpen}
        packageData={editingPackage}
        onSuccess={handlePackageSuccess}
      />

      <StripeProductDialog
        open={stripeProductOpen}
        onOpenChange={setStripeProductOpen}
        onSuccess={handleStripeProductSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Package?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{packageToDelete?.name}"? This action cannot be undone.
              {packageToDelete?.subscriberCount > 0 && (
                <span className="block mt-2 text-destructive">
                  This package has active subscribers and cannot be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={packageToDelete?.subscriberCount > 0}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PackageManagement;
