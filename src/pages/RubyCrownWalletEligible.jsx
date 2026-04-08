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
import { Crown, Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { rubyCrownWalletService } from '../services/rubyCrownWalletService';

const RubyCrownWalletEligible = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [busyId, setBusyId] = useState(null);

  const fetchList = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const result = await rubyCrownWalletService.getEligibleUsers({
          page,
          limit: 15,
          search: search || undefined,
        });
        setRows(result.data || []);
        setPagination({
          page: result.pagination?.page || 1,
          totalPages: result.pagination?.totalPages || 1,
          total: result.pagination?.total ?? 0,
        });
      } catch (e) {
        console.error(e);
        toast.error(e?.response?.data?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    },
    [search]
  );

  useEffect(() => {
    fetchList(1);
  }, [fetchList]);

  const handleSearch = () => {
    setSearch(searchInput.trim());
  };

  const assign = async (user) => {
    const id = user._id || user.id;
    if (!id) return;
    try {
      setBusyId(id);
      await rubyCrownWalletService.assignRuby(id);
      toast.success('Ruby Crown assigned (30 days)');
      fetchList(pagination.page);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Assign failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-rose-600" />
            <CardTitle>Ruby Crown — monthly USD spend ($30k+)</CardTitle>
          </div>
          <CardDescription>
            Users who spent at least $30,000 USD on coin purchases in the current calendar month (IAP). Assign Ruby only
            when the user is eligible: same rules as in-app apply — top 30 by monthly USD spend and an available Ruby slot.
            Wallet balance does not matter. Streams and comments show the crown like other Ruby tiers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
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
                  <TableHead>Ruby</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                )}
                {!loading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No users at $30k+ USD spend this month.
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  rows.map((u) => {
                    const id = u._id || u.id;
                    const busy = busyId === id;
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
                          {u.hasActiveRuby ? (
                            <Badge className="bg-rose-700">Active</Badge>
                          ) : (
                            <Badge variant="secondary">—</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            disabled={busy || u.hasActiveRuby}
                            onClick={() => assign(u)}
                          >
                            {u.hasActiveRuby ? 'Already Ruby' : busy ? '…' : 'Assign Ruby'}
                          </Button>
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
    </div>
  );
};

export default RubyCrownWalletEligible;
