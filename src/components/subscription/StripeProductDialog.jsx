import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectItem } from '../ui/select';
import { subscriptionService } from '../../services/subscriptionService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { getSubscriptionTypeOptions, getIntervalOptions, dollarsToCents } from '../../lib/subscriptionUtils';

/**
 * Dialog for creating Stripe products and prices
 * This creates the product and price in Stripe first, then you can create the package in DB
 */
export const StripeProductDialog = ({ open, onOpenChange, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'recurring',
    price: '',
    currency: 'USD',
    interval: 'month',
    intervalCount: 1,
    trialPeriodDays: 0,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Valid price is required');
      return;
    }

    try {
      setLoading(true);

      // Convert price to cents
      const priceInCents = dollarsToCents(formData.price);

      const data = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        price: {
          amount: priceInCents,
          currency: formData.currency,
        },
      };

      // Add recurring-specific fields
      if (formData.type === 'recurring') {
        data.interval = formData.interval;
        data.intervalCount = parseInt(formData.intervalCount);
        data.trialPeriodDays = parseInt(formData.trialPeriodDays) || 0;
      }

      const result = await subscriptionService.createStripeProduct(data);

      toast.success('Stripe product created successfully!', {
        description: `Product ID: ${result.productId}`,
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        type: 'recurring',
        price: '',
        currency: 'USD',
        interval: 'month',
        intervalCount: 1,
        trialPeriodDays: 0,
      });

      // Pass back the IDs to parent
      if (onSuccess) {
        onSuccess({
          stripeProductId: result.productId,
          stripePriceId: result.priceId,
          name: formData.name,
          type: formData.type,
          interval: formData.interval,
          intervalCount: formData.intervalCount,
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create Stripe product:', error);
      toast.error('Failed to create Stripe product', {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Stripe Product & Price</DialogTitle>
          <DialogDescription>
            Create a product and price in Stripe. After creation, you can use the generated IDs to create a package in the database.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Premium Monthly Plan"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the product"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Payment Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
              placeholder="Select payment type"
            >
              {getSubscriptionTypeOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (in dollars) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="29.99"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value.toUpperCase())}
                placeholder="USD"
                maxLength={3}
              />
            </div>
          </div>

          {/* Recurring Options */}
          {formData.type === 'recurring' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interval">Billing Interval *</Label>
                  <Select
                    value={formData.interval}
                    onValueChange={(value) => handleInputChange('interval', value)}
                    placeholder="Select interval"
                  >
                    {getIntervalOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="intervalCount">Interval Count</Label>
                  <Input
                    id="intervalCount"
                    type="number"
                    min="1"
                    value={formData.intervalCount}
                    onChange={(e) => handleInputChange('intervalCount', e.target.value)}
                    placeholder="1"
                  />
                  <p className="text-xs text-muted-foreground">
                    e.g., 3 months = quarterly
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trialPeriodDays">Trial Period (days)</Label>
                <Input
                  id="trialPeriodDays"
                  type="number"
                  min="0"
                  value={formData.trialPeriodDays}
                  onChange={(e) => handleInputChange('trialPeriodDays', e.target.value)}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">
                  Set to 0 for no trial period
                </p>
              </div>
            </>
          )}

          {/* Info Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
            <p className="text-blue-900">
              This will create the product and price in your Stripe account. Make sure your Stripe API keys are configured correctly.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create in Stripe'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
