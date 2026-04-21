import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Coins,
  Gem,
  Trophy,
  ShoppingCart,
  Gift,
  Radio,
  Banknote,
  Crown,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Copy,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { userService } from '../services/userService';

const fmtNum = (n) => (n == null ? '0' : Number(n).toLocaleString());
const fmtUsd = (n) => (n == null ? '$0.00' : `$${Number(n).toFixed(2)}`);
const fmtDate = (d) => (d ? new Date(d).toLocaleString() : '—');
const shortId = (s, head = 6, tail = 4) =>
  !s ? '—' : s.length <= head + tail + 3 ? s : `${s.slice(0, head)}…${s.slice(-tail)}`;

const CopyBtn = ({ value }) => {
  if (!value) return null;
  return (
    <button
      type="button"
      className="inline-flex size-5 items-center justify-center rounded hover:bg-gray-100"
      title="Copy"
      onClick={() => {
        navigator.clipboard?.writeText(value);
        toast.success('Copied');
      }}
    >
      <Copy className="size-3" />
    </button>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, color = 'text-gray-700' }) => (
  <Card>
    <CardContent className="flex items-start justify-between p-4">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
        {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
      </div>
      <Icon className={`size-5 ${color}`} />
    </CardContent>
  </Card>
);

const PlatformBadge = ({ platform }) => {
  if (!platform) return <span className="text-muted-foreground">—</span>;
  const map = {
    web: 'bg-blue-100 text-blue-800',
    ios: 'bg-gray-100 text-gray-800',
    android: 'bg-green-100 text-green-800',
  };
  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${map[platform] || 'bg-gray-100 text-gray-800'}`}>
      {platform}
    </span>
  );
};

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState(null);

  const [purchases, setPurchases] = useState([]);
  const [purchasesPagination, setPurchasesPagination] = useState({ current: 1, total: 1, totalItems: 0 });
  const [purchasesLoading, setPurchasesLoading] = useState(false);

  const [walletTx, setWalletTx] = useState([]);
  const [walletTxPagination, setWalletTxPagination] = useState({ current: 1, total: 1, totalItems: 0 });
  const [walletTxLoading, setWalletTxLoading] = useState(false);
  const [walletTxType, setWalletTxType] = useState('');

  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalsPagination, setWithdrawalsPagination] = useState({ current: 1, total: 1, totalItems: 0, status: '' });
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
  const [withdrawalsStatus, setWithdrawalsStatus] = useState('');

  const [verifyInput, setVerifyInput] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [reconciling, setReconciling] = useState(false);

  const [lifetimeAudit, setLifetimeAudit] = useState(null);
  const [lifetimeAuditLoading, setLifetimeAuditLoading] = useState(false);
  const [lifetimeReconciling, setLifetimeReconciling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await userService.getUserOverview(id);
        if (!cancelled) setOverview(data);
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || err.message || 'Failed to load user');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const loadPurchases = async (page = 1) => {
    try {
      setPurchasesLoading(true);
      const data = await userService.getUserPurchases(id, { page, limit: 20 });
      setPurchases(data.purchases || []);
      setPurchasesPagination(data.pagination || { current: 1, total: 1, totalItems: 0 });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load purchases');
    } finally {
      setPurchasesLoading(false);
    }
  };

  const loadWalletTransactions = async (page = 1, type = walletTxType) => {
    try {
      setWalletTxLoading(true);
      const data = await userService.getUserTransactions(id, {
        page,
        limit: 25,
        type: type || undefined,
      });
      setWalletTx(data.transactions || []);
      setWalletTxPagination(data.pagination || { current: 1, total: 1, totalItems: 0 });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load transactions');
    } finally {
      setWalletTxLoading(false);
    }
  };

  const loadWithdrawals = async (page = 1, status = withdrawalsStatus) => {
    try {
      setWithdrawalsLoading(true);
      const data = await userService.getUserWithdrawals(id, {
        page,
        limit: 20,
        status: status || undefined,
      });
      const requests = data.requests || data.data || [];
      setWithdrawals(requests);
      setWithdrawalsPagination({
        current: data.pagination?.page || page,
        total: data.pagination?.totalPages || 1,
        totalItems: data.pagination?.totalCount || requests.length,
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load withdrawals');
    } finally {
      setWithdrawalsLoading(false);
    }
  };

  const handleVerify = async (orderId) => {
    const trimmed = String(orderId || '').trim();
    if (!trimmed) {
      toast.error('Enter a PayPal order ID');
      return;
    }
    try {
      setVerifying(true);
      setVerifyResult(null);
      const data = await userService.verifyPayPalOrder(id, trimmed);
      setVerifyResult({ orderId: trimmed, ...data });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Verification failed');
      setVerifyResult({
        orderId: trimmed,
        error: err?.response?.data?.message || 'Verification failed',
      });
    } finally {
      setVerifying(false);
    }
  };

  const loadLifetimeAudit = async () => {
    try {
      setLifetimeAuditLoading(true);
      const data = await userService.getLifetimeRubiesAudit(id);
      setLifetimeAudit(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load lifetime rubies audit');
    } finally {
      setLifetimeAuditLoading(false);
    }
  };

  const handleLifetimeReconcile = async () => {
    if (!lifetimeAudit) return;
    const { stored, expected, diff } = lifetimeAudit.lifetimeRubies || {};
    if (diff === 0) {
      toast.info('Already matches ledger — nothing to reconcile');
      return;
    }
    const direction = diff > 0 ? 'decrease' : 'increase';
    if (
      !window.confirm(
        `Reconcile lifetimeRubies from ${fmtNum(stored)} to ${fmtNum(expected)} (${direction} by ${fmtNum(Math.abs(diff))})?`
      )
    )
      return;
    try {
      setLifetimeReconciling(true);
      const result = await userService.reconcileLifetimeRubies(id);
      if (!result.changed) {
        toast.info('Already in sync');
      } else {
        toast.success(`Reconciled: ${fmtNum(result.before)} → ${fmtNum(result.after)}`);
      }
      await loadLifetimeAudit();
      const fresh = await userService.getUserOverview(id);
      setOverview(fresh);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Reconcile failed');
    } finally {
      setLifetimeReconciling(false);
    }
  };

  const handleReconcile = async (orderId) => {
    if (!window.confirm(`Credit coins to this user for PayPal order ${orderId}?`)) return;
    try {
      setReconciling(true);
      const data = await userService.reconcilePayPalOrder(id, orderId);
      if (data.alreadyProcessed) {
        toast.info(`Already credited (${fmtNum(data.coinsAdded)} coins, balance ${fmtNum(data.newBalance)})`);
      } else {
        toast.success(`Credited ${fmtNum(data.coinsAdded)} coins. New balance: ${fmtNum(data.newBalance)}`);
      }
      // Refresh the overview + verify state
      const fresh = await userService.getUserOverview(id);
      setOverview(fresh);
      await handleVerify(orderId);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Reconcile failed');
    } finally {
      setReconciling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Button variant="outline" onClick={() => navigate('/users')}>
          <ArrowLeft className="size-4 mr-2" /> Back to users
        </Button>
        <Card className="mt-6">
          <CardContent className="p-6 text-center text-red-600">
            {error || 'User not found'}
          </CardContent>
        </Card>
      </div>
    );
  }

  const { user, wallet, stats, crown } = overview;
  const fullName =
    user.name ||
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    user.username ||
    user.email;
  const initials = (fullName || '?')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/users')}>
          <ArrowLeft className="size-4 mr-2" /> Back to users
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={user.profilePicture} alt={fullName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold">{fullName}</h1>
                {user.role?.displayName ? (
                  <Badge variant="secondary">{user.role.displayName}</Badge>
                ) : null}
                {user.isActive === false ? (
                  <Badge variant="destructive">Inactive</Badge>
                ) : null}
                {user.isBanned ? (
                  <Badge variant="destructive">Banned</Badge>
                ) : null}
                {user.isVerified ? (
                  <Badge className="bg-green-100 text-green-800">Verified</Badge>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {user.email} · @{user.username} · joined {fmtDate(user.createdAt)}
              </p>
              {user.paypalEmail ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  PayPal: {user.paypalEmail}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Coins</p>
              <p className="text-xl font-bold text-amber-600">
                {fmtNum(wallet.coins)}
              </p>
            </div>
            <Separator orientation="vertical" className="hidden h-10 md:block" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Rubies</p>
              <p className="text-xl font-bold text-rose-600">
                {fmtNum(wallet.rubies)}
              </p>
            </div>
            <Separator orientation="vertical" className="hidden h-10 md:block" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Lifetime Rubies</p>
              <p className="text-xl font-bold text-gray-700">
                {fmtNum(wallet.lifetimeRubies)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs
        defaultValue="overview"
        onValueChange={(v) => {
          if (v === 'purchases' && purchases.length === 0) loadPurchases(1);
          if (v === 'wallet' && walletTx.length === 0) loadWalletTransactions(1);
          if (v === 'wallet' && !lifetimeAudit) loadLifetimeAudit();
          if (v === 'withdrawals' && withdrawals.length === 0) loadWithdrawals(1);
        }}
      >
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
          <TabsTrigger value="streams">Streams</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="crown">Crown</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={ShoppingCart}
              label="Purchases"
              value={fmtNum(stats.purchasesCount)}
              sub={`${fmtUsd(stats.purchasesTotalUsd)} · ${fmtNum(stats.purchasesTotalCoins)} coins`}
              color="text-blue-600"
            />
            <StatCard
              icon={Gift}
              label="Gifts sent"
              value={fmtNum(stats.giftsSentCount)}
              sub={`${fmtNum(stats.giftsSentTotalCoins)} coins spent`}
              color="text-pink-600"
            />
            <StatCard
              icon={Radio}
              label="Streams"
              value={fmtNum(stats.streamsCount)}
              sub={`${fmtNum(stats.streamEarningsTotalRubies)} rubies earned`}
              color="text-purple-600"
            />
            <StatCard
              icon={Banknote}
              label="Withdrawals"
              value={fmtNum(stats.withdrawalsCount)}
              sub={`${stats.withdrawalsApprovedCount} approved · ${fmtUsd(stats.withdrawalsApprovedUsd)}`}
              color="text-green-600"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <div className="text-sm">
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{fullName}</p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Username</p>
                <p className="font-medium">@{user.username}</p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Role</p>
                <p className="font-medium">{user.role?.displayName || user.role?.name || '—'}</p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Country</p>
                <p className="font-medium">{user.country || '—'}</p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Last login</p>
                <p className="font-medium">{fmtDate(user.lastLogin)}</p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">User ID</p>
                <p className="font-mono text-xs">
                  {user._id} <CopyBtn value={user._id} />
                </p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">PayPal email</p>
                <p className="font-medium">{user.paypalEmail || '—'}</p>
              </div>
              {user.bio ? (
                <div className="text-sm md:col-span-2">
                  <p className="text-muted-foreground">Bio</p>
                  <p>{user.bio}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        {/* WALLET TAB */}
        <TabsContent value="wallet" className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard icon={Coins} label="Coins (spendable)" value={fmtNum(wallet.coins)} color="text-amber-600" />
            <StatCard icon={Gem} label="Rubies (spendable)" value={fmtNum(wallet.rubies)} color="text-rose-600" />
            <StatCard icon={Trophy} label="Lifetime Rubies" value={fmtNum(wallet.lifetimeRubies)} color="text-gray-700" />
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Lifetime Rubies audit</CardTitle>
                  <CardDescription>
                    Stored on user vs. ledger-computed expected value. Reconcile snaps the
                    stored value to the ledger total — no free-form input.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadLifetimeAudit}
                    disabled={lifetimeAuditLoading}
                  >
                    {lifetimeAuditLoading ? <Loader2 className="size-4 animate-spin" /> : 'Refresh'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleLifetimeReconcile}
                    disabled={
                      lifetimeReconciling ||
                      !lifetimeAudit ||
                      lifetimeAudit.lifetimeRubies?.diff === 0
                    }
                  >
                    {lifetimeReconciling ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-1" /> Reconciling
                      </>
                    ) : (
                      'Reconcile to ledger'
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {lifetimeAuditLoading && !lifetimeAudit ? (
                <div className="flex justify-center p-6">
                  <Loader2 className="size-5 animate-spin text-gray-400" />
                </div>
              ) : !lifetimeAudit ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  Click Refresh to load the audit.
                </p>
              ) : (
                <>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-md border p-3">
                      <p className="text-xs text-muted-foreground">Stored (user.lifetimeRubies)</p>
                      <p className="mt-1 text-xl font-bold text-gray-800 tabular-nums">
                        {fmtNum(lifetimeAudit.lifetimeRubies?.stored)}
                      </p>
                    </div>
                    <div className="rounded-md border p-3">
                      <p className="text-xs text-muted-foreground">Expected (from ledger)</p>
                      <p className="mt-1 text-xl font-bold text-blue-700 tabular-nums">
                        {fmtNum(lifetimeAudit.lifetimeRubies?.expected)}
                      </p>
                    </div>
                    <div
                      className={`rounded-md border p-3 ${
                        lifetimeAudit.lifetimeRubies?.diff === 0
                          ? 'bg-green-50'
                          : lifetimeAudit.lifetimeRubies?.diff > 0
                            ? 'bg-amber-50'
                            : 'bg-rose-50'
                      }`}
                    >
                      <p className="text-xs text-muted-foreground">Diff (stored − expected)</p>
                      <p
                        className={`mt-1 text-xl font-bold tabular-nums ${
                          lifetimeAudit.lifetimeRubies?.diff === 0
                            ? 'text-green-700'
                            : lifetimeAudit.lifetimeRubies?.diff > 0
                              ? 'text-amber-700'
                              : 'text-rose-700'
                        }`}
                      >
                        {lifetimeAudit.lifetimeRubies?.diff > 0 ? '+' : ''}
                        {fmtNum(lifetimeAudit.lifetimeRubies?.diff)}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {lifetimeAudit.lifetimeRubies?.diff === 0
                          ? 'In sync'
                          : lifetimeAudit.lifetimeRubies?.diff > 0
                            ? 'Inflated — rejections happened after settlement without decrementing lifetime'
                            : 'Under-counted — ledger shows more credits than stored'}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-md border p-3 text-sm">
                    <p className="font-semibold mb-2">Breakdown</p>
                    <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4 text-xs">
                      <div>
                        <p className="text-muted-foreground">stream_earnings</p>
                        <p className="font-medium tabular-nums">
                          +{fmtNum(lifetimeAudit.breakdown?.creditsByType?.stream_earnings?.rubies)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">conversion</p>
                        <p className="font-medium tabular-nums">
                          +{fmtNum(lifetimeAudit.breakdown?.creditsByType?.conversion?.rubies)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">gift_received</p>
                        <p className="font-medium tabular-nums">
                          +{fmtNum(lifetimeAudit.breakdown?.creditsByType?.gift_received?.rubies)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">referral</p>
                        <p className="font-medium tabular-nums">
                          +{fmtNum(lifetimeAudit.breakdown?.creditsByType?.referral?.rubies)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total credits</p>
                        <p className="font-medium tabular-nums">
                          +{fmtNum(lifetimeAudit.breakdown?.totalCredits)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          Post-settlement reversals ({lifetimeAudit.breakdown?.postSettlementReversalsCount || 0})
                        </p>
                        <p className="font-medium tabular-nums text-rose-700">
                          −{fmtNum(lifetimeAudit.breakdown?.postSettlementReversalsTotal)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          Pre-settlement reversals ({lifetimeAudit.breakdown?.preSettlementReversalsCount || 0})
                        </p>
                        <p className="font-medium tabular-nums">
                          ignored
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">= Expected</p>
                        <p className="font-semibold tabular-nums text-blue-700">
                          {fmtNum(lifetimeAudit.lifetimeRubies?.expected)}
                        </p>
                      </div>
                    </div>
                  </div>

                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>All transactions</CardTitle>
                  <CardDescription>
                    {walletTxPagination.totalItems || 0} total ledger entries across all types.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm"
                    value={walletTxType}
                    onChange={(e) => {
                      const v = e.target.value;
                      setWalletTxType(v);
                      loadWalletTransactions(1, v);
                    }}
                    disabled={walletTxLoading}
                  >
                    <option value="">All types</option>
                    <option value="purchase">purchase</option>
                    <option value="live_gift_sent">live_gift_sent</option>
                    <option value="stream_earnings">stream_earnings</option>
                    <option value="live_gift_refund">live_gift_refund</option>
                    <option value="live_gift_reversal">live_gift_reversal</option>
                    <option value="conversion">conversion</option>
                    <option value="withdraw">withdraw</option>
                    <option value="referral">referral</option>
                    <option value="raffle_win">raffle_win</option>
                    <option value="crown_subscription">crown_subscription</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadWalletTransactions(walletTxPagination.current || 1)}
                    disabled={walletTxLoading}
                  >
                    {walletTxLoading ? <Loader2 className="size-4 animate-spin" /> : 'Refresh'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {walletTxLoading && walletTx.length === 0 ? (
                <div className="flex justify-center p-6">
                  <Loader2 className="size-5 animate-spin text-gray-400" />
                </div>
              ) : walletTx.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  {walletTxPagination.totalItems === 0 ? 'No transactions yet' : 'Click Refresh to load'}
                </p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Coins</TableHead>
                        <TableHead className="text-right">Rubies</TableHead>
                        <TableHead className="text-right">USD</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>When</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {walletTx.map((t) => (
                        <TableRow key={t._id}>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">
                              {t.type}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-right tabular-nums ${t.coins < 0 ? 'text-red-600' : t.coins > 0 ? 'text-green-600' : ''}`}>
                            {t.coins ? (t.coins > 0 ? `+${fmtNum(t.coins)}` : fmtNum(t.coins)) : '—'}
                          </TableCell>
                          <TableCell className={`text-right tabular-nums ${t.rubies < 0 ? 'text-red-600' : t.rubies > 0 ? 'text-green-600' : ''}`}>
                            {t.rubies ? (t.rubies > 0 ? `+${fmtNum(t.rubies)}` : fmtNum(t.rubies)) : '—'}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {t.usd ? fmtUsd(t.usd) : '—'}
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-xs">
                            {t.description}
                            {t.adminReconciledBy ? (
                              <Badge className="ml-2 bg-amber-100 text-amber-800" variant="secondary">
                                admin-reconciled
                              </Badge>
                            ) : null}
                          </TableCell>
                          <TableCell>
                            {t.status ? (
                              <Badge variant="outline" className="text-xs">
                                {t.status}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{fmtDate(t.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {walletTxPagination.total > 1 ? (
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Page {walletTxPagination.current} of {walletTxPagination.total} · {fmtNum(walletTxPagination.totalItems)} total
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={walletTxLoading || walletTxPagination.current <= 1}
                          onClick={() => loadWalletTransactions(walletTxPagination.current - 1)}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={walletTxLoading || walletTxPagination.current >= walletTxPagination.total}
                          onClick={() => loadWalletTransactions(walletTxPagination.current + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PURCHASES TAB */}
        <TabsContent value="purchases" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="size-4" /> Verify a PayPal order
              </CardTitle>
              <CardDescription>
                Paste a PayPal order ID to check its status. If PayPal says COMPLETED
                but we have no ledger entry, you can credit the user.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="PayPal order ID (e.g. 3AB12345CD678901E)"
                  value={verifyInput}
                  onChange={(e) => setVerifyInput(e.target.value)}
                  disabled={verifying}
                />
                <Button onClick={() => handleVerify(verifyInput)} disabled={verifying}>
                  {verifying ? <Loader2 className="size-4 animate-spin" /> : 'Verify'}
                </Button>
              </div>

              {verifyResult ? (
                <VerifyResultCard
                  result={verifyResult}
                  onReconcile={handleReconcile}
                  reconciling={reconciling}
                />
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Purchase history</CardTitle>
                  <CardDescription>
                    {purchasesPagination.totalItems || 0} total purchases
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => loadPurchases(1)} disabled={purchasesLoading}>
                  {purchasesLoading ? <Loader2 className="size-4 animate-spin" /> : 'Refresh'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {purchases.length === 0 && !purchasesLoading ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  {purchasesPagination.totalItems === 0
                    ? 'No purchases yet'
                    : 'Click Refresh to load'}
                </p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead className="text-right">Coins</TableHead>
                        <TableHead className="text-right">USD</TableHead>
                        <TableHead>Order / Receipt ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchases.map((p) => {
                        const key =
                          p.paypalOrderId ||
                          p.storeTransactionId ||
                          p.storePurchaseToken ||
                          p.stripeSessionId ||
                          '';
                        return (
                          <TableRow key={p._id}>
                            <TableCell className="text-xs">{fmtDate(p.createdAt)}</TableCell>
                            <TableCell><PlatformBadge platform={p.platform} /></TableCell>
                            <TableCell className="text-right tabular-nums">{fmtNum(p.coins)}</TableCell>
                            <TableCell className="text-right tabular-nums">{fmtUsd(p.usd)}</TableCell>
                            <TableCell className="font-mono text-xs">
                              <span className="inline-flex items-center gap-1">
                                {shortId(key, 10, 6)} <CopyBtn value={key} />
                              </span>
                              {p.adminReconciledBy ? (
                                <Badge className="ml-2 bg-amber-100 text-amber-800" variant="secondary">
                                  admin-reconciled
                                </Badge>
                              ) : null}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {p.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {p.paypalOrderId ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setVerifyInput(p.paypalOrderId);
                                    handleVerify(p.paypalOrderId);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                >
                                  Re-verify
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {purchasesPagination.total > 1 ? (
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Page {purchasesPagination.current} of {purchasesPagination.total}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={purchasesLoading || purchasesPagination.current <= 1}
                          onClick={() => loadPurchases(purchasesPagination.current - 1)}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            purchasesLoading ||
                            purchasesPagination.current >= purchasesPagination.total
                          }
                          onClick={() => loadPurchases(purchasesPagination.current + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* STREAMS TAB */}
        <TabsContent value="streams" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Streaming summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <StatCard
                icon={Radio}
                label="Total streams"
                value={fmtNum(stats.streamsCount)}
                color="text-purple-600"
              />
              <StatCard
                icon={Gem}
                label="Total stream earnings"
                value={`${fmtNum(stats.streamEarningsTotalRubies)} rubies`}
                color="text-rose-600"
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-3">
                Full stream-by-stream breakdown (gifts received, per-stream earnings,
                gifter list) is on the Payout Analytics page for this user.
              </p>
              <Link to={`/streamers-rubies/${id}`}>
                <Button variant="outline">
                  Open in Payout Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WITHDRAWALS TAB */}
        <TabsContent value="withdrawals" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Withdrawal requests</CardTitle>
                  <CardDescription>
                    {withdrawalsPagination.totalItems || 0} total requests. Approve / reject actions
                    are on the main Withdrawals page.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm"
                    value={withdrawalsStatus}
                    onChange={(e) => {
                      const v = e.target.value;
                      setWithdrawalsStatus(v);
                      loadWithdrawals(1, v);
                    }}
                    disabled={withdrawalsLoading}
                  >
                    <option value="">All statuses</option>
                    <option value="pending">pending</option>
                    <option value="approved">approved</option>
                    <option value="rejected">rejected</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadWithdrawals(withdrawalsPagination.current || 1)}
                    disabled={withdrawalsLoading}
                  >
                    {withdrawalsLoading ? <Loader2 className="size-4 animate-spin" /> : 'Refresh'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {withdrawalsLoading && withdrawals.length === 0 ? (
                <div className="flex justify-center p-6">
                  <Loader2 className="size-5 animate-spin text-gray-400" />
                </div>
              ) : withdrawals.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  {withdrawalsPagination.totalItems === 0 ? 'No withdrawal requests' : 'Click Refresh to load'}
                </p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">USD</TableHead>
                        <TableHead className="text-right">Rubies</TableHead>
                        <TableHead>PayPal email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reviewed by</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.map((w) => (
                        <TableRow key={w._id}>
                          <TableCell className="text-xs">{fmtDate(w.createdAt)}</TableCell>
                          <TableCell className="text-right tabular-nums">{fmtUsd(w.amountUsd)}</TableCell>
                          <TableCell className="text-right tabular-nums">{fmtNum(w.rubiesAmount)}</TableCell>
                          <TableCell className="text-xs">{w.paypalEmail || '—'}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                w.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : w.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {w.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {w.reviewedBy?.name || w.reviewedBy?.username || '—'}
                          </TableCell>
                          <TableCell>
                            <Link to={`/withdraw-requests/${w._id}`}>
                              <Button size="sm" variant="outline">Open</Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {withdrawalsPagination.total > 1 ? (
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Page {withdrawalsPagination.current} of {withdrawalsPagination.total} · {fmtNum(withdrawalsPagination.totalItems)} total
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={withdrawalsLoading || withdrawalsPagination.current <= 1}
                          onClick={() => loadWithdrawals(withdrawalsPagination.current - 1)}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={withdrawalsLoading || withdrawalsPagination.current >= withdrawalsPagination.total}
                          onClick={() => loadWithdrawals(withdrawalsPagination.current + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CROWN TAB */}
        <TabsContent value="crown" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="size-4 text-amber-600" /> Crown status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {crown && crown.tier ? (
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Tier</p>
                    <p className="font-medium">
                      {crown.label || `Tier ${crown.tier}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Expires</p>
                    <p className="font-medium">{fmtDate(crown.expiresAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Source</p>
                    <p className="font-medium">{crown.source || '—'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No active crown subscription.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-3">
                Ruby Crown applications and global crown administration are on the
                Top Spenders page.
              </p>
              <Link to="/topspenders">
                <Button variant="outline">Open Top Spenders</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
}

function VerifyResultCard({ result, onReconcile, reconciling }) {
  if (result.error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm">
        <div className="flex items-center gap-2 text-red-700 font-medium">
          <XCircle className="size-4" /> Verification failed
        </div>
        <p className="mt-1 text-red-700">{result.error}</p>
      </div>
    );
  }

  const { paypal, parsed, ledger, reconcileNeeded, userIdMismatch, orderId } = result;
  const paid = paypal?.status === 'COMPLETED' && paypal?.captureStatus === 'COMPLETED';

  return (
    <div className="rounded-md border bg-white p-4 text-sm space-y-3">
      <div>
        <div className="text-xs text-muted-foreground">Order ID</div>
        <div className="font-mono">
          {orderId} <CopyBtn value={orderId} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">PayPal order status</p>
          <div className="mt-0.5 flex items-center gap-2">
            {paid ? (
              <CheckCircle2 className="size-4 text-green-600" />
            ) : (
              <AlertTriangle className="size-4 text-amber-600" />
            )}
            <span className="font-medium">{paypal?.status || '—'}</span>
            {paypal?.captureStatus ? (
              <Badge variant="outline" className="text-xs">
                capture: {paypal.captureStatus}
              </Badge>
            ) : null}
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">Amount</p>
          <p className="font-medium">{fmtUsd(paypal?.amountUsd)} {paypal?.currency}</p>
        </div>

        {parsed ? (
          <>
            <div>
              <p className="text-xs text-muted-foreground">Package</p>
              <p className="font-medium">
                {parsed.packageName} ({fmtNum(parsed.coins)} coins · {fmtUsd(parsed.usd)})
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Order belongs to user</p>
              <p className={`font-mono text-xs ${userIdMismatch ? 'text-red-600' : ''}`}>
                {parsed.userId}
                {userIdMismatch ? ' (mismatch!)' : ''}
              </p>
            </div>
          </>
        ) : null}
      </div>

      <div className="rounded border bg-gray-50 p-3">
        <p className="text-xs font-medium text-gray-700">Our ledger</p>
        {ledger?.exists ? (
          <div className="mt-1 text-sm">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="size-4" />
              Credited {fmtNum(ledger.coinsCredited)} coins on {fmtDate(ledger.createdAt)}
            </div>
            {ledger.adminReconciledBy ? (
              <p className="mt-1 text-xs text-amber-700">
                Previously reconciled by admin {shortId(ledger.adminReconciledBy)}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="mt-1 flex items-center gap-2 text-amber-700">
            <AlertTriangle className="size-4" /> No ledger entry — user was not credited
          </div>
        )}
      </div>

      {userIdMismatch ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <strong>Cannot credit:</strong> this PayPal order belongs to a different user.
          The reconcile endpoint will refuse this action.
        </div>
      ) : null}

      {reconcileNeeded && !userIdMismatch ? (
        <div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 p-3">
          <div className="text-sm text-amber-900">
            <strong>Action needed:</strong> PayPal received payment but we never credited
            the user. Click to credit them now.
          </div>
          <Button
            onClick={() => onReconcile(orderId)}
            disabled={reconciling}
          >
            {reconciling ? <Loader2 className="size-4 animate-spin" /> : 'Credit user'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
