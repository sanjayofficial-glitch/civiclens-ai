import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  XCircle,
  MoreVertical,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatRelativeTime } from '@/lib/constants';
import {
  getCategoryMeta,
  getSeverityMeta,
  getStatusMeta,
} from '@/lib/issue-meta';
import 'leaflet/dist/leaflet.css';

import { useIssue } from '@/hooks/data/useIssue';
import { useComments } from '@/hooks/data/useComments';
import { useUserVote } from '@/hooks/data/useUserVote';
import { CommentService } from '@/services/comment.service';
import { VoteService } from '@/services/vote.service';
import { IssueService } from '@/services/issue.service';
import { useAuth } from '@/hooks/useAuth';

const pinIcon = L.divIcon({
  className: '',
  html: `<div style="width:24px;height:24px;background:var(--primary);border:2px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.3)"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const STATUS_TIMELINE = [
  { status: 'reported',    label: 'Reported',     icon: AlertTriangle,  color: 'text-orange-500' },
  { status: 'verified',    label: 'Verified',     icon: CheckCircle2,   color: 'text-blue-500'   },
  { status: 'in_progress', label: 'In Progress',  icon: Wrench,         color: 'text-yellow-500' },
  { status: 'resolved',    label: 'Resolved',     icon: CheckCircle2,   color: 'text-green-500'  },
  { status: 'rejected',    label: 'Rejected',     icon: XCircle,        color: 'text-red-500'    },
] as const;

const STATUS_ORDER = ['reported', 'verified', 'in_progress', 'resolved'] as const;

export default function IssueDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { issue, loading: issueLoading, error: issueError } = useIssue(id);
  const { comments, loading: commentsLoading } = useComments(id);
  const { userVote, setUserVote } = useUserVote(id);
  const { user } = useAuth();

  const [imageIndex, setImageIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [deletingComment, setDeletingComment] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [deleting, setDeleting] = useState(false);

  if (issueLoading) {
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

  if (issueError || !issue) {
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
  const images = issue.media?.images || [];
  const isOwner = user?.uid === issue.reporterId;
  const canDelete = isOwner && (issue.status === 'resolved' || issue.status === 'rejected');

  // Build a timeline showing which statuses have been passed through
  const currentStatusIdx = STATUS_ORDER.indexOf(issue.status as (typeof STATUS_ORDER)[number]);
  const isRejected = issue.status === 'rejected';

  const handleVote = async (type: 'upvote' | 'downvote') => {
    if (!user || !id) {
      toast.error('Sign in to vote on issues.');
      return;
    }
    await VoteService.castVote(id, user.uid, type);
    setUserVote(userVote === type ? null : type);
  };

  const handleComment = async () => {
    if (!user || !id) {
      toast.error('Sign in to leave a comment.');
      return;
    }
    if (!commentText.trim()) return;
    const text = commentText.trim();
    setCommentText('');
    setDeletingComment(true);
    try {
      await CommentService.create({ issueId: id, userId: user.uid, text });
    } catch {
      toast.error('Failed to post comment. Please try again.');
      setCommentText(text);
    } finally {
      setDeletingComment(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: issue.title,
      text: `Check out this civic issue: ${issue.title}`,
      url,
    };
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled — not an error
        if ((err as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(url);
          toast.success('Link copied to clipboard!');
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      } catch {
        toast.error('Could not copy link.');
      }
    }
  };

  const handleFlag = async () => {
    if (!flagReason.trim()) {
      toast.error('Please describe the reason for flagging.');
      return;
    }
    // In a real app this would write to a reports collection
    toast.success('Issue has been flagged for review. Thank you!');
    setShowFlagDialog(false);
    setFlagReason('');
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await IssueService.delete(id);
      toast.success('Report deleted successfully.');
      navigate('/home');
    } catch {
      toast.error('Failed to delete. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <AppLayout hideNav>
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/50 bg-background/80 px-4 py-3 pt-safe backdrop-blur-md">
        <Button variant="ghost" size="icon-sm" asChild aria-label="Go back">
          <Link to="/home">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>

        <div className="flex items-center gap-1">
          {/* Share */}
          <Button variant="ghost" size="icon-sm" aria-label="Share issue" onClick={handleShare}>
            <Share2 className="size-5" />
          </Button>

          {/* More menu (Flag + Delete if eligible) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="More options">
                <MoreVertical className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setShowFlagDialog(true)} className="gap-2">
                <Flag className="size-4 text-warning" />
                Flag issue
              </DropdownMenuItem>
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="gap-2 text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    Delete report
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10">
        {/* Image gallery */}
        {images.length > 0 && (
          <div className="relative aspect-video bg-muted">
            <img src={images[imageIndex]} alt="" className="size-full object-cover" />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-background/80 shadow"
                  onClick={() => setImageIndex((i) => Math.max(0, i - 1))}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-background/80 shadow"
                  onClick={() => setImageIndex((i) => Math.min(images.length - 1, i + 1))}
                  aria-label="Next image"
                >
                  <ChevronRight className="size-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className={`block size-1.5 rounded-full transition-colors ${
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
          {/* Title + badges */}
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge className={status.softBadge}>{status.label}</Badge>
              <Badge className={severity.softBadge}>{severity.label}</Badge>
              <Badge className={category.chip}>
                <CategoryIcon className="mr-1 size-3" aria-hidden="true" />
                {category.label}
              </Badge>
            </div>
            <h1 className="text-xl font-bold leading-tight">{issue.title}</h1>
            <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              {issue.location.address}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Reported {formatRelativeTime(issue.createdAt)}
            </p>
          </div>

          {/* Verification / voting */}
          <section aria-label="Community verification">
            <h2 className="mb-3 text-sm font-semibold">Community Verification</h2>
            <div className="flex items-center gap-3">
              <Button
                variant={userVote === 'upvote' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleVote('upvote')}
                className="gap-1.5"
              >
                <ThumbsUp className="size-4" aria-hidden="true" />
                {issue.verification?.upvotes ?? 0}
              </Button>
              <Button
                variant={userVote === 'downvote' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleVote('downvote')}
                className="gap-1.5"
              >
                <ThumbsDown className="size-4" aria-hidden="true" />
                {issue.verification?.downvotes ?? 0}
              </Button>
              <span className="text-xs text-muted-foreground">
                {(issue.verification?.verifiedBy ?? []).length} verified
              </span>
            </div>
          </section>

          {/* Description */}
          <section>
            <h2 className="mb-2 text-sm font-semibold">Description</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {issue.description || 'No description provided.'}
            </p>
          </section>

          {/* AI tags */}
          {issue.aiAnalysis?.suggestedTags && issue.aiAnalysis.suggestedTags.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold">Tags</h2>
              <div className="flex flex-wrap gap-1.5">
                {issue.aiAnalysis.suggestedTags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>
                ))}
              </div>
            </section>
          )}

          {/* Status timeline */}
          <section aria-label="Status timeline">
            <h2 className="mb-4 text-sm font-semibold">Progress</h2>
            {isRejected ? (
              <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                <XCircle className="size-5 shrink-0 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-destructive">Rejected</p>
                  <p className="text-xs text-muted-foreground">
                    This report was reviewed and rejected.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative flex items-start justify-between gap-1 px-1">
                {/* connecting line */}
                <div className="absolute left-4 right-4 top-4 h-px bg-border" aria-hidden="true" />
                {STATUS_ORDER.map((s, i) => {
                  const meta = STATUS_TIMELINE.find((t) => t.status === s)!;
                  const Icon = meta.icon;
                  const done = currentStatusIdx >= i;
                  const active = currentStatusIdx === i;
                  return (
                    <div key={s} className="relative z-10 flex flex-1 flex-col items-center gap-1.5">
                      <div
                        className={`grid size-8 place-items-center rounded-full border-2 transition-colors ${
                          done
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background text-muted-foreground'
                        }`}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                      </div>
                      <p
                        className={`text-center text-[10px] leading-tight ${
                          active
                            ? 'font-semibold text-foreground'
                            : done
                            ? 'text-muted-foreground'
                            : 'text-muted-foreground/50'
                        }`}
                      >
                        {meta.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Location mini-map */}
          <section aria-label="Map preview">
            <h2 className="mb-3 text-sm font-semibold">Location</h2>
            <div className="overflow-hidden rounded-xl border border-border/50">
              <MapContainer
                center={[issue.location.geopoint.latitude, issue.location.geopoint.longitude]}
                zoom={15}
                className="h-44"
                zoomControl={false}
                dragging={false}
                scrollWheelZoom={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker
                  position={[issue.location.geopoint.latitude, issue.location.geopoint.longitude]}
                  icon={pinIcon}
                />
              </MapContainer>
            </div>
          </section>

          <Separator />

          {/* Comments */}
          <section aria-label="Comments">
            <h2 className="mb-3 text-sm font-semibold">Comments ({comments.length})</h2>
            <div className="space-y-3">
              {commentsLoading ? (
                <>
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </>
              ) : comments.length > 0 ? (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar className="size-8 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-xs text-primary">
                        {c.userId.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 rounded-xl bg-muted/50 px-3 py-2">
                      <p className="text-xs font-medium">Citizen {c.userId.substring(0, 4).toUpperCase()}</p>
                      <p className="mt-0.5 text-sm">{c.text}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {formatRelativeTime(c.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <Textarea
                placeholder="Add a comment…"
                rows={2}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleComment();
                }}
                className="flex-1 resize-none"
              />
              <Button
                size="icon"
                aria-label="Send comment"
                onClick={handleComment}
                disabled={deletingComment || !commentText.trim()}
              >
                <Send className="size-4" />
              </Button>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">Ctrl + Enter to send</p>
          </section>
        </div>
      </motion.div>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this report?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove your report. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Flag dialog */}
      <AlertDialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Flag this issue?</AlertDialogTitle>
            <AlertDialogDescription>
              Help keep the community accurate by flagging spam, duplicates, or incorrect content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-1 pb-2">
            <Textarea
              placeholder="Describe the reason for flagging…"
              rows={3}
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              className="resize-none"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleFlag} disabled={!flagReason.trim()}>
              Submit flag
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
