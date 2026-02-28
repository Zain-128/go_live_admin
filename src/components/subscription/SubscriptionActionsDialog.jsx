import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { subscriptionService } from '../../services/subscriptionService';
import { toast } from 'sonner';
import { Loader2, XCircle, Clock, Play, CalendarPlus } from 'lucide-react';

/**
 * Dialog for subscription actions: Cancel, Extend, Pause, Resume
 */
export const SubscriptionActionsDialog = ({ open, onOpenChange, subscription, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('cancel');

  // Cancel form
  const [cancelImmediately, setCancelImmediately] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Extend form
  const [extendDays, setExtendDays] = useState('');
  const [extendReason, setExtendReason] = useState('');

  // Pause form
  const [pauseReason, setPauseReason] = useState('');

  if (!subscription) return null;

  const canCancel = ['active', 'trialing'].includes(subscription.status);
  const canPause = subscription.status === 'active';
  const canResume = subscription.status === 'paused';
  const canExtend = subscription.type === 'recurring';

  const handleCancel = async () => {
    try {
      setLoading(true);
      await subscriptionService.cancelSubscription(subscription._id, {
        immediately: cancelImmediately,
        reason: cancelReason,
      });

      toast.success(
        cancelImmediately ? 'Subscription canceled immediately' : 'Subscription will be canceled at period end'
      );

      if (onSuccess) onSuccess();
      onOpenChange(false);

      // Reset form
      setCancelImmediately(false);
      setCancelReason('');
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      toast.error('Failed to cancel subscription', {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExtend = async () => {
    if (!extendDays || parseInt(extendDays) <= 0) {
      toast.error('Please enter a valid number of days');
      return;
    }

    try {
      setLoading(true);
      await subscriptionService.extendSubscription(subscription._id, {
        days: parseInt(extendDays),
        reason: extendReason,
      });

      toast.success(`Subscription extended by ${extendDays} days`);

      if (onSuccess) onSuccess();
      onOpenChange(false);

      // Reset form
      setExtendDays('');
      setExtendReason('');
    } catch (error) {
      console.error('Failed to extend subscription:', error);
      toast.error('Failed to extend subscription', {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      setLoading(true);
      await subscriptionService.pauseSubscription(subscription._id, {
        reason: pauseReason,
      });

      toast.success('Subscription paused');

      if (onSuccess) onSuccess();
      onOpenChange(false);

      // Reset form
      setPauseReason('');
    } catch (error) {
      console.error('Failed to pause subscription:', error);
      toast.error('Failed to pause subscription', {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    try {
      setLoading(true);
      await subscriptionService.resumeSubscription(subscription._id);

      toast.success('Subscription resumed');

      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to resume subscription:', error);
      toast.error('Failed to resume subscription', {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Subscription Actions</DialogTitle>
          <DialogDescription>
            Manage subscription for {subscription.userId?.firstName} {subscription.userId?.lastName}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cancel" disabled={!canCancel}>
              <XCircle className="h-4 w-4 mr-1" />
              Cancel
            </TabsTrigger>
            <TabsTrigger value="extend" disabled={!canExtend}>
              <CalendarPlus className="h-4 w-4 mr-1" />
              Extend
            </TabsTrigger>
            <TabsTrigger value="pause" disabled={!canPause}>
              <Clock className="h-4 w-4 mr-1" />
              Pause
            </TabsTrigger>
            <TabsTrigger value="resume" disabled={!canResume}>
              <Play className="h-4 w-4 mr-1" />
              Resume
            </TabsTrigger>
          </TabsList>

          {/* Cancel Tab */}
          <TabsContent value="cancel" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="cancelImmediately"
                  checked={cancelImmediately}
                  onCheckedChange={setCancelImmediately}
                />
                <Label htmlFor="cancelImmediately">Cancel immediately</Label>
              </div>
              {!cancelImmediately && (
                <p className="text-sm text-muted-foreground">
                  User will retain access until the end of the current billing period.
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="cancelReason">Reason (optional)</Label>
                <Input
                  id="cancelReason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g., Requested by user"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-900">
                {cancelImmediately
                  ? 'This will cancel the subscription immediately and revoke access.'
                  : 'This will cancel the subscription at the end of the current period.'}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Close
              </Button>
              <Button variant="destructive" onClick={handleCancel} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Canceling...
                  </>
                ) : (
                  'Cancel Subscription'
                )}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* Extend Tab */}
          <TabsContent value="extend" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="extendDays">Extend by (days) *</Label>
                <Input
                  id="extendDays"
                  type="number"
                  min="1"
                  value={extendDays}
                  onChange={(e) => setExtendDays(e.target.value)}
                  placeholder="e.g., 30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="extendReason">Reason (optional)</Label>
                <Input
                  id="extendReason"
                  value={extendReason}
                  onChange={(e) => setExtendReason(e.target.value)}
                  placeholder="e.g., Compensation for service issue"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-900">
                This will extend the current billing period by the specified number of days.
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Close
              </Button>
              <Button onClick={handleExtend} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extending...
                  </>
                ) : (
                  'Extend Subscription'
                )}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* Pause Tab */}
          <TabsContent value="pause" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pauseReason">Reason (optional)</Label>
                <Input
                  id="pauseReason"
                  value={pauseReason}
                  onChange={(e) => setPauseReason(e.target.value)}
                  placeholder="e.g., User requested temporary hold"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-900">
                This will pause the subscription and prevent access. Billing will be stopped.
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Close
              </Button>
              <Button onClick={handlePause} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Pausing...
                  </>
                ) : (
                  'Pause Subscription'
                )}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* Resume Tab */}
          <TabsContent value="resume" className="space-y-4">
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-900">
                This will resume the paused subscription and restore access.
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Close
              </Button>
              <Button onClick={handleResume} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resuming...
                  </>
                ) : (
                  'Resume Subscription'
                )}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
