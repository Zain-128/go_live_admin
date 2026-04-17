import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Select, SelectItem } from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import { Crown, Search, RefreshCw, CrownIcon, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { topSpendersService } from '../services/topSpendersService';

const SORT_OPTIONS = [
  { value: 'usd_desc', label: 'USD (high → low)' },
  { value: 'usd_asc', label: 'USD (low → high)' },
  { value: 'coins_desc', label: 'Coins (high → low)' },
  { value: 'coins_asc', label: 'Coins (low → high)' },
  { value: 'rubies_desc', label: 'Rubies (high → low)' },
  { value: 'rubies_asc', label: 'Rubies (low → high)' },
  { value: 'name_asc', label: 'Name (A → Z)' },
];

const FILTER_OPTIONS = [
  { value: 'all', label: 'All spenders' },
  { value: 'ruby', label: 'With Ruby Crown' },
  { value: 'no_ruby', label: 'Without Ruby Crown' },
  { value: 'has_coins', label: 'Has coins (> 0)' },
  { value: 'no_coins', label: 'No coins (= 0)' },
  { value: 'has_rubies', label: 'Has rubies (> 0)' },
  { value: 'no_rubies', label: 'No rubies (= 0)' },
];

const TopSpenders = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('usd_desc');
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [dialog, setDialog] = useState(null); // { mode: 'assign' | 'revoke', user }
  const [acting, setActing] = useState(false);

  const fetchList = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const result = await topSpendersService.getTopSpenders({
          page,
          limit: 15,
          search: search || undefined,
          sort,
          filter,
        });
        setRows(result.data || []);
        setPagination({
          page: result.pagination?.page || 1,
          totalPages: result.pagination?.totalPages || 1,
          total: result.pagination?.total ?? 0,
        });
      } catch (e) {
        console.error(e);
        toast.error(e?.response?.data?.message || 'Failed to load top spenders');
      } finally {
        setLoading(false);
      }
    },
    [search, sort, filter]
  );

  useEffect(() => {
    fetchList(1);
  }, [fetchList]);

  const handleSearch = () => {
    setSearch(searchInput.trim());
  };

  const openAssign = (user) => setDialog({ mode: 'assign', user });
  const openRevoke = (user) => setDialog({ mode: 'revoke', user });
  const closeDialog = () => {
    if (!acting) setDialog(null);
  };

  const confirmAction = async () => {
    if (!dialog) return;
    const id = dialog.user._id || dialog.user.id;
    if (!id) return;
    try {
      setActing(true);
      if (dialog.mode === 'assign') {
        await topSpendersService.assignRuby(id);
        toast.success('Ruby Crown assigned (30 days)');
      } else {
        await topSpendersService.revokeRuby(id);
        toast.success('Ruby Crown revoked');
      }
      setDialog(null);
      fetchList(pagination.page);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Action failed');
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-rose-600" />
            <CardTitle>Top Spenders</CardTitle>
          </div>
          <CardDescription>
            All users who made coin purchases this calendar month, sorted by USD spend. Sort and filter below. Admin can
            grant or revoke the Ruby Crown on any user from this page — no threshold, no rank, no slot check.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2 flex-1 min-w-[220px]">
              <Input
                placeholder="Search name, username, email…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button type="button" variant="secondary" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="w-48">
              <Select value={sort} onValueChange={setSort} placeholder="Sort">
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div className="w-48">
              <Select value={filter} onValueChange={setFilter} placeholder="Filter">
                {FILTER_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <Button type="button" variant="outline" onClick={() => fetchList(pagination.page)} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>USD (month)</TableHead>
                  <TableHead>Wallet (coins)</TableHead>
                  <TableHead>Rubies</TableHead>
                  <TableHead>Ruby Crown</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                )}
                {!loading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No spenders match these filters this month.
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  rows.map((u) => {
                    const id = u._id || u.id;
                    return (
                      <TableRow key={id}>
                        <TableCell className="font-medium">{u.name || '—'}</TableCell>
                        <TableCell>{u.username || '—'}</TableCell>
                        <TableCell>
                          {typeof u.totalUsdThisMonth === 'number'
                            ? `$${u.totalUsdThisMonth.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                            : '—'}
                        </TableCell>
                        <TableCell>
                          {typeof u.coins === 'number' ? u.coins.toLocaleString() : '—'}
                        </TableCell>
                        <TableCell>
                          {typeof u.rubies === 'number' ? u.rubies.toLocaleString() : '—'}
                        </TableCell>
                        <TableCell>
                          {u.hasActiveRuby ? (
                            <Badge className="bg-rose-700">Active</Badge>
                          ) : (
                            <Badge variant="secondary">—</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {u.hasActiveRuby ? (
                            <Button size="sm" variant="destructive" onClick={() => openRevoke(u)}>
                              <XCircle className="h-4 w-4 mr-1" />
                              Revoke
                            </Button>
                          ) : (
                            <Button size="sm" onClick={() => openAssign(u)}>
                              <CrownIcon className="h-4 w-4 mr-1" />
                              Give Ruby
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1 || loading}
                  onClick={() => fetchList(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages || loading}
                  onClick={() => fetchList(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!dialog} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          {dialog && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {dialog.mode === 'assign' ? 'Give Ruby Crown' : 'Revoke Ruby Crown'}
                </DialogTitle>
                <DialogDescription>
                  {dialog.mode === 'assign'
                    ? `Grant a 30-day Ruby Crown to ${dialog.user.name || dialog.user.username || 'this user'}? This bypasses the monthly USD / rank / slot rules.`
                    : `Remove the active Ruby Crown from ${dialog.user.name || dialog.user.username || 'this user'}? They will lose the crown immediately.`}
                </DialogDescription>
              </DialogHeader>
              <div className="text-sm space-y-1 text-muted-foreground">
                <div>Username: <span className="text-foreground">{dialog.user.username || '—'}</span></div>
                <div>
                  USD this month:{' '}
                  <span className="text-foreground">
                    {typeof dialog.user.totalUsdThisMonth === 'number'
                      ? `$${dialog.user.totalUsdThisMonth.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                      : '—'}
                  </span>
                </div>
                <div>
                  Wallet:{' '}
                  <span className="text-foreground">
                    {typeof dialog.user.coins === 'number' ? dialog.user.coins.toLocaleString() : '—'} coins
                  </span>
                </div>
                <div>
                  Rubies:{' '}
                  <span className="text-foreground">
                    {typeof dialog.user.rubies === 'number' ? dialog.user.rubies.toLocaleString() : '—'}
                  </span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeDialog} disabled={acting}>
                  Cancel
                </Button>
                <Button
                  variant={dialog.mode === 'revoke' ? 'destructive' : 'default'}
                  onClick={confirmAction}
                  disabled={acting}
                >
                  {acting ? 'Working…' : dialog.mode === 'assign' ? 'Give Ruby Crown' : 'Revoke Ruby Crown'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TopSpenders;
