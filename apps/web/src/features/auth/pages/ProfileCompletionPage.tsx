import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, User } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { H2, Muted } from '@/components/ui/typography';
import { UserService } from '@/services/user.service';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileCompletionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('Alex Rivera');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (user) {
        await UserService.ensureProfile(user.uid, {
          displayName,
          phoneNumber: phone || null,
          email: user.email ?? '',
          photoURL: user.photoURL ?? null,
          role: 'citizen',
          reputation: 0,
          badges: [],
          streakDays: 0,
          fcmTokens: [],
          locationLabel: location,
        });
      }
      navigate('/home');
    } catch (error) {
      console.error('Profile completion failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl border border-border/50 p-8 shadow-xl"
      >
        <div className="mb-6 text-center">
          <Avatar className="mx-auto mb-4 size-20">
            <AvatarFallback className="bg-primary/15 text-xl text-primary">
              AR
            </AvatarFallback>
          </Avatar>
          <H2>Complete Your Profile</H2>
          <Muted className="mt-1">Help us personalize your experience</Muted>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="displayName"
                placeholder="Alex Rivera"
                className="pl-10"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <div className="relative">
              <Phone
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="pl-10"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Neighborhood / City</Label>
            <div className="relative">
              <MapPin
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="location"
                placeholder="Downtown, Metro City"
                className="pl-10"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" size="lg" fullWidth isLoading={loading}>
            Continue to App
          </Button>

          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={() => navigate('/home')}
          >
            Skip for now
          </Button>
        </form>
      </motion.div>
    </AuthLayout>
  );
}
