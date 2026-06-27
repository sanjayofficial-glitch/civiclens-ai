import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { H2, Lead, Muted } from '@/components/ui/typography';
import { AuthService } from '@/services/auth.service';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await AuthService.sendResetEmail(email);
      setSent(true);
    } catch (error) {
      const msg = (error as { code?: string })?.code;
      if (msg === 'auth/user-not-found') toast.error('No account found with this email.');
      else if (msg === 'auth/invalid-email') toast.error('Please enter a valid email address.');
      else toast.error('Failed to send reset email. Please try again.');
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
        <Link
          to="/login"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to sign in
        </Link>

        {sent ? (
          <div className="text-center">
            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-success/15">
              <CheckCircle2 className="size-8 text-success" aria-hidden="true" />
            </div>
            <H2>Check your inbox</H2>
            <Lead className="mt-2">
              We sent a password reset link to{' '}
              <span className="font-medium text-foreground">{email}</span>
            </Lead>
            <Button variant="outline" fullWidth className="mt-6" asChild>
              <Link to="/login">Return to Sign In</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <H2>Reset Password</H2>
              <Muted className="mt-1">
                Enter your email and we&apos;ll send you a reset link.
              </Muted>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <Button type="submit" size="lg" fullWidth isLoading={loading}>
                Send Reset Link
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </AuthLayout>
  );
}
