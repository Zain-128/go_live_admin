import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import payoutAnalyticsService from '../services/payoutAnalyticsService';
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

const WithdrawRequestStreamDetails = () => {
  const navigate = useNavigate();
  const { id, streamId } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [giftersPage, setGiftersPage] = useState(1);
  const GIFTERS_PAGE_SIZE = 10;

  const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value || 0);

  const allGifters = data?.gifters || [];
  const giftersTotalPages = Math.max(1, Math.ceil(allGifters.length / GIFTERS_PAGE_SIZE));
  const currentGiftersPage = Math.min(giftersPage, giftersTotalPages);
  const paginatedGifters = allGifters.slice(
    (currentGiftersPage - 1) * GIFTERS_PAGE_SIZE,
    currentGiftersPage * GIFTERS_PAGE_SIZE
  );

  useEffect(() => {
    const fetchStreamDetails = async () => {
      if (!streamId) return;
      try {
        setLoading(true);
        const result = await payoutAnalyticsService.getStreamDetails(streamId);
        setData(result);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load stream gifting details');
      } finally {
        setLoading(false);
      }
    };
    fetchStreamDetails();
  }, [streamId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stream Gifting Details</h1>
          <p className="text-gray-600 mt-1">User-wise gifting breakdown for this stream.</p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/withdraw-requests/${id}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : !data ? (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">No data found</CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{data.stream?.title || 'Live Stream'}</CardTitle>
              <CardDescription>
                Streamer: {data.stream?.streamer?.name || data.stream?.streamer?.username || 'Unknown'}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded border">
                <div className="text-xs text-gray-500">Coins Received</div>
                <div className="font-semibold">{formatNumber(data.stream?.totalCoinsReceived)}</div>
              </div>
              <div className="p-3 rounded border">
                <div className="text-xs text-gray-500">Rubies Earned</div>
                <div className="font-semibold">{formatNumber(data.stream?.streamerRubies)}</div>
              </div>
              <div className="p-3 rounded border">
                <div className="text-xs text-gray-500">Total Gifters</div>
                <div className="font-semibold">{formatNumber(data.gifterSummary?.totalGifters)}</div>
              </div>
              <div className="p-3 rounded border">
                <div className="text-xs text-gray-500">Gift Transactions</div>
                <div className="font-semibold">{formatNumber(data.gifterSummary?.totalGiftTransactions)}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gifters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Gifter</TableHead>
                      <TableHead>Coins Gifted</TableHead>
                      <TableHead>Gift Items</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead>First Gift</TableHead>
                      <TableHead>Last Gift</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedGifters.length ? (
                      paginatedGifters.map((row) => (
                        <TableRow key={row.gifter?._id}>
                          <TableCell>
                            <div className="font-medium">{row.gifter?.name || row.gifter?.username || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">{row.gifter?.email || '-'}</div>
                          </TableCell>
                          <TableCell>{formatNumber(row.totalCoinsGifted)}</TableCell>
                          <TableCell>{formatNumber(row.totalGiftItems)}</TableCell>
                          <TableCell>{formatNumber(row.giftsTransactionsCount)}</TableCell>
                          <TableCell>{row.firstGiftAt ? new Date(row.firstGiftAt).toLocaleString() : '-'}</TableCell>
                          <TableCell>{row.lastGiftAt ? new Date(row.lastGiftAt).toLocaleString() : '-'}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/withdraw-requests/gifters/${row.gifter?._id}`)}
                            >
                              Gifter Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No gifting found for this stream
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-gray-500">
                  Page {currentGiftersPage} of {giftersTotalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentGiftersPage <= 1}
                    onClick={() => setGiftersPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentGiftersPage >= giftersTotalPages}
                    onClick={() => setGiftersPage((p) => Math.min(giftersTotalPages, p + 1))}
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

export default WithdrawRequestStreamDetails;
