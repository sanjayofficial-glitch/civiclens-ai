import { Link } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { H2, Lead } from '@/components/ui/typography';

export default function UnauthorizedPage() {
  return (
    <AuthLayout>
      <div className="glass rounded-2xl border border-border/50 p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-destructive/15">
          <ShieldOff className="size-8 text-destructive" aria-hidden="true" />
        </div>
        <H2>Access Denied</H2>
        <Lead className="mt-2">
          You don&apos;t have permission to view this page.
        </Lead>
        <Button className="mt-6" fullWidth asChild>
          <Link to="/home">Go to Home</Link>
        </Button>
      </div>
    </AuthLayout>
  );
}
