import React, { useState, useEffect } from 'react';
import { stickerService } from '../services/stickerService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
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
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { Gift, Plus, Pencil, Trash2, Image as ImageIcon, Upload } from 'lucide-react';
import { toast } from 'sonner';

const emptySticker = {
  name: '',
  coinValue: '',
  iconUrl: '',
  displayOrder: 0,
  isActive: true,
};

const StickerManagement = () => {
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSticker, setEditingSticker] = useState(null);
  const [form, setForm] = useState({ ...emptySticker });
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [iconPreviewUrl, setIconPreviewUrl] = useState('');
  const iconFileRef = React.useRef(null);

  const fetchStickers = async () => {
    try {
      setLoading(true);
      const list = await stickerService.getStickers();
      setStickers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to fetch stickers', err);
      toast.error(err.response?.data?.message || 'Failed to fetch stickers');
      setStickers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStickers();
  }, []);

  const openCreate = () => {
    setEditingSticker(null);
    setForm({ ...emptySticker });
    setIconPreviewUrl('');
    setDialogOpen(true);
  };

  const openEdit = (sticker) => {
    setEditingSticker(sticker);
    setForm({
      name: sticker.name ?? '',
      coinValue: sticker.coinValue ?? '',
      iconUrl: sticker.iconUrl ?? '',
      displayOrder: sticker.displayOrder ?? 0,
      isActive: sticker.isActive !== false,
    });
    setIconPreviewUrl(sticker.iconUrl ?? '');
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingSticker(null);
    setForm({ ...emptySticker });
    setIconPreviewUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = String(form.name).trim();
    const coinValue = Number(form.coinValue);
    if (!name) {
      toast.error('Name is required');
      return;
    }
    if (isNaN(coinValue) || coinValue < 0) {
      toast.error('Coin value must be a non-negative number');
      return;
    }
    try {
      setSubmitting(true);
      const body = {
        name,
        coinValue,
        iconUrl: form.iconUrl?.trim() || undefined,
        displayOrder: Number(form.displayOrder) || 0,
        isActive: form.isActive,
      };
      if (editingSticker?._id) {
        await stickerService.updateSticker(editingSticker._id, body);
        toast.success('Sticker updated');
      } else {
        await stickerService.createSticker(body);
        toast.success('Sticker created');
      }
      closeDialog();
      fetchStickers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save sticker');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (sticker) => setDeleteTarget(sticker);

  const handleUploadIcon = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG, GIF, WebP)');
      return;
    }
    try {
      setUploadingIcon(true);
      const result = await stickerService.uploadImage(file);
      const url = result?.url ?? result;
      if (url) {
        setForm((f) => ({ ...f, iconUrl: url }));
        setIconPreviewUrl(result?.previewUrl || url);
        toast.success('Icon uploaded');
      } else toast.error('Upload failed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingIcon(false);
      if (iconFileRef.current) iconFileRef.current.value = '';
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?._id) return;
    try {
      setDeleteLoading(true);
      await stickerService.deleteSticker(deleteTarget._id);
      toast.success('Sticker deleted');
      setDeleteTarget(null);
      fetchStickers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete sticker');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Gift className="h-6 w-6" />
              Gift Stickers
            </CardTitle>
            <CardDescription>
              Create and manage virtual gift stickers used in live streams. Each sticker has a coin value.
            </CardDescription>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Sticker
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading stickers...</div>
          ) : stickers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No stickers yet. Click &quot;Add Sticker&quot; to create one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Icon</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Coin value</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stickers.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell>
                      <div className="h-10 w-10 rounded border flex items-center justify-center bg-muted overflow-hidden relative">
                        {s.iconUrl && (
                          <img
                            src={s.iconUrl}
                            alt=""
                            className="h-full w-full object-cover absolute inset-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <ImageIcon className="h-5 w-5 text-muted-foreground relative z-0" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.coinValue}</TableCell>
                    <TableCell>{s.displayOrder ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant={s.isActive !== false ? 'default' : 'secondary'}>
                        {s.isActive !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mr-1"
                        onClick={() => openEdit(s)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(s)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSticker ? 'Edit Sticker' : 'Add Sticker'}</DialogTitle>
            <DialogDescription>
              {editingSticker
                ? 'Update the sticker details below.'
                : 'Create a new gift sticker for live streams.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Rose"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coinValue">Coin value *</Label>
              <Input
                id="coinValue"
                type="number"
                min={0}
                step={1}
                value={form.coinValue}
                onChange={(e) => setForm((f) => ({ ...f, coinValue: e.target.value }))}
                placeholder="e.g. 10"
                required
              />
              <p className="text-xs text-muted-foreground">Streamer earns 55% of coins as rubies when the stream ends.</p>
            </div>
            <div className="space-y-2">
              <Label>Icon image</Label>
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  ref={iconFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleUploadIcon}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingIcon}
                  onClick={() => iconFileRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingIcon ? 'Uploading...' : 'Upload picture'}
                </Button>
                {(iconPreviewUrl || form.iconUrl) && (
                  <div className="h-12 w-12 rounded border overflow-hidden bg-muted flex-shrink-0">
                    <img src={iconPreviewUrl || form.iconUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
              <Input
                id="iconUrl"
                type="url"
                value={form.iconUrl}
                onChange={(e) => setForm((f) => ({ ...f, iconUrl: e.target.value }))}
                placeholder="Or paste icon URL"
                className="mt-1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display order</Label>
              <Input
                id="displayOrder"
                type="number"
                min={0}
                value={form.displayOrder}
                onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))}
              />
            </div>
            {editingSticker && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="rounded border-input"
                />
                <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingSticker ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete sticker"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleteLoading}
      />
    </div>
  );
};

export default StickerManagement;
