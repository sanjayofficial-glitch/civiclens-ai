import { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';
import {
  Camera,
  ImagePlus,
  MapPin,
  Sparkles,
  FileText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Search,
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

// Default center: New York City
const DEFAULT_CENTER: [number, number] = [40.7128, -74.006];
const DEFAULT_ZOOM = 14;

const pinIcon = L.divIcon({
  className: '',
  html: `<div style="width:28px;height:28px;background:var(--primary,#aa3bff);border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const STEPS = [
  { id: 'camera', label: 'Camera', icon: Camera },
  { id: 'gallery', label: 'Gallery', icon: ImagePlus },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'ai', label: 'AI Review', icon: Sparkles },
  { id: 'description', label: 'Description', icon: FileText },
  { id: 'confirm', label: 'Confirm', icon: CheckCircle2 },
] as const;

const DRAFT_KEY = 'blockseblock-report-draft';

interface ReportDraft {
  step: number;
  photos: string[];
  address: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  aiSuggestion?: IssueAiAnalysis;
}

const defaultDraft: ReportDraft = {
  step: 0,
  photos: [],
  address: '',
  latitude: DEFAULT_CENTER[0],
  longitude: DEFAULT_CENTER[1],
  title: '',
  description: '',
  category: 'pothole',
  severity: 'medium',
};

function loadDraft(): ReportDraft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? { ...defaultDraft, ...JSON.parse(raw) } : defaultDraft;
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

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft]);

  const step = draft.step;
  const progress = ((step + 1) / STEPS.length) * 100;

  const update = useCallback((patch: Partial<ReportDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
  }, []);

  const next = async () => {
    // Step 2 = Location: advance to step 3 (AI Review) and kick off AI + upload in background
    if (step === 2) {
      // Move to the AI review step immediately so the loading UI shows
      update({ step: 3 });

      if (draft.photos.length > 0 && user && !draft.aiSuggestion) {
        setAiLoading(true);
        try {
          // Assume the first photo is a local object URL
          const res = await fetch(draft.photos[0]);
          const blob = await res.blob();

          // Convert Blob to Base64 for Gemini
          const base64Image = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = (reader.result as string).split(',')[1];
              resolve(result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          // Run AI analysis and Firebase upload concurrently
          const path = `users/${user.uid}/uploads/${Date.now()}_${Math.random().toString(36).substring(7)}`;
          const [uploadResult, aiData] = await Promise.all([
            UploadService.uploadFile(new File([blob], 'photo.jpg', { type: blob.type }), path).catch(
              () => null as string | null,
            ),
            AiService.analyzeIssueImage(base64Image, blob.type).catch(() => null),
          ]);

          if (!uploadResult) {
            toast.error('Photo upload failed. Your report will be submitted without photos.');
          }

          if (!aiData) {
            toast.error('AI analysis failed. You can fill in the details manually.');
          }

          setDraft((d) => ({
            ...d,
            photos: uploadResult ? [uploadResult, ...d.photos.slice(1)] : d.photos,
            ...(aiData
              ? {
                  aiSuggestion: aiData,
                  category: aiData.category,
                  severity: aiData.severity,
                  title: aiData.suggestedTitle,
                  description: aiData.suggestedDescription,
                }
              : {}),
          }));
        } catch (error) {
          console.error('AI Analysis step failed:', error);
          toast.error('Something went wrong with AI analysis. You can fill in details manually.');
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
    if (!user) {
      toast.error('You must be signed in to submit a report.');
      return;
    }
    setSubmitting(true);
    
    try {
      const geohash = draft.latitude.toFixed(5) + ',' + draft.longitude.toFixed(5);
      await IssueService.create({
        title: draft.title || 'Untitled Report',
        description: draft.description,
        category: draft.category,
        severity: draft.severity,
        status: 'reported',
        location: {
          geohash,
          geopoint: new GeoPoint(draft.latitude, draft.longitude),
          address: draft.address || 'Unknown address',
        },
        reporterId: user.uid,
        tags: [],
        media: {
          images: draft.photos,
          videos: [],
        },
        aiAnalysis: draft.aiSuggestion,
        verification: {
          upvotes: 0,
          downvotes: 0,
          verifiedBy: [],
        },
      });
      localStorage.removeItem(DRAFT_KEY);
      toast.success('Report submitted successfully!');
      navigate('/home');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Camera step uses a FileReader/DataURL path; just pass through
    const file = event.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      update({ photos: [...draft.photos, objectUrl] });
    }
    // Reset so the same file can be re-selected
    event.target.value = '';
  };

  const handleGallerySelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    const newUrls = files.map((f) => URL.createObjectURL(f));
    update({ photos: [...draft.photos, ...newUrls] });
    // Reset so the same file(s) can be re-selected after removal
    event.target.value = '';
  };

  const handleUseCurrentLocation = async () => {
    try {
      const position = await GeolocationService.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      update({ latitude, longitude });
      // Reverse geocode the coordinates to get the address
      reverseGeocode(latitude, longitude).then((addr) => {
        if (addr) update({ address: addr });
      });
      toast.success('Location found');
    } catch {
      toast.error('Could not get your location. Check your browser permissions.');
    }
  };

  const handleAddressSearch = async (value: string) => {
    update({ address: value });
    if (value.length < 3) return;
    // Debounced geocoding search
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
        });
      }
    } catch {
      // Silent fail — user-entered address text is still kept
    }
  };

  const onAddressChange = useCallback((value: string) => {
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => handleAddressSearch(value), 600);
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

  /** Inner component that listens for map clicks and places a pin */
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        update({ latitude: lat, longitude: lng });
        reverseGeocode(lat, lng).then((addr) => {
          if (addr) update({ address: addr });
        });
      },
    });
    return null;
  }

  /** Inner component that updates the map view when coordinates change externally */
  function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
      map.flyTo(center, map.getZoom(), { duration: 0.5 });
    }, [center[0], center[1], map]);
    return null;
  }

  return (
    <AppLayout hideNav>
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
              <div
                key={s.id}
                className={`flex flex-col items-center gap-1 ${
                  i <= step ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`grid size-8 place-items-center rounded-full ${
                    i <= step ? 'bg-primary/15' : 'bg-muted'
                  }`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </div>
                <span className="hidden text-[10px] sm:block">{s.label}</span>
              </div>
            );
          })}
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="px-4 py-6"
        >
          {step === 0 && (
            <div className="space-y-4">
              <div className="glass flex aspect-[4/3] flex-col items-center justify-center rounded-2xl border border-dashed border-primary/30">
                <Camera className="mb-3 size-12 text-primary" aria-hidden="true" />
                <p className="font-medium">Take a Photo</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Capture the civic issue clearly
                </p>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                />
                <Button className="mt-4" onClick={() => fileInputRef.current?.click()}>
                  Take Photo
                </Button>
              </div>
              {draft.photos.length > 0 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {draft.photos.map((p, i) => (
                    <img
                      key={i}
                      src={p}
                      alt=""
                      className="size-20 rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add more photos from your gallery (optional)
              </p>
              <input 
                type="file" 
                accept="image/*" 
                multiple
                className="hidden" 
                ref={galleryInputRef} 
                onChange={handleGallerySelect} 
              />
              <div className="grid grid-cols-3 gap-2">
                {draft.photos.length > 0 && draft.photos.map((p, i) => (
                  <div key={i} className="relative aspect-square">
                    <img
                      src={p}
                      alt=""
                      className="size-full rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        URL.revokeObjectURL(p);
                        update({ photos: draft.photos.filter((_, j) => j !== i) });
                      }}
                      className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-destructive text-destructive-foreground text-xs shadow-sm"
                      aria-label="Remove photo"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 6 - draft.photos.length) }).map((_, n) => (
                  <button
                    key={`empty-${n}`}
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="glass aspect-square rounded-xl border border-border/50 transition-colors hover:border-primary/50"
                  >
                    <ImagePlus className="mx-auto size-6 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-border/50">
                <MapContainer
                  center={[draft.latitude, draft.longitude]}
                  zoom={DEFAULT_ZOOM}
                  className="h-64 w-full"
                  zoomControl={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[draft.latitude, draft.longitude]}
                    icon={pinIcon}
                  />
                  <MapClickHandler />
                  <MapUpdater center={[draft.latitude, draft.longitude]} />
                </MapContainer>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="address"
                    placeholder="Search address or click the map..."
                    className="pl-10"
                    value={draft.address}
                    onChange={(e) => onAddressChange(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Click the map to place a pin, or search for an address.
                </p>
              </div>
              <Button variant="outline" fullWidth onClick={handleUseCurrentLocation}>
                <Crosshair className="size-4" aria-hidden="true" />
                Use Current Location
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {aiLoading ? (
                <Card>
                  <CardContent className="flex flex-col items-center py-12">
                    <Sparkles className="mb-3 size-10 animate-pulse text-primary" />
                    <p className="font-medium">AI is analyzing your photo...</p>
                    <p className="text-sm text-muted-foreground">This takes a few seconds</p>
                  </CardContent>
                </Card>
              ) : draft.aiSuggestion ? (
                <Card className="border-primary/20">
                  <CardContent className="space-y-4 p-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-5 text-primary" />
                      <p className="font-semibold">AI Analysis</p>
                      <Badge variant="secondary">
                        {Math.round(draft.aiSuggestion.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Category</p>
                        <p className="font-medium capitalize">
                          {draft.aiSuggestion.category.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Severity</p>
                        <p className="font-medium capitalize">{draft.aiSuggestion.severity}</p>
                      </div>
                    </div>
                    <p className="text-sm">{draft.aiSuggestion.suggestedDescription}</p>
                    {draft.aiSuggestion.suggestedTags && draft.aiSuggestion.suggestedTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {draft.aiSuggestion.suggestedTags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[10px]">#{tag}</Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2 border-t pt-2 border-border/50">
                      Duplicate probability: {Math.round(draft.aiSuggestion.duplicateProbability * 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      You can edit these suggestions in the next step.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                // AI was skipped (no photo) or failed — show a clear fallback
                <Card>
                  <CardContent className="flex flex-col items-center py-12 text-center">
                    <Sparkles className="mb-3 size-10 text-muted-foreground" />
                    <p className="font-medium">No AI Analysis</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {draft.photos.length === 0
                        ? 'No photo was added. You can fill in the issue details manually.'
                        : 'AI analysis was unavailable. You can fill in the issue details manually.'}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Press Continue to fill in the details yourself.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={draft.title}
                  onChange={(e) => update({ title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={draft.description}
                  onChange={(e) => update({ description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={draft.category}
                    onChange={(e) =>
                      update({ category: e.target.value as IssueCategory })
                    }
                  >
                    {CATEGORY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={draft.severity}
                    onChange={(e) =>
                      update({ severity: e.target.value as IssueSeverity })
                    }
                  >
                    {SEVERITY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <Card>
                <CardContent className="space-y-3 p-4">
                  {draft.photos[0] && (
                    <img
                      src={draft.photos[0]}
                      alt=""
                      className="aspect-video w-full rounded-lg object-cover"
                    />
                  )}
                  <p className="font-semibold">{draft.title || 'Untitled Report'}</p>
                  <p className="text-sm text-muted-foreground">{draft.description}</p>
                  <div className="flex gap-2">
                    <Badge>{draft.category.replace('_', ' ')}</Badge>
                    <Badge variant="secondary">{draft.severity}</Badge>
                  </div>
                  {draft.address && (
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="size-4" />
                      {draft.address}
                    </p>
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

      <footer className="fixed inset-x-0 bottom-0 border-t border-border/50 bg-background/90 px-4 py-4 pb-safe backdrop-blur-md">
        <div className="mx-auto flex max-w-lg gap-3">
          {step < STEPS.length - 1 ? (
            <Button fullWidth onClick={next} disabled={aiLoading}>
              {aiLoading ? 'Analyzing...' : 'Continue'}
              {!aiLoading && <ChevronRight className="size-4" />}
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
