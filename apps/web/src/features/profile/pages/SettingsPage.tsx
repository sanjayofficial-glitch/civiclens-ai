import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Bell, Lock } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { H2 } from '@/components/ui/typography';

function usePersistedSwitch(key: string, defaultValue: boolean) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? stored === 'true' : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const onChange = useCallback((checked: boolean) => {
    setValue(checked);
    try {
      localStorage.setItem(key, String(checked));
    } catch { /* ignore */ }
  }, [key]);

  return { value, onChange };
}

export default function SettingsPage() {
  const push = usePersistedSwitch('settings-push', true);
  const email = usePersistedSwitch('settings-email', false);
  const leaderboard = usePersistedSwitch('settings-leaderboard', true);
  const publicProfile = usePersistedSwitch('settings-public-profile', true);
  const shareLocation = usePersistedSwitch('settings-share-location', true);

  return (
    <AppLayout hideNav>
      <header className="flex items-center gap-3 border-b border-border/50 px-4 py-4 pt-safe">
        <Button variant="ghost" size="icon-sm" asChild aria-label="Go back">
          <Link to="/profile">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <H2>Settings</H2>
      </header>

      <div className="space-y-6 px-4 py-6">
        <section aria-label="Appearance">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Appearance
          </h3>
          <div className="flex items-center justify-between rounded-xl border border-border/50 p-4">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">Light, dark, or system</p>
            </div>
            <ThemeToggle />
          </div>
        </section>

        <Separator />

        <section aria-label="Notifications settings">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Bell className="size-3" aria-hidden="true" />
            Notifications
          </h3>
          <div className="space-y-3 rounded-xl border border-border/50 p-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="push">Push notifications</Label>
              <Switch id="push" checked={push.value} onCheckedChange={push.onChange} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email">Email updates</Label>
              <Switch id="email" checked={email.value} onCheckedChange={email.onChange} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="leaderboard">Leaderboard alerts</Label>
              <Switch id="leaderboard" checked={leaderboard.value} onCheckedChange={leaderboard.onChange} />
            </div>
          </div>
        </section>

        <Separator />

        <section aria-label="Privacy">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Lock className="size-3" aria-hidden="true" />
            Privacy
          </h3>
          <div className="space-y-3 rounded-xl border border-border/50 p-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="profile-public">Public profile</Label>
              <Switch id="profile-public" checked={publicProfile.value} onCheckedChange={publicProfile.onChange} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="location">Share location on reports</Label>
              <Switch id="location" checked={shareLocation.value} onCheckedChange={shareLocation.onChange} />
            </div>
          </div>
        </section>

        <Separator />

        <section aria-label="About">
          <div className="flex items-center gap-3 rounded-xl border border-border/50 p-4">
            <Shield className="size-5 text-primary" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">Civic Lens v0.1.0</p>
              <p className="text-xs text-muted-foreground">
                AI-powered civic issue reporting
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
