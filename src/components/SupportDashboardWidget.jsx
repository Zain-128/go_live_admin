import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LifeBuoy, Inbox, Hourglass, UserCheck, Clock } from 'lucide-react';
import { supportService } from '../services/supportService';

function formatDuration(ms) {
  if (!ms || ms <= 0) return '—';
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}

export default function SupportDashboardWidget() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const s = await supportService.getStats();
        if (!cancelled) setStats(s);
      } catch {
        /* ignore — probably not authed yet */
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  if (!stats) return null;

  const cards = [
    { label: 'Open', value: stats.open ?? 0, icon: Inbox, tone: 'text-blue-600' },
    { label: 'In Progress', value: stats.in_progress ?? 0, icon: Hourglass, tone: 'text-amber-600' },
    { label: 'Awaiting User', value: stats.awaiting_user ?? 0, icon: UserCheck, tone: 'text-purple-600' },
    {
      label: 'Avg first response',
      value: formatDuration(stats.avgFirstResponseMs),
      icon: Clock,
      tone: 'text-gray-700',
      hint: stats.avgFirstResponseSampleSize ? `last 30d · n=${stats.avgFirstResponseSampleSize}` : 'no data yet',
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <LifeBuoy className="w-5 h-5 text-blue-600" />
          Support
        </h2>
        <Link to="/support" className="text-sm text-blue-600 hover:underline">Open queue →</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{c.label}</CardTitle>
                <Icon className={`h-4 w-4 ${c.tone}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${c.tone}`}>{c.value}</div>
                {c.hint && <p className="text-xs text-muted-foreground">{c.hint}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
