import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DollarSign, Plus, Pencil, Trash2 } from 'lucide-react';
import { cashoutOptionService } from '../services/cashoutOptionService';
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

const emptyForm = {
  amountUsd: '',
  rubies: '',
  displayOrder: 0,
  isActive: true,
};

const CashoutOptionManagement = () => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const list = await cashoutOptionService.getAll();
      setOptions(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch cashout options');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (option) => {
    setEditing(option);
    setForm({
      amountUsd: option.amountUsd,
      rubies: option.rubies,
      displayOrder: option.displayOrder ?? 0,
      isActive: option.isActive !== false,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(form.amountUsd);
    const rubies = Number(form.rubies);
    if (!amount || amount <= 0) {
      toast.error('Amount (USD) must be greater than 0');
      return;
    }
    if (!rubies || rubies <= 0) {
      toast.error('Rubies must be greater than 0');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        amountUsd: amount,
        rubies,
        displayOrder: Number(form.displayOrder) || 0,
        isActive: form.isActive,
      };
      if (editing?._id) {
        await cashoutOptionService.update(editing._id, payload);
        toast.success('Cashout option updated');
      } else {
        await cashoutOptionService.create(payload);
        toast.success('Cashout option created');
      }
      closeDialog();
      fetchOptions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      await cashoutOptionService.remove(deleteTarget._id);
      toast.success('Cashout option deleted');
      setDeleteTarget(null);
      fetchOptions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
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
              <DollarSign className="h-6 w-6" />
              Cashout Options
            </CardTitle>
            <CardDescription>
              Manage the allowed USD cashout tiers shown to users.
            </CardDescription>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : options.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No cashout options yet. Defaults ($100, $200, $400, $1000) will be used.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount (USD)</TableHead>
                  <TableHead>Rubies</TableHead>
                  <TableHead>Display Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {options.map((opt) => (
                  <TableRow key={opt._id}>
                    <TableCell className="font-medium">${opt.amountUsd}</TableCell>
                    <TableCell>{opt.rubies?.toLocaleString()}</TableCell>
                    <TableCell>{opt.displayOrder}</TableCell>
                    <TableCell>
                      <Badge variant={opt.isActive ? 'default' : 'secondary'}>
                        {opt.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(opt)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(opt)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Cashout Option' : 'New Cashout Option'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update the cashout tier.' : 'Add a new USD cashout tier for users.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amountUsd">Amount (USD) *</Label>
              <Input
                id="amountUsd"
                type="number"
                min="1"
                step="any"
                value={form.amountUsd}
                onChange={(e) => setForm((f) => ({ ...f, amountUsd: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rubies">Rubies *</Label>
              <Input
                id="rubies"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 40000"
                value={form.rubies}
                onChange={(e) => setForm((f) => ({ ...f, rubies: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete cashout option?"
        description={`Delete the $${deleteTarget?.amountUsd} (${deleteTarget?.rubies?.toLocaleString()} rubies) cashout tier? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleteLoading}
      />
    </div>
  );
};

export default CashoutOptionManagement;
