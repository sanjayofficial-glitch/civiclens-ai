import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Download,
  Filter,
  Map,
  Search,
  ClipboardList,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { GovLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/shared/StatCard';
import { IssueCard } from '@/components/shared/IssueCard';
import { getStatusMeta } from '@/lib/issue-meta';
import type { IssueStatus } from '@blockseblock/shared';
import { useIssues } from '@/hooks/data/useIssues';
import { useCommunityStats } from '@/hooks/data/useAnalytics';
import 'leaflet/dist/leaflet.css';

const pinIcon = L.divIcon({
  className: '',
  html: `<div style="width:20px;height:20px;background:var(--primary);border:2px solid white;border-radius:50%"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const CHART_DATA = [
  { label: 'Mon', value: 12 },
  { label: 'Tue', value: 19 },
  { label: 'Wed', value: 15 },
  { label: 'Thu', value: 22 },
  { label: 'Fri', value: 18 },
  { label: 'Sat', value: 8 },
  { label: 'Sun', value: 5 },
];

export default function GovernmentDashboardPage() {
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  
  const { issues, loading: issuesLoading } = useIssues({}, 500);
  const { stats, loading: statsLoading } = useCommunityStats();

  const queue = issues.filter((i) => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    if (search && !i.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const validIssues = issues.filter(
    (i) => i.location?.geopoint?.latitude != null && i.location?.geopoint?.longitude != null
  );

  const defaultCenter: [number, number] = validIssues.length > 0 
    ? [validIssues[0].location.geopoint.latitude, validIssues[0].location.geopoint.longitude]
    : [40.7128, -74.006];

  const maxChart = Math.max(...CHART_DATA.map((d) => d.value));

  return (
    <GovLayout>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Government Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage and resolve civic issues in your jurisdiction
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/map">
              <Map className="size-4" aria-hidden="true" />
              Full Map
            </Link>
          </Button>
          <Button variant="outline">
            <Download className="size-4" aria-hidden="true" />
            Export
          </Button>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Active Issues"
          value={statsLoading ? '-' : stats?.activeIssues ?? 0}
          icon={ClipboardList}
          trend="+12 this week"
        />
        <StatCard
          label="Resolved This Week"
          value={statsLoading ? '-' : stats?.resolvedThisWeek ?? 0}
          icon={BarChart3}
          trend="+23%"
          trendUp
        />
        <StatCard
          label="Total Reports"
          value={statsLoading ? '-' : stats?.totalReports?.toLocaleString() ?? 0}
          icon={Filter}
        />
        <StatCard
          label="Verifications"
          value={statsLoading ? '-' : stats?.communityVerifications?.toLocaleString() ?? 0}
          icon={Search}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Tabs defaultValue="queue">
            <TabsList>
              <TabsTrigger value="queue">Issue Queue</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="queue" className="mt-4 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search issues..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'reported', 'verified', 'in_progress'] as const).map(
                    (s) => (
                      <Button
                        key={s}
                        variant={statusFilter === s ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setStatusFilter(s)}
                      >
                        {s === 'all' ? 'All' : getStatusMeta(s).label}
                      </Button>
                    ),
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {issuesLoading ? (
                  <p className="text-muted-foreground">Loading queue...</p>
                ) : queue.map((issue, i) => (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.5) }}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex-1">
                        <IssueCard issue={issue} variant="horizontal" />
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button size="sm" variant="outline">
                          Assign
                        </Button>
                        <Button size="sm">Update Status</Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Reports This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex h-48 items-end gap-2">
                    {CHART_DATA.map((d) => (
                      <div
                        key={d.label}
                        className="flex flex-1 flex-col items-center gap-1"
                      >
                        <div
                          className="w-full rounded-t-md bg-primary/80 transition-all"
                          style={{
                            height: `${(d.value / maxChart) * 100}%`,
                            minHeight: '4px',
                          }}
                          role="img"
                          aria-label={`${d.label}: ${d.value} reports`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {d.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {(
                  [
                    'reported',
                    'verified',
                    'in_progress',
                    'resolved',
                  ] as IssueStatus[]
                ).map((status) => {
                  const count = issues.filter(
                    (i) => i.status === status,
                  ).length;
                  const meta = getStatusMeta(status);
                  return (
                    <Card key={status}>
                      <CardContent className="p-4 text-center">
                        <Badge className={meta.softBadge}>{meta.label}</Badge>
                        <p className="mt-2 text-2xl font-bold">{count}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Issue Map</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <MapContainer
                center={defaultCenter}
                zoom={13}
                className="h-64 rounded-b-xl"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {validIssues.map((issue) => (
                  <Marker
                    key={issue.id}
                    position={[
                      issue.location.geopoint.latitude,
                      issue.location.geopoint.longitude,
                    ]}
                    icon={pinIcon}
                  />
                ))}
              </MapContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" fullWidth>
                Bulk Assign Issues
              </Button>
              <Button variant="outline" fullWidth>
                Generate Weekly Report
              </Button>
              <Button variant="outline" fullWidth>
                Configure Notifications
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </GovLayout>
  );
}
