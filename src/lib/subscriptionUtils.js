/**
 * Subscription Utilities
 * Helper functions for subscription and package management
 */

/**
 * Format price from cents to display format
 * @param {number} cents - Price in cents
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted price string
 */
export const formatPrice = (cents, currency = 'USD') => {
  const amount = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date with time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get subscription status badge variant
 * @param {string} status - Subscription status
 * @returns {string} Badge variant
 */
export const getSubscriptionStatusVariant = (status) => {
  const statusMap = {
    active: 'default',
    trialing: 'secondary',
    past_due: 'destructive',
    canceled: 'outline',
    unpaid: 'destructive',
    incomplete: 'secondary',
    paused: 'outline',
  };
  return statusMap[status] || 'default';
};

/**
 * Get subscription status label
 * @param {string} status - Subscription status
 * @returns {string} Human readable status
 */
export const getSubscriptionStatusLabel = (status) => {
  const labelMap = {
    active: 'Active',
    trialing: 'Trial',
    past_due: 'Past Due',
    canceled: 'Canceled',
    unpaid: 'Unpaid',
    incomplete: 'Incomplete',
    paused: 'Paused',
  };
  return labelMap[status] || status;
};

/**
 * Get package type label
 * @param {string} type - Package type
 * @returns {string} Human readable type
 */
export const getPackageTypeLabel = (type) => {
  return type === 'one_time' ? 'One-time' : 'Recurring';
};

/**
 * Get interval display text
 * @param {string} interval - Interval type (day, week, month, year)
 * @param {number} intervalCount - Interval count
 * @returns {string} Display text
 */
export const getIntervalText = (interval, intervalCount = 1) => {
  if (!interval) return 'One-time';

  const intervalNames = {
    day: 'day',
    week: 'week',
    month: 'month',
    year: 'year',
  };

  const name = intervalNames[interval] || interval;

  if (intervalCount === 1) {
    return `per ${name}`;
  }

  // Handle special cases
  if (interval === 'month') {
    if (intervalCount === 3) return 'quarterly';
    if (intervalCount === 6) return 'semi-annually';
  }
  if (interval === 'year' && intervalCount === 2) {
    return 'biannually';
  }

  return `every ${intervalCount} ${name}s`;
};

/**
 * Get tier badge variant
 * @param {number} tier - Tier level
 * @returns {string} Badge variant
 */
export const getTierBadgeVariant = (tier) => {
  const tierMap = {
    1: 'outline',      // Free
    2: 'secondary',    // Basic
    3: 'default',      // Premium/Pro
    4: 'default',      // Enterprise
    5: 'destructive',  // Custom
  };
  return tierMap[tier] || 'default';
};

/**
 * Get tier label
 * @param {number} tier - Tier level
 * @returns {string} Tier name
 */
export const getTierLabel = (tier) => {
  const tierMap = {
    1: 'Free',
    2: 'Basic',
    3: 'Premium',
    4: 'Enterprise',
    5: 'Custom',
  };
  return tierMap[tier] || `Tier ${tier}`;
};

/**
 * Calculate days remaining
 * @param {string|Date} endDate - End date
 * @returns {number} Days remaining
 */
export const calculateDaysRemaining = (endDate) => {
  if (!endDate) return 0;
  const end = new Date(endDate);
  const now = new Date();
  const diff = end - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Get active status badge variant
 * @param {boolean} isActive - Active status
 * @returns {string} Badge variant
 */
export const getActiveBadgeVariant = (isActive) => {
  return isActive ? 'default' : 'outline';
};

/**
 * Get active status label
 * @param {boolean} isActive - Active status
 * @returns {string} Status label
 */
export const getActiveStatusLabel = (isActive) => {
  return isActive ? 'Active' : 'Inactive';
};

/**
 * Validate price amount
 * @param {number} amount - Amount in cents
 * @returns {boolean} Is valid
 */
export const isValidPrice = (amount) => {
  return amount && amount > 0 && Number.isInteger(amount);
};

/**
 * Convert dollars to cents
 * @param {number} dollars - Amount in dollars
 * @returns {number} Amount in cents
 */
export const dollarsToCents = (dollars) => {
  return Math.round(parseFloat(dollars) * 100);
};

/**
 * Convert cents to dollars
 * @param {number} cents - Amount in cents
 * @returns {number} Amount in dollars
 */
export const centsToDollars = (cents) => {
  return (cents / 100).toFixed(2);
};

/**
 * Get subscription type options
 * @returns {Array} Type options
 */
export const getSubscriptionTypeOptions = () => [
  { value: 'one_time', label: 'One-time Payment' },
  { value: 'recurring', label: 'Recurring Subscription' },
];

/**
 * Get interval options
 * @returns {Array} Interval options
 */
export const getIntervalOptions = () => [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
];

/**
 * Get tier options
 * @returns {Array} Tier options
 */
export const getTierOptions = () => [
  { value: 1, label: 'Tier 1 - Free' },
  { value: 2, label: 'Tier 2 - Basic' },
  { value: 3, label: 'Tier 3 - Premium' },
  { value: 4, label: 'Tier 4 - Enterprise' },
  { value: 5, label: 'Tier 5 - Custom' },
];

/**
 * Get subscription status options for filters
 * @returns {Array} Status options
 */
export const getSubscriptionStatusOptions = () => [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'trialing', label: 'Trial' },
  { value: 'past_due', label: 'Past Due' },
  { value: 'canceled', label: 'Canceled' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'incomplete', label: 'Incomplete' },
  { value: 'paused', label: 'Paused' },
];

/**
 * Format features array to display string
 * @param {Array} features - Features array
 * @returns {string} Formatted features
 */
export const formatFeatures = (features) => {
  if (!features || features.length === 0) return 'No features';
  return features.join(', ');
};

/**
 * Get readable billing cycle name
 * @param {Object} pkg - Package object
 * @returns {string} Billing cycle name
 */
export const getBillingCycleName = (pkg) => {
  if (pkg.type === 'one_time') return 'One-time payment';
  if (pkg.billingCycleName) return pkg.billingCycleName;
  return getIntervalText(pkg.interval, pkg.intervalCount);
};
