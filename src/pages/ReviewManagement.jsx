import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Star,
  Search,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Flag,
  Clock,
  MessageSquare,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
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
import reviewService from '../services/reviewService';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    flagged: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0,
    totalReviews: 0,
  });

  // Dialogs
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReviews, setSelectedReviews] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchReviews();
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [statusFilter, ratingFilter, pagination.current]);

  const fetchStats = async () => {
    try {
      const data = await reviewService.getStats();
      setStats(data);
    } catch (error) {
      toast.error('Failed to fetch review statistics');
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: 10,
      };

      if (statusFilter !== 'all') params.status = statusFilter;
      if (ratingFilter !== 'all') params.rating = ratingFilter;
      if (search) params.search = search;

      const data = await reviewService.getReviews(params);
      setReviews(data.reviews || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchReviews();
  };

  const handleViewReview = async (review) => {
    try {
      const data = await reviewService.getReviewById(review._id);
      setSelectedReview(data.review);
      setViewDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load review details');
    }
  };

  const handleOpenStatusDialog = (review, status) => {
    setSelectedReview(review);
    setNewStatus(status);
    setStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    try {
      await reviewService.updateStatus(selectedReview._id, { status: newStatus });
      toast.success(`Review ${newStatus}`);
      setStatusDialogOpen(false);
      fetchStats();
      fetchReviews();
    } catch (error) {
      toast.error('Failed to update review status');
    }
  };

  const handleOpenDeleteDialog = (review) => {
    setSelectedReview(review);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await reviewService.deleteReview(selectedReview._id);
      toast.success('Review deleted');
      setDeleteDialogOpen(false);
      fetchStats();
      fetchReviews();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const handleBulkAction = async (status) => {
    if (selectedReviews.length === 0) {
      toast.error('No reviews selected');
      return;
    }

    try {
      await reviewService.bulkUpdateStatus(selectedReviews, status);
      toast.success(`${selectedReviews.length} reviews ${status}`);
      setSelectedReviews([]);
      fetchStats();
      fetchReviews();
    } catch (error) {
      toast.error('Failed to update reviews');
    }
  };

  const toggleSelectReview = (reviewId) => {
    setSelectedReviews(prev =>
      prev.includes(reviewId)
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedReviews.length === reviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(reviews.map(r => r._id));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case 'flagged':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200"><Flag className="w-3 h-3 mr-1" /> Flagged</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
        <p className="text-gray-600">Moderate product reviews and ratings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Reviews</div>
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
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-500">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-500">Rejected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.flagged}</div>
            <div className="text-sm text-gray-500">Flagged</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-1">
              <span className="text-2xl font-bold">{stats.averageRating}</span>
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
            <div className="text-sm text-gray-500">Avg Rating</div>
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
                  placeholder="Search reviews..."
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
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedReviews.length > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-500">{selectedReviews.length} selected</span>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('approved')}>
                <CheckCircle className="w-3 h-3 mr-1" /> Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('rejected')}>
                <XCircle className="w-3 h-3 mr-1" /> Reject
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('flagged')}>
                <Flag className="w-3 h-3 mr-1" /> Flag
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedReviews.length === reviews.length && reviews.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No reviews found
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review._id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedReviews.includes(review._id)}
                        onChange={() => toggleSelectReview(review._id)}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {review.productId?.images?.[0]?.url && (
                          <img
                            src={review.productId.images[0].url}
                            alt={review.productId.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <span className="text-sm font-medium truncate max-w-32">
                          {review.productId?.name || 'Unknown'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm">
                          {review.userId?.firstName} {review.userId?.lastName}
                        </span>
                        {review.isVerifiedPurchase && (
                          <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{renderStars(review.rating)}</TableCell>
                    <TableCell>
                      <div className="max-w-48">
                        {review.title && (
                          <div className="text-sm font-medium truncate">{review.title}</div>
                        )}
                        <div className="text-sm text-gray-500 truncate">{review.content}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(review.status)}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewReview(review)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {review.status !== 'approved' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenStatusDialog(review, 'approved')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {review.status !== 'rejected' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenStatusDialog(review, 'rejected')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDeleteDialog(review)}
                          className="text-gray-600 hover:text-red-600"
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

        {/* Pagination */}
        {pagination.total > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-gray-500">
              Showing {((pagination.current - 1) * 10) + 1} to {Math.min(pagination.current * 10, pagination.totalReviews)} of {pagination.totalReviews}
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

      {/* View Review Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              {/* Product Info */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {selectedReview.productId?.images?.[0]?.url && (
                  <img
                    src={selectedReview.productId.images[0].url}
                    alt={selectedReview.productId.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                )}
                <div>
                  <div className="font-medium">{selectedReview.productId?.name}</div>
                  <div className="text-sm text-gray-500">
                    by {selectedReview.vendorId?.businessName}
                  </div>
                </div>
              </div>

              {/* Customer & Rating */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Customer</div>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">
                      {selectedReview.userId?.firstName} {selectedReview.userId?.lastName}
                    </span>
                    {selectedReview.isVerifiedPurchase && (
                      <BadgeCheck className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{selectedReview.userId?.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Rating</div>
                  <div className="flex items-center space-x-2">
                    {renderStars(selectedReview.rating)}
                    <span className="font-medium">{selectedReview.rating}/5</span>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div>
                <div className="text-sm text-gray-500 mb-1">Review</div>
                {selectedReview.title && (
                  <div className="font-medium mb-1">{selectedReview.title}</div>
                )}
                <div className="text-sm">{selectedReview.content}</div>
              </div>

              {/* Images */}
              {selectedReview.images?.length > 0 && (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Images</div>
                  <div className="flex gap-2">
                    {selectedReview.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img.url}
                        alt={img.caption || `Image ${idx + 1}`}
                        className="w-20 h-20 rounded object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Vendor Response */}
              {selectedReview.vendorResponse?.content && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium mb-1">Vendor Response</div>
                  <div className="text-sm">{selectedReview.vendorResponse.content}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(selectedReview.vendorResponse.respondedAt)}
                  </div>
                </div>
              )}

              {/* Meta Info */}
              <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{selectedReview.helpfulVotes} found helpful</span>
                </div>
                <div>{formatDate(selectedReview.createdAt)}</div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <div>Current status: {getStatusBadge(selectedReview.status)}</div>
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

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {newStatus === 'approved' && 'Approve Review'}
              {newStatus === 'rejected' && 'Reject Review'}
              {newStatus === 'flagged' && 'Flag Review'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              {newStatus === 'approved' && 'This review will be visible to customers.'}
              {newStatus === 'rejected' && 'This review will be hidden from customers.'}
              {newStatus === 'flagged' && 'This review will be marked for further inspection.'}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              className={
                newStatus === 'approved' ? 'bg-green-600 hover:bg-green-700' :
                newStatus === 'rejected' ? 'bg-red-600 hover:bg-red-700' :
                'bg-orange-600 hover:bg-orange-700'
              }
            >
              {newStatus === 'approved' && 'Approve'}
              {newStatus === 'rejected' && 'Reject'}
              {newStatus === 'flagged' && 'Flag'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to delete this review? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewManagement;
