import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  ImagePlus,
  MapPin,
  Sparkles,
  FileText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { CATEGORY_OPTIONS, SEVERITY_OPTIONS } from '@/lib/constants';
import type { IssueCategory, IssueSeverity } from '@blockseblock/shared';
import { IssueService } from '@/services/issue.service';
import { useAuth } from '@/hooks/useAuth';
import { GeoPoint } from 'firebase/firestore';

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
  title: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  aiSuggestion?: {
    category: IssueCategory;
    severity: IssueSeverity;
    title: string;
    description: string;
    confidence: number;
  };
}

const defaultDraft: ReportDraft = {
  step: 0,
  photos: [],
  address: '',
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

  const next = () => {
    if (step === 2 && !draft.aiSuggestion) {
      setAiLoading(true);
      setTimeout(() => {
        update({
          step: step + 1,
          aiSuggestion: {
            category: 'pothole',
            severity: 'high',
            title: 'Road surface damage detected',
            description:
              'AI detected a significant road surface irregularity consistent with pothole damage. Recommended priority: high.',
            confidence: 0.92,
          },
          category: 'pothole',
          severity: 'high',
          title: 'Road surface damage detected',
          description:
            'Large pothole causing vehicles to swerve. Located near crosswalk with high pedestrian traffic.',
        });
        setAiLoading(false);
      }, 1500);
      return;
    }
    if (step < STEPS.length - 1) update({ step: step + 1 });
  };

  const back = () => {
    if (step > 0) update({ step: step - 1 });
    else navigate(-1);
  };

  const submit = async () => {
    if (!user) return; // Need to be logged in
    setSubmitting(true);
    
    try {
      await IssueService.create({
        title: draft.title || 'Untitled Report',
        description: draft.description,
        category: draft.category,
        severity: draft.severity,
        status: 'reported',
        location: {
          geohash: 'dr5reg', // Mock geohash
          geopoint: new GeoPoint(40.7128, -74.006), // Use mock point for now, normally use device location
          address: draft.address || 'Unknown address',
        },
        reporterId: user.uid,
        tags: [],
        media: {
          images: draft.photos,
          videos: [],
        },
        verification: {
          upvotes: 0,
          downvotes: 0,
          verifiedBy: [],
        },
      });
      localStorage.removeItem(DRAFT_KEY);
      navigate('/home');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const addMockPhoto = () => {
    update({
      photos: [
        ...draft.photos,
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&q=80',
      ],
    });
  };

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
                <Button className="mt-4" onClick={addMockPhoto}>
                  Open Camera
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
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={addMockPhoto}
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
              <div className="glass aspect-video rounded-2xl border border-border/50 bg-muted/30">
                <div className="flex size-full flex-col items-center justify-center">
                  <MapPin className="mb-2 size-10 text-primary" aria-hidden="true" />
                  <p className="text-sm font-medium">Pin Location</p>
                  <p className="text-xs text-muted-foreground">Drag to adjust</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="123 Main St, Downtown"
                  value={draft.address}
                  onChange={(e) => update({ address: e.target.value })}
                />
              </div>
              <Button variant="outline" fullWidth>
                <MapPin className="size-4" aria-hidden="true" />
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
                    <p className="text-sm">{draft.aiSuggestion.description}</p>
                    <p className="text-xs text-muted-foreground">
                      You can edit these suggestions in the next step.
                    </p>
                  </CardContent>
                </Card>
              ) : null}
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
              Continue
              <ChevronRight className="size-4" />
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
