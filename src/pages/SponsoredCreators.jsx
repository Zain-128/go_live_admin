import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Sparkles, Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { sponsoredService } from '../services/sponsoredService';

const statusBadge = (s) => {
  const v = (s || '').toLowerCase();
  if (v === 'pending') return <Badge variant="secondary">Pending</Badge>;
  if (v === 'accepted') return <Badge className="bg-emerald-600">Accepted</Badge>;
  if (v === 'rejected') return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="outline">{s || '—'}</Badge>;
};

const SponsoredCreators = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalUsers: 0,
  });
  const [busyId, setBusyId] = useState(null);

  const fetchUsers = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const result = await sponsoredService.getSponsoredUsers({
          page,
          limit: 15,
          status: statusFilter,
          search: search || undefined,
        });
        setUsers(result.users || []);
        setPagination({
          current: result.pagination?.current || 1,
          total: result.pagination?.total || 1,
          totalUsers: result.pagination?.totalUsers ?? 0,
        });
      } catch (e) {
        console.error(e);
        toast.error('Failed to load sponsored applications');
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, search]
  );

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleAccept = async (user) => {
    const id = user._id || user.id;
    if (!id) return;
    try {
      setBusyId(id);
      await sponsoredService.updateUserSponsored(id, {
        sponsoredStatus: 'accepted',
        sponsoredActive: true,
      });
      toast.success('Creator accepted and activated');
      fetchUsers(pagination.current);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (user) => {
    const id = user._id || user.id;
    if (!id) return;
    try {
      setBusyId(id);
      await sponsoredService.updateUserSponsored(id, {
        sponsoredStatus: 'rejected',
        sponsoredActive: false,
      });
      toast.success('Application rejected');
      fetchUsers(pagination.current);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleActive = async (user, checked) => {
    const id = user._id || user.id;
    if (!id) return;
    try {
      setBusyId(id);
      await sponsoredService.updateUserSponsored(id, {
        sponsoredActive: checked,
      });
      toast.success(checked ? 'Sponsored visibility on' : 'Sponsored visibility off');
      fetchUsers(pagination.current);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-violet-600" />
            Sponsored creators
          </h1>
          <p className="text-muted-foreground mt-1">
            Review applications, accept or reject, and toggle active visibility for approved creators.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchUsers(pagination.current)} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Applications &amp; status</CardTitle>
          <CardDescription>Only users who have applied or been processed appear here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'pending', label: 'Pending' },
                { key: 'accepted', label: 'Accepted' },
                { key: 'rejected', label: 'Rejected' },
              ].map((t) => (
                <Button
                  key={t.key}
                  variant={statusFilter === t.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(t.key)}
                >
                  {t.label}
                </Button>
              ))}
            </div>
            <form onSubmit={onSearchSubmit} className="flex w-full max-w-md gap-2">
              <Input
                placeholder="Search name or email…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Button type="submit" variant="secondary">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                      No records for this filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => {
                    const id = u._id || u.id;
                    const email = u.email || '';
                    const name = u.name || u.firstName || '—';
                    const pending = (u.sponsoredStatus || '').toLowerCase() === 'pending';
                    const accepted = (u.sponsoredStatus || '').toLowerCase() === 'accepted';
                    const busy = busyId === id;
                    return (
                      <TableRow key={id}>
                        <TableCell>
                          <div className="font-medium">{name}</div>
                          <div className="text-xs text-muted-foreground">{email}</div>
                        </TableCell>
                        <TableCell>{statusBadge(u.sponsoredStatus)}</TableCell>
                        <TableCell>
                          {accepted ? (
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={!!u.sponsoredActive}
                                disabled={busy}
                                onCheckedChange={(c) => handleToggleActive(u, c)}
                              />
                              <span className="text-sm text-muted-foreground">
                                {u.sponsoredActive ? 'Visible' : 'Hidden'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {pending && (
                            <>
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                disabled={busy}
                                onClick={() => handleAccept(u)}
                              >
                                Accept
                              </Button>
                              <Button size="sm" variant="destructive" disabled={busy} onClick={() => handleReject(u)}>
                                Reject
                              </Button>
                            </>
                          )}
                          {accepted && !u.sponsoredActive && (
                            <Button size="sm" variant="outline" disabled={busy} onClick={() => handleAccept(u)}>
                              Reactivate
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {pagination.total > 1 && (
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>
                Page {pagination.current} of {pagination.total} ({pagination.totalUsers} total)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading || pagination.current <= 1}
                  onClick={() => fetchUsers(pagination.current - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading || pagination.current >= pagination.total}
                  onClick={() => fetchUsers(pagination.current + 1)}
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

export default SponsoredCreators;
