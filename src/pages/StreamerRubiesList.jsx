import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import payoutAnalyticsService from '../services/payoutAnalyticsService';

const StreamerRubiesList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 1,
  });

  const formatNumber = (n) => new Intl.NumberFormat('en-US').format(Number(n) || 0);

  const fetchData = async (page = 1, q = search) => {
    try {
      setLoading(true);
      const data = await payoutAnalyticsService.getStreamers({
        page,
        limit: 20,
        search: q?.trim() || undefined,
      });
      setRows(data.streamers || []);
      const p = data.pagination || {};
      setPagination({
        page: Number(p.page) || 1,
        limit: Number(p.limit) || 20,
        totalCount: Number(p.totalCount) || 0,
        totalPages: Number(p.totalPages) || 1,
      });
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load streamers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, '');
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Streamers & rubies</h1>
        <p className="text-gray-600 mt-1">
          All streamers with wallet rubies and earnings from completed streams. Open details to paginate
          streams, see gifters, and remove individual gifts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Streamer directory</CardTitle>
          <CardDescription>Search by name, username, or email.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Search streamers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline" onClick={() => fetchData(1, search)}>
              Search
            </Button>
          </div>

          {loading && rows.length === 0 ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Streamer</TableHead>
                      <TableHead>Wallet rubies</TableHead>
                      <TableHead>Lifetime rubies</TableHead>
                      <TableHead>Rubies (streams)</TableHead>
                      <TableHead>Streams</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                          No streamers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      rows.map((row) => {
                        const u = row.user || {};
                        const sid = u._id;
                        const sum = row.summary || {};
                        return (
                          <TableRow key={String(sid)}>
                            <TableCell>
                              <div className="font-medium">{u.name || u.username || 'Unknown'}</div>
                              <div className="text-xs text-gray-500">{u.email || '—'}</div>
                            </TableCell>
                            <TableCell className="font-semibold">{formatNumber(u.rubies)}</TableCell>
                            <TableCell>{formatNumber(u.lifetimeRubies)}</TableCell>
                            <TableCell>{formatNumber(sum.totalRubiesFromStreams)}</TableCell>
                            <TableCell>{formatNumber(sum.streamsCount)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/streamers-rubies/${sid}`)}
                              >
                                Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.totalPages} — {formatNumber(pagination.totalCount)}{' '}
                  streamers
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => fetchData(pagination.page - 1, search)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => fetchData(pagination.page + 1, search)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StreamerRubiesList;
