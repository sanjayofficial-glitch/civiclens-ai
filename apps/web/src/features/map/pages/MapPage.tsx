import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import {
  Crosshair,
  Filter,
  Layers,
  Flame,
  Satellite,
  Map as MapIcon,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IssueCard } from '@/components/shared/IssueCard';
import { ISSUE_FILTERS } from '@/lib/constants';
import { getStatusMeta } from '@/lib/issue-meta';
import type { IssueStatus } from '@blockseblock/shared';
import { useIssues } from '@/hooks/data/useIssues';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER: [number, number] = [40.7128, -74.006];
const DEFAULT_ZOOM = 14;

const TILE_LAYERS = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    label: 'Street',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
    label: 'Satellite',
  },
} as const;

type MapLayer = keyof typeof TILE_LAYERS;

const markerIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="width:28px;height:28px;background:var(--primary,#aa3bff);border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function LocateButton() {
  const map = useMap();

  const locate = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.flyTo([pos.coords.latitude, pos.coords.longitude], DEFAULT_ZOOM, { duration: 1.5 });
        },
        () => {
          map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 1 });
        },
      );
    } else {
      map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 1 });
    }
  }, [map]);

  return (
    <div className="absolute bottom-36 right-4 z-[500] pointer-events-auto">
      <Button
        type="button"
        aria-label="Go to current location"
        variant="outline"
        size="icon"
        className="bg-background shadow-md"
        onClick={locate}
      >
        <Crosshair className="size-5" />
      </Button>
    </div>
  );
}

/** Swaps the tile layer when mapLayer changes — must live inside MapContainer */
function TileLayerSwitcher({ layer }: { layer: MapLayer }) {
  const tile = TILE_LAYERS[layer];
  return <TileLayer url={tile.url} attribution={tile.attribution} key={layer} />;
}

export default function MapPage() {
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');
  const { issues, loading } = useIssues(
    statusFilter !== 'all' ? { status: statusFilter } : undefined,
    100,
  );
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [mapLayer, setMapLayer] = useState<MapLayer>('street');
  const [filterOpen, setFilterOpen] = useState(false);
  const [layerOpen, setLayerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const validIssues = issues.filter(
    (i) => i.location?.geopoint?.latitude != null && i.location?.geopoint?.longitude != null,
  );
  const selected = validIssues.find((i) => i.id === selectedId);

  const toggleLayer = () => {
    setMapLayer((l) => (l === 'street' ? 'satellite' : 'street'));
  };

  return (
    <AppLayout className="relative !pb-0">
      <div className="relative h-[calc(100dvh-5rem)]">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          className="size-full z-0"
          zoomControl={false}
        >
          <TileLayerSwitcher layer={mapLayer} />

          <MarkerClusterGroup chunkedLoading>
            {validIssues.map((issue) => (
              <Marker
                key={issue.id}
                position={[issue.location.geopoint.latitude, issue.location.geopoint.longitude]}
                icon={markerIcon}
                eventHandlers={{ click: () => setSelectedId(issue.id) }}
              >
                <Popup>
                  <p className="text-sm font-medium">{issue.title}</p>
                  <Badge className={getStatusMeta(issue.status).softBadge}>
                    {getStatusMeta(issue.status).label}
                  </Badge>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>

          <LocateButton />
        </MapContainer>

        {/* Heatmap overlay */}
        {showHeatmap && (
          <div
            className="pointer-events-none absolute inset-0 z-[400] opacity-40"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(circle at 30% 40%, rgba(170,59,255,0.5) 0%, transparent 40%), radial-gradient(circle at 70% 60%, rgba(255,100,50,0.4) 0%, transparent 35%)',
            }}
          />
        )}

        {/* Top info bar */}
        <div className="absolute left-4 right-4 top-4 z-[500] flex items-center gap-2">
          <div className="glass flex-1 rounded-xl border border-border/50 px-3 py-2">
            <p className="text-sm font-medium">Interactive Map</p>
            <p className="text-xs text-muted-foreground">
              {loading ? 'Loading…' : `${issues.length} issues · ${TILE_LAYERS[mapLayer].label}`}
            </p>
          </div>
        </div>

        {/* Right action buttons */}
        <div className="absolute right-4 top-24 z-[500] flex flex-col gap-2">
          <Button
            type="button"
            aria-label="Toggle filters"
            variant="outline"
            size="icon"
            className="bg-background shadow-md"
            onClick={() => setFilterOpen(true)}
          >
            <Filter className="size-5" />
          </Button>

          <Button
            type="button"
            aria-label={showHeatmap ? 'Hide heatmap' : 'Show heatmap'}
            variant="outline"
            size="icon"
            className={`shadow-md ${showHeatmap ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
            onClick={() => setShowHeatmap(!showHeatmap)}
          >
            <Flame className="size-5" />
          </Button>

          <Button
            type="button"
            aria-label={mapLayer === 'street' ? 'Switch to satellite view' : 'Switch to street view'}
            variant="outline"
            size="icon"
            className={`shadow-md ${mapLayer === 'satellite' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
            onClick={toggleLayer}
            title={mapLayer === 'street' ? 'Satellite view' : 'Street view'}
          >
            {mapLayer === 'street' ? (
              <Satellite className="size-5" />
            ) : (
              <MapIcon className="size-5" />
            )}
          </Button>
        </div>

        {/* Status filter chips */}
        <div className="absolute bottom-24 left-4 right-4 z-[500] flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {ISSUE_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'glass border border-border/50 text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter bottom sheet */}
      <BottomSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        title="Filter Issues"
        description="Show issues by status"
      >
        <div className="flex flex-wrap gap-2 pb-2">
          {ISSUE_FILTERS.map((f) => (
            <Button
              key={f.value}
              variant={statusFilter === f.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter(f.value);
                setFilterOpen(false);
              }}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </BottomSheet>

      {/* Selected issue bottom sheet */}
      <BottomSheet
        open={!!selected}
        onOpenChange={(open) => !open && setSelectedId(null)}
        title={selected?.title}
        description={selected?.location.address}
      >
        {selected ? (
          <div className="space-y-4 pb-2">
            <IssueCard issue={selected} variant="default" />
            <Button fullWidth asChild>
              <Link to={`/issues/${selected.id}`}>View Details</Link>
            </Button>
          </div>
        ) : null}
      </BottomSheet>
    </AppLayout>
  );
}
