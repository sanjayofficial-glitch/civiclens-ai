import { useState, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings,
  LogOut,
  FileText,
  Trophy,
  Star,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  Award,
  AlertCircle,
} from 'lucide-react';
import { updateProfile as updateAuthProfile } from 'firebase/auth';
import { toast } from 'sonner';
import { AppLayout, PageHeader } from '@/components/layout/AppLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { IssueCard } from '@/components/shared/IssueCard';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BADGES, getRankTitle } from '@/lib/constants';
import { cn } from '@/lib/utils';

import { useUser } from '@/hooks/data/useUser';
import { useIssues } from '@/hooks/data/useIssues';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { AuthService } from '@/services/auth.service';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase/auth';
import { UserService } from '@/services/user.service';
import { uploadFile, getFileDownloadURL } from '@/lib/firebase/storage';

export default function ProfilePage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const { user: authUser } = useAuth();
  const { user, loading: userLoading } = useUser();

  // Edit profile dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPhoto, setEditPhoto] = useState('');
  const [updating, setUpdating] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openEditDialog = useCallback(() => {
    setEditName(user?.displayName || authUser?.displayName || '');
    setEditPhone(user?.phoneNumber || '');
    setEditPhoto(user?.photoURL || '');
    setIsEditDialogOpen(true);
  }, [user, authUser]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authUser) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB.');
      return;
    }

    setUploadingPhoto(true);
    try {
      const path = `users/${authUser.uid}/profile_${Date.now()}`;
      const uploadTask = uploadFile(file, path);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          null,
          (err) => reject(err),
          () => resolve(null),
        );
      });

      const downloadUrl = await getFileDownloadURL(path);
      setEditPhoto(downloadUrl);
      toast.success('Photo uploaded successfully!');
    } catch (err) {
      console.error('Failed to upload photo:', err);
      toast.error('Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;
    if (!editName.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }
    setUpdating(true);
    try {
      if (auth.currentUser) {
        await updateAuthProfile(auth.currentUser, {
          displayName: editName.trim(),
          photoURL: editPhoto.trim() || null,
        });
      }
      await UserService.updateProfile(authUser.uid, {
        displayName: editName.trim(),
        phoneNumber: editPhone.trim() || null,
        photoURL: editPhoto.trim() || null,
      });
      toast.success('Profile updated successfully!');
      setIsEditDialogOpen(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Only start the issues query once we know the user UID — avoids the
  // double-subscription (first with undefined, then with reporterId)
  const issueFilters = useMemo(
    () => (user?.uid ? { reporterId: user.uid } : undefined),
    [user?.uid],
  );

  const { issues, loading: issuesLoading, error: issuesError } = useIssues(
    issueFilters,
    50,
    refreshKey,
  );

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const { pullDistance, isRefreshing, touchHandlers } = usePullToRefresh({
    onRefresh: handleRefresh,
    disabled: issuesLoading || userLoading,
  });

  const earnedBadges = useMemo(
    () => BADGES.filter((b) => user?.badges?.includes(b.id)),
    [user?.badges],
  );

  const displayName = user?.displayName || authUser?.displayName || 'Citizen';
  const email = user?.email || authUser?.email || '';
  const photoURL = user?.photoURL ?? authUser?.photoURL ?? null;
  const reputation = user?.reputation ?? 0;
  const rank = getRankTitle(reputation);

  // Use live issue list length when available, fall back to user doc counter
  const reportCount = issueFilters
    ? issuesLoading
      ? (user?.issuesReported ?? 0)
      : issues.length
    : (user?.issuesReported ?? 0);

  const totalVerificationsReceived = useMemo(() => {
    if (issuesLoading || !issues) return 0;
    return issues.reduce((sum, issue) => sum + (issue.verification?.upvotes || 0), 0);
  }, [issues, issuesLoading]);

  const statCards = [
    { value: reportCount,        label: 'Reports',  icon: FileText,    color: 'text-primary' as const },
    { value: totalVerificationsReceived, label: 'Verifications', icon: CheckCircle2, color: 'text-green-500' as const },
    { value: earnedBadges.length, label: 'Badges',  icon: Award,       color: 'text-yellow-500' as const },
  ];

  const isLoading = userLoading;

  return (
    <AppLayout>
      <PageHeader
        title="Profile"
        action={
          <Button variant="ghost" size="icon-sm" asChild aria-label="Open settings">
            <Link to="/settings">
              <Settings className="size-5" />
            </Link>
          </Button>
        }
      />

      <div className="relative" {...touchHandlers}>
        {/* Pull-to-refresh indicator */}
        <div
          className={cn(
            'pointer-events-none absolute left-0 right-0 z-10 flex items-center justify-center transition-opacity',
            pullDistance > 0 ? 'opacity-100' : 'opacity-0',
          )}
          style={{ top: Math.min(pullDistance - 40, 0), height: 40 }}
        >
          <RefreshCw
            className={cn('size-5 text-primary', isRefreshing && 'animate-spin')}
            style={{
              transform: isRefreshing ? undefined : `rotate(${(pullDistance / 60) * 360}deg)`,
            }}
          />
          <span className="ml-2 text-xs text-muted-foreground">
            {isRefreshing ? 'Refreshing…' : pullDistance >= 60 ? 'Release to refresh' : ''}
          </span>
        </div>

        <div className="space-y-6 px-4 py-4">
          {/* ── Avatar + name ── */}
          <div className="flex flex-col items-center text-center">
            {isLoading ? (
              <>
                <Skeleton className="size-20 rounded-full" />
                <Skeleton className="mt-3 h-6 w-32" />
                <Skeleton className="mt-1 h-4 w-48" />
                <div className="mt-3 flex gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </>
            ) : (
              <>
                <Avatar className="size-20 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                  {photoURL && <AvatarImage src={photoURL} alt={displayName} />}
                  <AvatarFallback className="bg-primary/15 text-2xl font-bold text-primary">
                    {displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="mt-3 text-xl font-bold">{displayName}</h2>
                <p className="text-sm text-muted-foreground">{email}</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <Badge variant="secondary" className={cn("gap-1 font-semibold", rank.color)}>
                    <Award className="size-3" aria-hidden="true" />
                    {rank.title}
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Star className="size-3 text-yellow-500" aria-hidden="true" />
                    {reputation.toLocaleString()} pts
                  </Badge>
                  <Badge variant="secondary">
                    🔥 {user?.streakDays ?? 0}-day streak
                  </Badge>
                  {user?.role && user.role !== 'citizen' && (
                    <Badge className="capitalize">{user.role}</Badge>
                  )}
                </div>
                <Button variant="outline" size="sm" className="mt-4" onClick={openEditDialog}>
                  Edit Profile
                </Button>
              </>
            )}
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-3 gap-3">
            {statCards.map(({ value, label, icon: Icon, color }) => (
              <Card key={label}>
                <CardContent className="flex flex-col items-center gap-1 p-3">
                  <Icon className={cn('size-5', color)} aria-hidden="true" />
                  {isLoading ? (
                    <Skeleton className="h-7 w-8" />
                  ) : (
                    <p className="text-xl font-bold tabular-nums">{value}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Achievements ── */}
          <section aria-label="Achievements">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Star className="size-4 text-yellow-500" aria-hidden="true" />
              Achievements
            </h3>
            {isLoading ? (
              <div className="flex gap-3">
                {[1, 2, 3].map((n) => (
                  <Skeleton key={n} className="h-20 w-20 shrink-0 rounded-xl" />
                ))}
              </div>
            ) : earnedBadges.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {earnedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="glass shrink-0 rounded-xl border border-border/50 px-4 py-3 text-center"
                    title={badge.description}
                  >
                    <span className="text-2xl" role="img" aria-label={badge.name}>
                      {badge.icon}
                    </span>
                    <p className="mt-1 text-xs font-medium">{badge.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No badges yet — keep reporting to unlock achievements!
              </p>
            )}
          </section>

          {/* ── My Reports ── */}
          <section aria-label="My reports">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <FileText className="size-4" aria-hidden="true" />
                My Reports
                {!issuesLoading && issues.length > 0 && (
                  <span className="text-muted-foreground">({issues.length})</span>
                )}
              </h3>
              <Link to="/home" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </div>

            {/* Wait for user UID before showing issues */}
            {!issueFilters ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            ) : issuesLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            ) : issuesError ? (
              <Card className="border-destructive/30">
                <CardContent className="py-6 text-center">
                  <AlertCircle className="mx-auto mb-2 size-8 text-destructive" />
                  <p className="text-sm font-medium text-destructive">Failed to load reports</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Pull down to retry, or check your connection.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3"
                    onClick={() => setRefreshKey((k) => k + 1)}
                  >
                    <RefreshCw className="mr-2 size-3" />
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : issues.length > 0 ? (
              <div className="space-y-3">
                {issues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} variant="horizontal" />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <FileText className="mx-auto mb-2 size-8 text-muted-foreground" />
                  <p className="text-sm font-medium">No reports yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Start by reporting a civic issue in your area.
                  </p>
                  <Button asChild size="sm" className="mt-4">
                    <Link to="/report">Report an Issue</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </section>

          <Separator />

          {/* ── Navigation ── */}
          <nav aria-label="Profile actions" className="space-y-1 pb-4">
            <Link
              to="/settings"
              className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-accent"
            >
              <span className="flex items-center gap-3 text-sm">
                <Settings className="size-5 text-muted-foreground" aria-hidden="true" />
                Settings
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
            <Link
              to="/leaderboard"
              className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-accent"
            >
              <span className="flex items-center gap-3 text-sm">
                <Trophy className="size-5 text-muted-foreground" aria-hidden="true" />
                Leaderboard
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl p-3 text-destructive transition-colors hover:bg-destructive/10"
              onClick={() => AuthService.logOut()}
            >
              <span className="flex items-center gap-3 text-sm">
                <LogOut className="size-5" aria-hidden="true" />
                Log Out
              </span>
            </button>
          </nav>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update your personal details. These will be visible to other community members.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex flex-col items-center gap-3 py-2">
                <Avatar className="size-20 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                  {editPhoto && <AvatarImage src={editPhoto} alt="Preview" />}
                  <AvatarFallback className="bg-primary/15 text-2xl font-bold text-primary">
                    {editName ? editName.slice(0, 2).toUpperCase() : 'CU'}
                  </AvatarFallback>
                </Avatar>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                  disabled={updating || uploadingPhoto}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={updating || uploadingPhoto}
                >
                  {uploadingPhoto ? 'Uploading...' : 'Upload New Photo'}
                </Button>
              </div>

              <div className="space-y-1">
                <Label htmlFor="displayName">Name</Label>
                <Input
                  id="displayName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your name"
                  required
                  disabled={updating || uploadingPhoto}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Your phone number"
                  disabled={updating || uploadingPhoto}
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={updating || uploadingPhoto}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updating || uploadingPhoto}>
                {updating ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
