import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { H1, Lead } from '@/components/ui/typography';

export default function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/onboarding'), 2200);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center text-center"
      >
        <div className="glass mb-6 grid size-24 place-items-center rounded-3xl border border-primary/20 shadow-xl shadow-primary/10">
          <Shield className="size-12 text-primary" aria-hidden="true" />
        </div>
        <H1 className="bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
          BlockSeBlock
        </H1>
        <Lead className="mt-2 max-w-xs">
          Report civic issues. Build better communities.
        </Lead>
        <motion.div
          className="mt-8 h-1 w-24 overflow-hidden rounded-full bg-muted"
          aria-hidden="true"
        >
          <motion.div
            className="h-full bg-primary"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
