import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Card, CardContent } from '../ui/card';
import {
  User,
  Package,
  CreditCard,
  Calendar,
  DollarSign,
  Hash,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  formatPrice,
  formatDate,
  formatDateTime,
  getSubscriptionStatusLabel,
  getSubscriptionStatusVariant,
  getPackageTypeLabel,
  getIntervalText,
  calculateDaysRemaining,
} from '../../lib/subscriptionUtils';

/**
 * Dialog for viewing subscription details
 */
export const SubscriptionDetailsDialog = ({ open, onOpenChange, subscription }) => {
  if (!subscription) return null;

  const daysRemaining = subscription.currentPeriodEnd ? calculateDaysRemaining(subscription.currentPeriodEnd) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subscription Details</DialogTitle>
          <DialogDescription>Complete information about this subscription</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Overview */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{subscription.packageId?.name || 'N/A'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getPackageTypeLabel(subscription.type)}
                      {subscription.type === 'recurring' &&
                        ` - ${getIntervalText(subscription.packageId?.interval, subscription.packageId?.intervalCount)}`}
                    </p>
                  </div>
                </div>
                <Badge variant={getSubscriptionStatusVariant(subscription.status)} className="text-base px-3 py-1">
                  {getSubscriptionStatusLabel(subscription.status)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* User Information */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              User Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <p className="font-medium">
                  {subscription.userId?.firstName} {subscription.userId?.lastName}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="font-medium">{subscription.userId?.email}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Subscription Details */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Subscription Details
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Type:</span>
                <p className="font-medium">{getPackageTypeLabel(subscription.type)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Package Tier:</span>
                <p className="font-medium">Tier {subscription.packageId?.tier || 'N/A'}</p>
              </div>
              {subscription.type === 'recurring' && (
                <>
                  <div>
                    <span className="text-muted-foreground">Billing Cycle:</span>
                    <p className="font-medium">
                      {getIntervalText(subscription.packageId?.interval, subscription.packageId?.intervalCount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Auto Renew:</span>
                    <p className="font-medium flex items-center gap-1">
                      {subscription.cancelAtPeriodEnd ? (
                        <>
                          <XCircle className="h-4 w-4 text-destructive" />
                          No
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          Yes
                        </>
                      )}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Important Dates
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Started:</span>
                <p className="font-medium">{formatDate(subscription.startDate)}</p>
              </div>
              {subscription.currentPeriodStart && (
                <div>
                  <span className="text-muted-foreground">Current Period Start:</span>
                  <p className="font-medium">{formatDate(subscription.currentPeriodStart)}</p>
                </div>
              )}
              {subscription.currentPeriodEnd && (
                <div>
                  <span className="text-muted-foreground">Current Period End:</span>
                  <p className="font-medium">
                    {formatDate(subscription.currentPeriodEnd)}
                    {daysRemaining !== null && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'})
                      </span>
                    )}
                  </p>
                </div>
              )}
              {subscription.trialEnd && (
                <div>
                  <span className="text-muted-foreground">Trial Ends:</span>
                  <p className="font-medium">{formatDate(subscription.trialEnd)}</p>
                </div>
              )}
              {subscription.canceledAt && (
                <div>
                  <span className="text-muted-foreground">Canceled At:</span>
                  <p className="font-medium">{formatDateTime(subscription.canceledAt)}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Payment Information */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Payment Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Amount:</span>
                <p className="font-medium text-lg">
                  {formatPrice(subscription.amount || 0, subscription.currency)}
                </p>
              </div>
              {subscription.type === 'recurring' && (
                <>
                  <div>
                    <span className="text-muted-foreground">Total Payments:</span>
                    <p className="font-medium">{subscription.paymentCount || 0}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Payment:</span>
                    <p className="font-medium">{formatDate(subscription.lastPaymentDate)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Next Billing:</span>
                    <p className="font-medium">{formatDate(subscription.nextBillingDate)}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Stripe Information */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Stripe Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {subscription.stripeSubscriptionId && (
                <div>
                  <span className="text-muted-foreground">Subscription ID:</span>
                  <p className="font-mono text-xs break-all">{subscription.stripeSubscriptionId}</p>
                </div>
              )}
              {subscription.stripeCustomerId && (
                <div>
                  <span className="text-muted-foreground">Customer ID:</span>
                  <p className="font-mono text-xs break-all">{subscription.stripeCustomerId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          {subscription.packageId?.features && subscription.packageId.features.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Features
                </h4>
                <div className="flex flex-wrap gap-2">
                  {subscription.packageId.features.map((feature, index) => (
                    <Badge key={index} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Cancellation Info */}
          {subscription.cancelReason && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Cancellation Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Reason:</span>
                    <p className="font-medium">{subscription.cancelReason}</p>
                  </div>
                  {subscription.canceledBy && (
                    <div>
                      <span className="text-muted-foreground">Canceled By:</span>
                      <p className="font-medium capitalize">{subscription.canceledBy}</p>
                    </div>
                  )}
                  {subscription.cancelAtPeriodEnd && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-900">
                      This subscription will be canceled at the end of the billing period.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {subscription.notes && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3">Admin Notes</h4>
                <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap">{subscription.notes}</div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
