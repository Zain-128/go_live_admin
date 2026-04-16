import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import payoutAnalyticsService from '../services/payoutAnalyticsService';

const StreamerRubiesDetail = () => {
  const { streamerId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const formatNumber = (n) => new Intl.NumberFormat('en-US').format(Number(n) || 0);
  const formatUsd = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n) || 0);

  const load = async (page = 1) => {
    if (!streamerId) return;
    try {
      setLoading(true);
      const res = await payoutAnalyticsService.getStreamerDetails(streamerId, {
        streamPage: page,
        streamLimit: 10,
      });
      setData(res);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load streamer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamerId]);

  const s = data?.streamer;
  const sum = data?.summary || {};
  const streams = data?.streams || [];
  const sp = data?.streamPagination || { page: 1, totalPages: 1, totalCount: 0, limit: 10 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Streamer details</h1>
          <p className="text-gray-600 mt-1">Streams (paginated), per-stream gifters, link to reject gifts.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/streamers-rubies')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          All streamers
        </Button>
      </div>

      {loading && !data ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : !s ? (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">Streamer not found</CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{s.name || s.username || 'Streamer'}</CardTitle>
              <CardDescription>{s.email || '—'}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded border">
                <div className="text-xs text-gray-500">Wallet rubies</div>
                <div className="font-semibold text-lg">{formatNumber(s.rubies)}</div>
              </div>
              <div className="p-3 rounded border">
                <div className="text-xs text-gray-500">Lifetime rubies</div>
                <div className="font-semibold">{formatNumber(s.lifetimeRubies)}</div>
              </div>
              <div className="p-3 rounded border">
                <div className="text-xs text-gray-500">Rubies (all streams)</div>
                <div className="font-semibold">{formatNumber(sum.totalRubiesFromStreams)}</div>
              </div>
              <div className="p-3 rounded border">
                <div className="text-xs text-gray-500">Streams counted</div>
                <div className="font-semibold">{formatNumber(sum.streamsCount)}</div>
              </div>
              <div className="p-3 rounded border">
                <div className="text-xs text-gray-500">Coins from streams</div>
                <div className="font-semibold">{formatNumber(sum.totalCoinsFromStreams)}</div>
              </div>
              <div className="p-3 rounded border">
                <div className="text-xs text-gray-500">Purchased coins</div>
                <div className="font-semibold">{formatNumber(sum.totalPurchasedCoins)}</div>
              </div>
              <div className="p-3 rounded border">
                <div className="text-xs text-gray-500">Purchased USD</div>
                <div className="font-semibold">{formatUsd(sum.totalPurchasedUsd)}</div>
              </div>
              <div className="p-3 rounded border">
                <div className="text-xs text-gray-500">Withdraw requests</div>
                <div className="font-semibold">{formatNumber(sum.withdrawRequestsCount)}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Streams & gifters</CardTitle>
              <CardDescription>
                Each row lists gifters for that stream (aggregated). Use “Manage gifts” to paginate transactions
                and reject individual gifts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Stream</TableHead>
                      <TableHead>Ended</TableHead>
                      <TableHead>Coins</TableHead>
                      <TableHead>Rubies</TableHead>
                      <TableHead>Gifters</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {streams.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                          No stream earnings for this streamer yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      streams.map((st) => {
                        const gifters = st.gifters || [];
                        const preview = gifters
                          .slice(0, 3)
                          .map((g) => g.gifter?.name || g.gifter?.username || '—')
                          .join(', ');
                        return (
                          <TableRow key={String(st.streamId)}>
                            <TableCell>
                              <div className="font-medium">{st.title || 'Live stream'}</div>
                              <div className="text-xs text-gray-500">{String(st.streamId)}</div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {st.streamEndedAt
                                ? new Date(st.streamEndedAt).toLocaleString()
                                : st.streamStartedAt
                                  ? new Date(st.streamStartedAt).toLocaleString()
                                  : '—'}
                            </TableCell>
                            <TableCell>{formatNumber(st.totalCoinsReceived)}</TableCell>
                            <TableCell>{formatNumber(st.streamerRubies)}</TableCell>
                            <TableCell>
                              <div className="text-sm">{formatNumber(gifters.length)} gifter(s)</div>
                              {preview ? (
                                <div className="text-xs text-gray-500 truncate max-w-[220px]" title={preview}>
                                  {preview}
                                  {gifters.length > 3 ? '…' : ''}
                                </div>
                              ) : null}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() =>
                                  navigate(`/streamers-rubies/${streamerId}/streams/${st.streamId}`)
                                }
                              >
                                Manage gifts
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
                  Streams page {sp.page} of {sp.totalPages} ({formatNumber(sp.totalCount)} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={Number(sp.page) <= 1 || loading}
                    onClick={() => load(Number(sp.page) - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={Number(sp.page) >= Number(sp.totalPages) || loading}
                    onClick={() => load(Number(sp.page) + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default StreamerRubiesDetail;
