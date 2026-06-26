import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { H1, Lead } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';

export default function WelcomePage() {
  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl border border-border/50 p-8 shadow-xl"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-primary/15">
            <Shield className="size-8 text-primary" aria-hidden="true" />
          </div>
          <H1>Welcome</H1>
          <Lead className="mt-2">
            Join thousands of citizens making their communities better.
          </Lead>
        </div>

        <div className="flex flex-col gap-3">
          <Button size="lg" fullWidth asChild>
            <Link to="/signup">Create Account</Link>
          </Button>
          <Button size="lg" variant="outline" fullWidth asChild>
            <Link to="/login">
              <Mail className="size-4" aria-hidden="true" />
              Sign In with Email
            </Link>
          </Button>
        </div>

        <div className="my-6 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or continue as</span>
          <Separator className="flex-1" />
        </div>

        <Button variant="secondary" fullWidth asChild>
          <Link to="/home">Continue as Guest</Link>
        </Button>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </AuthLayout>
  );
}
