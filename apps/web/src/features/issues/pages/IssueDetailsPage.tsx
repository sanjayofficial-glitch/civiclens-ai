import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Share2,
  Flag,
  ThumbsUp,
  ThumbsDown,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Send,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { Separator } from '@/components/ui/separator';
import { getIssueById, MOCK_COMMENTS, MOCK_STATUS_HISTORY, formatRelativeTime } from '@/data/mock-data';
import {
  getCategoryMeta,
  getSeverityMeta,
  getStatusMeta,
} from '@/lib/issue-meta';
import 'leaflet/dist/leaflet.css';

const pinIcon = L.divIcon({
  className: '',
  html: `<div style="width:24px;height:24px;background:var(--primary);border:2px solid white;border-radius:50%"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function IssueDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [loading] = useState(false);
  const [error] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [comment, setComment] = useState('');
  const [upvoted, setUpvoted] = useState(false);

  const issue = id ? getIssueById(id) : undefined;

  if (loading) {
    return (
      <AppLayout hideNav>
        <div className="space-y-4 p-4">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </AppLayout>
    );
  }

  if (error || !issue) {
    return (
      <AppLayout hideNav>
        <ErrorState
          title="Issue not found"
          description="This issue may have been removed or the link is invalid."
          action={
            <Button asChild>
              <Link to="/home">Back to Home</Link>
            </Button>
          }
        />
      </AppLayout>
    );
  }

  const status = getStatusMeta(issue.status);
  const severity = getSeverityMeta(issue.severity);
  const category = getCategoryMeta(issue.category);
  const CategoryIcon = category.icon;
  const images = issue.media.images;

  return (
    <AppLayout hideNav>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/50 bg-background/80 px-4 py-3 pt-safe backdrop-blur-md">
        <Button variant="ghost" size="icon-sm" asChild aria-label="Go back">
          <Link to="/home">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Share issue">
            <Share2 className="size-5" />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Report issue">
            <Flag className="size-5" />
          </Button>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pb-8"
      >
        {images.length > 0 && (
          <div className="relative aspect-video bg-muted">
            <img
              src={images[imageIndex]}
              alt=""
              className="size-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-background/80"
                  onClick={() => setImageIndex((i) => Math.max(0, i - 1))}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-background/80"
                  onClick={() =>
                    setImageIndex((i) => Math.min(images.length - 1, i + 1))
                  }
                  aria-label="Next image"
                >
                  <ChevronRight className="size-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className={`size-1.5 rounded-full ${
                        i === imageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="space-y-6 px-4 py-4">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge className={status.softBadge}>{status.label}</Badge>
              <Badge className={severity.softBadge}>{severity.label}</Badge>
              <Badge className={category.chip}>
                <CategoryIcon className="mr-1 size-3" aria-hidden="true" />
                {category.label}
              </Badge>
            </div>
            <h1 className="text-xl font-bold">{issue.title}</h1>
            <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              {issue.location.address}
            </p>
          </div>

          <section aria-label="Community verification">
            <h2 className="mb-3 text-sm font-semibold">Community Verification</h2>
            <div className="flex items-center gap-3">
              <Button
                variant={upvoted ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUpvoted(!upvoted)}
              >
                <ThumbsUp className="size-4" aria-hidden="true" />
                {issue.verification.upvotes + (upvoted ? 1 : 0)}
              </Button>
              <Button variant="outline" size="sm">
                <ThumbsDown className="size-4" aria-hidden="true" />
                {issue.verification.downvotes}
              </Button>
              <span className="text-xs text-muted-foreground">
                {issue.verification.verifiedBy.length} verified
              </span>
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-semibold">Description</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {issue.description}
            </p>
          </section>

          <section aria-label="Status timeline">
            <h2 className="mb-3 text-sm font-semibold">Status History</h2>
            <div className="space-y-0">
              {MOCK_STATUS_HISTORY.map((entry, i) => {
                const meta = getStatusMeta(entry.status);
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`size-3 rounded-full ${meta.softBadge}`} />
                      {i < MOCK_STATUS_HISTORY.length - 1 && (
                        <div className="w-px flex-1 bg-border" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium">{meta.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(entry.at)} · {entry.by}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section aria-label="Map preview">
            <h2 className="mb-3 text-sm font-semibold">Location</h2>
            <div className="overflow-hidden rounded-xl border border-border/50">
              <MapContainer
                center={[
                  issue.location.geopoint.latitude,
                  issue.location.geopoint.longitude,
                ]}
                zoom={15}
                className="h-40"
                zoomControl={false}
                dragging={false}
                scrollWheelZoom={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker
                  position={[
                    issue.location.geopoint.latitude,
                    issue.location.geopoint.longitude,
                  ]}
                  icon={pinIcon}
                />
              </MapContainer>
            </div>
          </section>

          <Separator />

          <section aria-label="Comments">
            <h2 className="mb-3 text-sm font-semibold">
              Comments ({MOCK_COMMENTS.length})
            </h2>
            <div className="space-y-3">
              {MOCK_COMMENTS.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs">
                      {c.displayName.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 rounded-xl bg-muted/50 p-3">
                    <p className="text-xs font-medium">{c.displayName}</p>
                    <p className="mt-1 text-sm">{c.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatRelativeTime(c.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1"
              />
              <Button size="icon" aria-label="Send comment">
                <Send className="size-4" />
              </Button>
            </div>
          </section>
        </div>
      </motion.div>
    </AppLayout>
  );
}
