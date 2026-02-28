import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { categoryService } from '../services/categoryService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Star,
  StarOff,
  RefreshCw,
  ChevronRight,
  FolderTree,
  Package,
  Eye,
  EyeOff,
  Tags,
  Layers,
  TrendingUp,
  X
} from 'lucide-react';

const CategoryManagement = () => {
  // State
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]); // For parent selection
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [parentFilter, setParentFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    icon: '',
    parent: '',
    sortOrder: 0,
    isActive: true,
    isFeatured: false,
    commissionRate: '',
    seo: {
      metaTitle: '',
      metaDescription: '',
    },
  });
  const [formLoading, setFormLoading] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    featured: 0,
    rootCategories: 0,
  });

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
      };

      if (statusFilter !== 'all') {
        params.isActive = statusFilter === 'active';
      }
      if (featuredFilter !== 'all') {
        params.isFeatured = featuredFilter === 'featured';
      }
      if (parentFilter === 'root') {
        params.parent = 'root';
      } else if (parentFilter !== 'all') {
        params.parent = parentFilter;
      }

      const response = await categoryService.getCategories(params);
      setCategories(response.categories || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 1,
      }));
    } catch (error) {
      toast.error('Failed to fetch categories');
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, statusFilter, featuredFilter, parentFilter]);

  // Fetch all categories for parent selection
  const fetchAllCategories = async () => {
    try {
      const response = await categoryService.getCategories({ limit: 100 });
      setAllCategories(response.categories || []);

      // Calculate stats
      const cats = response.categories || [];
      setStats({
        total: response.pagination?.total || cats.length,
        active: cats.filter(c => c.isActive).length,
        featured: cats.filter(c => c.isFeatured).length,
        rootCategories: cats.filter(c => !c.parent).length,
      });
    } catch (error) {
      console.error('Error fetching all categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchAllCategories();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      icon: '',
      parent: '',
      sortOrder: 0,
      isActive: true,
      isFeatured: false,
      commissionRate: '',
      seo: {
        metaTitle: '',
        metaDescription: '',
      },
    });
  };

  // Open create dialog
  const handleOpenCreate = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  // Open edit dialog
  const handleOpenEdit = async (category) => {
    try {
      const response = await categoryService.getCategoryById(category._id);
      const cat = response.category || response;

      setFormData({
        name: cat.name || '',
        description: cat.description || '',
        image: cat.image || '',
        icon: cat.icon || '',
        parent: cat.parent?._id || cat.parent || '',
        sortOrder: cat.sortOrder || 0,
        isActive: cat.isActive !== false,
        isFeatured: cat.isFeatured || false,
        commissionRate: cat.commissionRate || '',
        seo: {
          metaTitle: cat.seo?.metaTitle || '',
          metaDescription: cat.seo?.metaDescription || '',
        },
      });
      setSelectedCategory(cat);
      setEditDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load category details');
      console.error('Error loading category:', error);
    }
  };

  // Open delete dialog
  const handleOpenDelete = (category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  // Create category
  const handleCreate = async () => {
    try {
      setFormLoading(true);

      const data = {
        ...formData,
        parent: formData.parent || null,
        commissionRate: formData.commissionRate ? parseFloat(formData.commissionRate) : undefined,
      };

      await categoryService.createCategory(data);
      toast.success('Category created successfully');
      setCreateDialogOpen(false);
      resetForm();
      fetchCategories();
      fetchAllCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category');
      console.error('Error creating category:', error);
    } finally {
      setFormLoading(false);
    }
  };

  // Update category
  const handleUpdate = async () => {
    try {
      setFormLoading(true);

      const data = {
        ...formData,
        parent: formData.parent || null,
        commissionRate: formData.commissionRate ? parseFloat(formData.commissionRate) : undefined,
      };

      await categoryService.updateCategory(selectedCategory._id, data);
      toast.success('Category updated successfully');
      setEditDialogOpen(false);
      setSelectedCategory(null);
      resetForm();
      fetchCategories();
      fetchAllCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update category');
      console.error('Error updating category:', error);
    } finally {
      setFormLoading(false);
    }
  };

  // Delete category
  const handleDelete = async () => {
    try {
      setFormLoading(true);
      await categoryService.deleteCategory(selectedCategory._id);
      toast.success('Category deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
      fetchCategories();
      fetchAllCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
      console.error('Error deleting category:', error);
    } finally {
      setFormLoading(false);
    }
  };

  // Toggle featured
  const handleToggleFeatured = async (category) => {
    try {
      await categoryService.updateCategory(category._id, {
        isFeatured: !category.isFeatured,
      });
      toast.success(`Category ${!category.isFeatured ? 'marked as featured' : 'removed from featured'}`);
      fetchCategories();
      fetchAllCategories();
    } catch (error) {
      toast.error('Failed to update featured status');
      console.error('Error toggling featured:', error);
    }
  };

  // Toggle active status
  const handleToggleActive = async (category) => {
    try {
      await categoryService.updateCategory(category._id, {
        isActive: !category.isActive,
      });
      toast.success(`Category ${!category.isActive ? 'activated' : 'deactivated'}`);
      fetchCategories();
      fetchAllCategories();
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Error toggling status:', error);
    }
  };

  // Get category path
  const getCategoryPath = (category) => {
    if (!category.parent) {
      return category.name;
    }
    const parentName = category.parent?.name || 'Unknown';
    return `${parentName} > ${category.name}`;
  };

  // Get indent level for hierarchy display
  const getIndentClass = (level) => {
    const indents = {
      0: '',
      1: 'pl-4',
      2: 'pl-8',
      3: 'pl-12',
    };
    return indents[level] || 'pl-16';
  };

  // Render form fields
  const renderFormFields = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Name *</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Category name"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea
          className="w-full min-h-[80px] px-3 py-2 border rounded-md text-sm"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Category description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Parent Category</label>
          <Select
            value={formData.parent || 'none'}
            onValueChange={(value) => setFormData({ ...formData, parent: value === 'none' ? '' : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select parent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (Root Category)</SelectItem>
              {allCategories
                .filter(c => c._id !== selectedCategory?._id)
                .map(cat => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.level > 0 ? '— '.repeat(cat.level) : ''}{cat.name}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Sort Order</label>
          <Input
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Image URL</label>
          <Input
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="text-sm font-medium">Icon</label>
          <Input
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            placeholder="Icon name or URL"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Commission Rate (%)</label>
        <Input
          type="number"
          step="0.1"
          value={formData.commissionRate}
          onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
          placeholder="Override platform commission"
        />
      </div>

      <div className="flex items-center space-x-6">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Active</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.isFeatured}
            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">Featured</span>
        </label>
      </div>

      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-medium mb-3">SEO Settings</h4>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-500">Meta Title</label>
            <Input
              value={formData.seo.metaTitle}
              onChange={(e) => setFormData({
                ...formData,
                seo: { ...formData.seo, metaTitle: e.target.value }
              })}
              placeholder="SEO title"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">Meta Description</label>
            <textarea
              className="w-full min-h-[60px] px-3 py-2 border rounded-md text-sm"
              value={formData.seo.metaDescription}
              onChange={(e) => setFormData({
                ...formData,
                seo: { ...formData.seo, metaDescription: e.target.value }
              })}
              placeholder="SEO description"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage marketplace categories and hierarchy
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Categories</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Tags className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Featured</p>
                <p className="text-2xl font-bold">{stats.featured}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Root Categories</p>
                <p className="text-2xl font-bold">{stats.rootCategories}</p>
              </div>
              <FolderTree className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="not_featured">Not Featured</SelectItem>
              </SelectContent>
            </Select>

            <Select value={parentFilter} onValueChange={setParentFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Parent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="root">Root Only</SelectItem>
                {allCategories.filter(c => !c.parent).map(cat => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={fetchCategories}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead className="text-center">Products</TableHead>
                <TableHead className="text-center">Order</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">Loading categories...</p>
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Tags className="w-8 h-8 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">No categories found</p>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell>
                      <div className={`flex items-center space-x-3 ${getIndentClass(category.level)}`}>
                        {category.level > 0 && (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-xs text-gray-500">{category.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {category.parent ? (
                        <span className="text-sm text-gray-600">
                          {category.parent.name}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span>{category.productCount || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {category.sortOrder}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={category.isActive ? 'default' : 'secondary'}
                        className={category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                      >
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {category.isFeatured && (
                        <Star className="w-4 h-4 text-yellow-500 mx-auto fill-current" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(category)}
                          title={category.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {category.isActive ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFeatured(category)}
                          title={category.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                        >
                          {category.isFeatured ? (
                            <StarOff className="w-4 h-4" />
                          ) : (
                            <Star className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(category)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDelete(category)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} categories
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

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
            <DialogDescription>
              Add a new category to the marketplace
            </DialogDescription>
          </DialogHeader>

          {renderFormFields()}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={formLoading || !formData.name}>
              {formLoading ? 'Creating...' : 'Create Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update category details
            </DialogDescription>
          </DialogHeader>

          {renderFormFields()}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={formLoading || !formData.name}>
              {formLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedCategory?.name}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-600">
              Note: Categories with subcategories or products cannot be deleted.
              You must first move or delete all child items.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={formLoading}
            >
              {formLoading ? 'Deleting...' : 'Delete Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryManagement;
