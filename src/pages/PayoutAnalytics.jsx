import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import payoutAnalyticsService from "../services/payoutAnalyticsService";

const PayoutAnalytics = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [listData, setListData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0, limit: 20 });
  const [search, setSearch] = useState("");
  const [selectedStreamerId, setSelectedStreamerId] = useState("");
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const formatNumber = (value) => new Intl.NumberFormat("en-US").format(value || 0);
  const formatUsd = (value) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0);

  const fetchStreamers = async (page = 1, searchValue = search) => {
    try {
      setLoading(true);
      const data = await payoutAnalyticsService.getStreamers({ page, limit: 20, search: searchValue || undefined });
      setListData(data.streamers || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, totalCount: 0, limit: 20 });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch payout analytics");
    } finally {
      setLoading(false);
    }
  };

  const fetchStreamerDetails = async (streamerId, page = 1) => {
    if (!streamerId) return;
    try {
      setDetailsLoading(true);
      const data = await payoutAnalyticsService.getStreamerDetails(streamerId, {
        streamPage: page,
        streamLimit: 10,
      });
      setDetails(data);
      setSelectedStreamerId(streamerId);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch streamer details");
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchStreamers();
  }, []);

  useEffect(() => {
    const initialStreamerId = searchParams.get("streamerId");
    if (initialStreamerId) {
      fetchStreamerDetails(initialStreamerId, 1);
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payout Analytics</h1>
        <p className="text-gray-600 mt-1">
          Streamer-wise earnings, stream gifters, coin purchases, and withdrawals.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Streamer List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Search streamer by name, username, email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button onClick={() => fetchStreamers(1, search)}>Search</Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Streamer</TableHead>
                  <TableHead>Streams</TableHead>
                  <TableHead>Earned (Rubies)</TableHead>
                  <TableHead>Stream Coins</TableHead>
                  <TableHead>Purchased (USD)</TableHead>
                  <TableHead>Withdraw Requested</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : listData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No data found
                    </TableCell>
                  </TableRow>
                ) : (
                  listData.map((row) => (
                    <TableRow key={row.user?._id}>
                      <TableCell>
                        <div className="font-medium">{row.user?.name || row.user?.username || "Unknown"}</div>
                        <div className="text-xs text-gray-500">{row.user?.email || "-"}</div>
                      </TableCell>
                      <TableCell>{formatNumber(row.summary?.streamsCount)}</TableCell>
                      <TableCell>{formatNumber(row.summary?.totalRubiesFromStreams)}</TableCell>
                      <TableCell>{formatNumber(row.summary?.totalCoinsFromStreams)}</TableCell>
                      <TableCell>{formatUsd(row.summary?.totalPurchasedUsd)}</TableCell>
                      <TableCell>{formatUsd(row.summary?.totalWithdrawRequestedUsd)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fetchStreamerDetails(row.user?._id, 1)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-between mt-4">
            <span className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} streamers)
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => fetchStreamers(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchStreamers(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedStreamerId && (
        <Card>
          <CardHeader>
            <CardTitle>
              Streamer Details {details?.streamer ? `- ${details.streamer.name || details.streamer.username}` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {detailsLoading ? (
              <div className="text-center py-10">Loading streamer details...</div>
            ) : !details ? null : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded border">
                    <div className="text-xs text-gray-500">Total Rubies Earned</div>
                    <div className="font-semibold">{formatNumber(details.summary?.totalRubiesFromStreams)}</div>
                  </div>
                  <div className="p-3 rounded border">
                    <div className="text-xs text-gray-500">Stream Coins</div>
                    <div className="font-semibold">{formatNumber(details.summary?.totalCoinsFromStreams)}</div>
                  </div>
                  <div className="p-3 rounded border">
                    <div className="text-xs text-gray-500">Coin Purchases</div>
                    <div className="font-semibold">{formatUsd(details.summary?.totalPurchasedUsd)}</div>
                  </div>
                  <div className="p-3 rounded border">
                    <div className="text-xs text-gray-500">Withdraw Approved</div>
                    <div className="font-semibold">{formatUsd(details.summary?.totalWithdrawApprovedUsd)}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Live Streams & Gifters</h3>
                  <div className="space-y-4">
                    {(details.streams || []).map((stream) => (
                      <div key={stream.streamId} className="rounded-md border p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="font-medium">{stream.title || "Live Stream"}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(stream.streamStartedAt).toLocaleString()} -{" "}
                              {stream.streamEndedAt ? new Date(stream.streamEndedAt).toLocaleString() : "Live"}
                            </div>
                          </div>
                          <div className="text-sm text-gray-700">
                            Coins: {formatNumber(stream.totalCoinsReceived)} | Rubies:{" "}
                            {formatNumber(stream.streamerRubies)}
                          </div>
                        </div>

                        <div className="rounded border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Gifter</TableHead>
                                <TableHead>Coins Gifted</TableHead>
                                <TableHead>Gift Items</TableHead>
                                <TableHead>Transactions</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {stream.gifters?.length ? (
                                stream.gifters.map((gifter) => (
                                  <TableRow key={`${stream.streamId}-${gifter.gifter?._id}`}>
                                    <TableCell>
                                      <div className="font-medium">
                                        {gifter.gifter?.name || gifter.gifter?.username || "Unknown"}
                                      </div>
                                      <div className="text-xs text-gray-500">{gifter.gifter?.email || "-"}</div>
                                    </TableCell>
                                    <TableCell>{formatNumber(gifter.totalCoinsGifted)}</TableCell>
                                    <TableCell>{formatNumber(gifter.totalGiftItems)}</TableCell>
                                    <TableCell>{formatNumber(gifter.giftsTransactionsCount)}</TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          navigate(`/payout-analytics/gifters/${gifter.gifter?._id}`)
                                        }
                                      >
                                        Open Gifter
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={5} className="text-center text-gray-500 py-6">
                                    No gifters for this stream
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PayoutAnalytics;
