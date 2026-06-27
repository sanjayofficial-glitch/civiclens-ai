import { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';
import {
  Camera, ImagePlus, MapPin, Sparkles, FileText, CheckCircle2,
  ChevronLeft, ChevronRight, Crosshair, Search, Loader2,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { CATEGORY_OPTIONS, SEVERITY_OPTIONS } from '@/lib/constants';
import type { IssueCategory, IssueSeverity, IssueAiAnalysis } from '@blockseblock/shared';
import { IssueService } from '@/services/issue.service';
import { useAuth } from '@/hooks/useAuth';
import { GeoPoint } from 'firebase/firestore';
import { UploadService } from '@/services/upload.service';
import { AiService } from '@/services/ai.service';
import { GeolocationService } from '@/services/geolocation.service';

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629]; // India center
const DEFAULT_ZOOM = 5;
const DETAIL_ZOOM = 15;

const pinIcon = L.divIcon({
  className: '',
  html: `<div style="width:28px;height:28px;background:var(--primary,#aa3bff);border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const STEPS = [
  { id: 'camera',      label: 'Camera',      icon: Camera },
  { id: 'gallery',     label: 'Gallery',     icon: ImagePlus },
  { id: 'location',    label: 'Location',    icon: MapPin },
  { id: 'ai',          label: 'AI Review',   icon: Sparkles },
  { id: 'description', label: 'Description', icon: FileText },
  { id: 'confirm',     label: 'Confirm',     icon: CheckCircle2 },
] as const;

const DRAFT_KEY = 'blockseblock-report-draft';

interface ReportDraft {
  step: number;
  photos: string[];         // Firebase download URLs after upload, local blob: URLs before
  localPhoto: string | null; // blob: URL of original — used for display before upload completes
  address: string;
  latitude: number;
  longitude: number;
  hasCustomLocation: boolean;
  title: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  aiSuggestion?: IssueAiAnalysis;
}

const defaultDraft: ReportDraft = {
  step: 0,
  photos: [],
  localPhoto: null,
  address: '',
  latitude: DEFAULT_CENTER[0],
  longitude: DEFAULT_CENTER[1],
  hasCustomLocation: false,
  title: '',
  description: '',
  category: 'pothole',
  severity: 'medium',
};

function loadDraft(): ReportDraft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return defaultDraft;
    const parsed = JSON.parse(raw) as ReportDraft;
    // Never restore blob: URLs — they don't survive page reload
    return {
      ...defaultDraft,
      ...parsed,
      localPhoto: null,
      // Keep only Firebase https:// URLs; discard any stale blob: URLs
      photos: (parsed.photos ?? []).filter((p: string) => p.startsWith('https://')),
    };
  } catch {
    return defaultDraft;
  }
}

export default function ReportWizardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [draft, setDraft] = useState<ReportDraft>(loadDraft);
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  // Store all photo Blobs (camera + gallery) for upload. Index 0 = camera photo.
  const photoBlobs = useRef<Blob[]>([]);

  // Persist draft (exclude localPhoto — blob: URLs don't survive reload)
  useEffect(() => {
    const { localPhoto: _localPhoto, ...persistable } = draft;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(persistable));
  }, [draft]);

  // Auto-detect location when user enters the location step
  useEffect(() => {
    if (draft.step === 2 && !draft.hasCustomLocation) {
      setLocating(true);
      GeolocationService.getCurrentPosition()
        .then((pos) => {
          const { latitude, longitude } = pos.coords;
          setDraft((d) => ({ ...d, latitude, longitude, hasCustomLocation: true }));
          reverseGeocode(latitude, longitude).then((addr) => {
            if (addr) setDraft((d) => ({ ...d, address: addr }));
          });
        })
        .catch(() => {
          // Silent — user can still click map or type address
        })
        .finally(() => setLocating(false));
    }
  // Only run when entering step 2
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.step]);

  const step = draft.step;
  const progress = ((step + 1) / STEPS.length) * 100;

  const update = useCallback((patch: Partial<ReportDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
  }, []);

  const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } },
      );
      const data = await res.json() as { display_name?: string };
      return data.display_name ?? null;
    } catch {
      return null;
    }
  };

  const next = async () => {
    // Step 2 → 3: move to AI step immediately, run upload + AI in background
    if (step === 2) {
      update({ step: 3 });

      if (photoBlobs.current.length > 0 && user && !draft.aiSuggestion) {
        setAiLoading(true);
        const blobs = photoBlobs.current;
        const aiBlob = blobs[0]; // Use first photo for AI analysis
        try {
          // Upload ALL photos to Firebase Storage in parallel
          const uploadPromises = blobs.map((blob, idx) => {
            const uploadPath = `issues/${Date.now()}_${idx}_${Math.random().toString(36).slice(2)}`;
            return UploadService.uploadFile(
              new File([blob], `photo_${idx}.jpg`, { type: blob.type || 'image/jpeg' }),
              uploadPath,
              ).catch((err: unknown) => {
                console.error('Photo upload error:', err);
                return null as string | null;
              });
          });

          const aiPromise = AiService.analyzeIssueImage(aiBlob).catch((err: unknown) => {
            console.error('AI analysis error:', err);
            return null;
          });

          const [uploadUrls, aiData] = await Promise.all([
            Promise.all(uploadPromises),
            aiPromise,
          ]);

          const successfulUrls = uploadUrls.filter((u): u is string => u !== null);
          if (successfulUrls.length === 0) toast.error('Photo upload failed — check storage permissions and try again.');
          else if (successfulUrls.length < blobs.length) toast.warning(`${blobs.length - successfulUrls.length} photo(s) failed to upload.`);
          if (!aiData) toast.error('AI analysis unavailable — you can fill in details manually.');

          setDraft((d) => ({
            ...d,
            photos: successfulUrls.length > 0 ? successfulUrls : d.photos,
            ...(aiData ? {
              aiSuggestion: aiData,
              category: aiData.category,
              severity: aiData.severity,
              title: aiData.suggestedTitle,
              description: aiData.suggestedDescription,
            } : {}),
          }));
        } catch (err) {
          console.error('Step 3 background task failed:', err);
          toast.error('Something went wrong. Fill in details manually.');
        } finally {
          setAiLoading(false);
        }
      }
      return;
    }

    if (step < STEPS.length - 1) update({ step: step + 1 });
  };

  const back = () => {
    if (step > 0) update({ step: step - 1 });
    else navigate(-1);
  };

  const submit = async () => {
    if (!user) { toast.error('Sign in to submit a report.'); return; }
    if (!draft.title.trim()) { toast.error('Please enter a title for your report.'); return; }
    setSubmitting(true);
    try {
      const geohash = `${draft.latitude.toFixed(5)},${draft.longitude.toFixed(5)}`;
      // Filter out any blob: URLs that failed to upload — only persist valid Firebase URLs
      const validImages = draft.photos.filter((url) => url.startsWith('https://'));
      const issueData: Record<string, unknown> = {
        title: draft.title || 'Untitled Report',
        description: draft.description || 'No description provided',
        category: draft.category,
        severity: draft.severity,
        status: 'reported',
        location: {
          geohash,
          geopoint: new GeoPoint(draft.latitude, draft.longitude),
          address: draft.address || 'Unknown address',
        },
        reporterId: user.uid,
        tags: draft.aiSuggestion?.suggestedTags ?? [],
        media: { images: validImages, videos: [] },
        verification: { upvotes: 0, downvotes: 0, verifiedBy: [] },
      };
      // Only include aiAnalysis if it exists — Firestore rejects undefined values
      if (draft.aiSuggestion) {
        issueData.aiAnalysis = draft.aiSuggestion;
      }
      const docRef = await IssueService.create(issueData as any);
      // Release blob URL memory
      if (draft.localPhoto) URL.revokeObjectURL(draft.localPhoto);
      localStorage.removeItem(DRAFT_KEY);
      toast.success('Report submitted!');
      navigate(`/issues/${docRef.id}`);
    } catch (err) {
      console.error('Report submission error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('permission') || msg.includes('PERMISSION_DENIED')) {
        toast.error('Permission denied — are you signed in?');
      } else if (msg.includes('network') || msg.includes('offline')) {
        toast.error('Network error — check your connection and try again.');
      } else {
        toast.error(`Failed to submit: ${msg.slice(0, 120)}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fileInputRef    = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const searchTimeout   = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    photoBlobs.current = [file];
    const objectUrl = URL.createObjectURL(file);
    // Revoke previous local photo
    if (draft.localPhoto) URL.revokeObjectURL(draft.localPhoto);
    update({ photos: [objectUrl], localPhoto: objectUrl });
    e.target.value = '';
  };

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    // Track gallery blobs alongside the camera blob
    photoBlobs.current = [...photoBlobs.current, ...files];
    const newUrls = files.map((f) => URL.createObjectURL(f));
    update({ photos: [...draft.photos, ...newUrls] });
    e.target.value = '';
  };

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    try {
      const pos = await GeolocationService.getCurrentPosition();
      const { latitude, longitude } = pos.coords;
      update({ latitude, longitude, hasCustomLocation: true });
      reverseGeocode(latitude, longitude).then((addr) => {
        if (addr) update({ address: addr });
      });
      toast.success('Location found');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLocating(false);
    }
  };

  const handleAddressSearch = useCallback(async (value: string) => {
    update({ address: value });
    if (value.length < 3) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=1`,
        { headers: { 'Accept-Language': 'en' } },
      );
      const data = await res.json() as Array<{ lat: string; lon: string; display_name: string }>;
      if (data.length > 0) {
        update({
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          address: data[0].display_name,
          hasCustomLocation: true,
        });
      }
    } catch { /* keep typed text */ }
  }, [update]);

  const onAddressChange = useCallback((value: string) => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => handleAddressSearch(value), 500);
  }, [handleAddressSearch]);

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        update({ latitude: lat, longitude: lng, hasCustomLocation: true });
        reverseGeocode(lat, lng).then((addr) => {
          if (addr) update({ address: addr });
        });
      },
    });
    return null;
  }

  function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
      map.flyTo(center, zoom, { duration: 0.6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [center[0], center[1], zoom]);
    return null;
  }

  // The display photo — prefer local blob URL for instant preview, fall back to Firebase URL
  const displayPhoto = draft.localPhoto ?? draft.photos[0] ?? null;

  return (
    <AppLayout hideNav>
      {/* Header / stepper */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 px-4 py-3 pt-safe backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={back} aria-label="Go back">
            <ChevronLeft className="size-5" />
          </Button>
          <div className="flex-1">
            <p className="text-sm font-semibold">Report an Issue</p>
            <p className="text-xs text-muted-foreground">
              Step {step + 1} of {STEPS.length}: {STEPS[step].label}
            </p>
          </div>
        </div>
        <Progress value={progress} className="mt-3 h-1" />
        <div className="mt-3 flex justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.id} className={`flex flex-col items-center gap-1 ${i <= step ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`grid size-8 place-items-center rounded-full ${i <= step ? 'bg-primary/15' : 'bg-muted'}`}>
                  <Icon className="size-4" aria-hidden="true" />
                </div>
                <span className="hidden text-[10px] sm:block">{s.label}</span>
              </div>
            );
          })}
        </div>
      </header>

      {/* Steps content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="px-4 py-6 pb-28"
        >
          {/* ── Step 0: Camera ── */}
          {step === 0 && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`glass flex w-full aspect-[4/3] flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors ${
                  displayPhoto ? 'border-primary/40' : 'border-primary/20 hover:border-primary/40'
                }`}
              >
                {displayPhoto ? (
                  <img src={displayPhoto} alt="Captured" className="size-full rounded-2xl object-cover" />
                ) : (
                  <>
                    <Camera className="mb-3 size-12 text-primary" />
                    <p className="font-medium">Take a Photo</p>
                    <p className="mt-1 text-sm text-muted-foreground">Capture the civic issue clearly</p>
                  </>
                )}
              </button>
              <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
              {displayPhoto && (
                <Button variant="outline" fullWidth onClick={() => fileInputRef.current?.click()}>
                  <Camera className="size-4" /> Retake Photo
                </Button>
              )}
            </div>
          )}

          {/* ── Step 1: Gallery ── */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Add more photos (optional)</p>
              <input type="file" accept="image/*" multiple className="hidden" ref={galleryInputRef} onChange={handleGallerySelect} />
              <div className="grid grid-cols-3 gap-2">
                {draft.photos.map((p, i) => (
                  <div key={i} className="relative aspect-square">
                    <img src={p} alt="" className="size-full rounded-xl object-cover" />
                    <button
                      type="button"
                      onClick={() => update({ photos: draft.photos.filter((_, j) => j !== i) })}
                      className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-destructive text-destructive-foreground text-xs shadow"
                      aria-label="Remove photo"
                    >×</button>
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 6 - draft.photos.length) }).map((_, n) => (
                  <button
                    key={`empty-${n}`}
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="glass aspect-square rounded-xl border border-border/50 hover:border-primary/50"
                  >
                    <ImagePlus className="mx-auto size-6 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Location ── */}
          {step === 2 && (
            <div className="space-y-4">
              {locating && (
                <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm text-primary">
                  <Loader2 className="size-4 animate-spin" />
                  Detecting your location…
                </div>
              )}
              <div className="overflow-hidden rounded-2xl border border-border/50">
                <MapContainer
                  center={[draft.latitude, draft.longitude]}
                  zoom={draft.hasCustomLocation ? DETAIL_ZOOM : DEFAULT_ZOOM}
                  className="h-64 w-full"
                  zoomControl={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {draft.hasCustomLocation && (
                    <Marker position={[draft.latitude, draft.longitude]} icon={pinIcon} />
                  )}
                  <MapClickHandler />
                  <MapUpdater
                    center={[draft.latitude, draft.longitude]}
                    zoom={draft.hasCustomLocation ? DETAIL_ZOOM : DEFAULT_ZOOM}
                  />
                </MapContainer>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="address"
                    placeholder="Search or click map…"
                    className="pl-10"
                    defaultValue={draft.address}
                    onChange={(e) => onAddressChange(e.target.value)}
                  />
                </div>
                {draft.hasCustomLocation && (
                  <p className="text-xs text-success">
                    📍 {draft.latitude.toFixed(5)}, {draft.longitude.toFixed(5)}
                  </p>
                )}
              </div>
              <Button variant="outline" fullWidth onClick={handleUseCurrentLocation} disabled={locating}>
                {locating ? <Loader2 className="size-4 animate-spin" /> : <Crosshair className="size-4" />}
                {locating ? 'Detecting…' : 'Use Current Location'}
              </Button>
            </div>
          )}

          {/* ── Step 3: AI Review ── */}
          {step === 3 && (
            <div className="space-y-4">
              {aiLoading ? (
                <Card>
                  <CardContent className="flex flex-col items-center py-12">
                    <Sparkles className="mb-3 size-10 animate-pulse text-primary" />
                    <p className="font-medium">Analyzing your photo…</p>
                    <p className="mt-1 text-sm text-muted-foreground">Usually takes 2–5 seconds</p>
                    {displayPhoto && (
                      <img src={displayPhoto} alt="" className="mt-4 h-24 w-24 rounded-xl object-cover opacity-60" />
                    )}
                  </CardContent>
                </Card>
              ) : draft.aiSuggestion ? (
                <Card className="border-primary/20">
                  <CardContent className="space-y-4 p-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-5 text-primary" />
                      <p className="font-semibold">AI Analysis</p>
                      <Badge variant="secondary">{Math.round(draft.aiSuggestion.confidence * 100)}% confidence</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Category</p>
                        <p className="font-medium capitalize">{draft.aiSuggestion.category.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Severity</p>
                        <p className="font-medium capitalize">{draft.aiSuggestion.severity}</p>
                      </div>
                    </div>
                    <p className="text-sm">{draft.aiSuggestion.suggestedDescription}</p>
                    {draft.aiSuggestion.suggestedTags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {draft.aiSuggestion.suggestedTags.map((t) => (
                          <Badge key={t} variant="outline" className="text-[10px]">#{t}</Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground border-t pt-2">
                      You can edit these in the next step.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center py-12 text-center">
                    <Sparkles className="mb-3 size-10 text-muted-foreground" />
                    <p className="font-medium">No AI Analysis</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {draft.photos.length === 0
                        ? 'No photo added — fill in details manually.'
                        : 'AI analysis unavailable — fill in details manually.'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* ── Step 4: Description ── */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={draft.title} onChange={(e) => update({ title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={4} value={draft.description} onChange={(e) => update({ description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={draft.category}
                    onChange={(e) => update({ category: e.target.value as IssueCategory })}
                  >
                    {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={draft.severity}
                    onChange={(e) => update({ severity: e.target.value as IssueSeverity })}
                  >
                    {SEVERITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 5: Confirm ── */}
          {step === 5 && (
            <div className="space-y-4">
              <Card>
                <CardContent className="space-y-3 p-4">
                  {/* Show Firebase URL if uploaded, otherwise local preview */}
                  {displayPhoto && (
                    <img src={displayPhoto} alt="" className="aspect-video w-full rounded-lg object-cover" />
                  )}
                  <p className="font-semibold">{draft.title || 'Untitled Report'}</p>
                  <p className="text-sm text-muted-foreground">{draft.description}</p>
                  <div className="flex gap-2">
                    <Badge>{draft.category.replace('_', ' ')}</Badge>
                    <Badge variant="secondary">{draft.severity}</Badge>
                  </div>
                  {draft.address && (
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="size-4 shrink-0" />
                      {draft.address}
                    </p>
                  )}
                  {!draft.hasCustomLocation && (
                    <p className="text-xs text-destructive">⚠ No location set — go back and pin your location.</p>
                  )}
                </CardContent>
              </Card>
              <p className="text-center text-xs text-muted-foreground">
                By submitting, you confirm this report is accurate.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      <footer className="fixed inset-x-0 bottom-0 border-t border-border/50 bg-background/90 px-4 py-4 pb-safe backdrop-blur-md">
        <div className="mx-auto flex max-w-lg gap-3">
          {step < STEPS.length - 1 ? (
            <Button fullWidth onClick={next} disabled={aiLoading}>
              {aiLoading ? (
                <><Loader2 className="size-4 animate-spin" /> Analyzing…</>
              ) : (
                <>Continue <ChevronRight className="size-4" /></>
              )}
            </Button>
          ) : (
            <Button fullWidth onClick={submit} isLoading={submitting}>
              Submit Report
            </Button>
          )}
        </div>
      </footer>
    </AppLayout>
  );
}
