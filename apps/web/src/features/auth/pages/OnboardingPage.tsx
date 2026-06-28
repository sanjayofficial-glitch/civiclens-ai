import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Map, Trophy, ChevronRight } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { H2, Lead } from '@/components/ui/typography';

const SLIDES = [
  {
    icon: Camera,
    title: 'Snap & Report',
    description:
      'Capture civic issues with photos or video. AI helps categorize and prioritize your report.',
    color: 'bg-indigo-500/15 text-indigo-400',
  },
  {
    icon: Map,
    title: 'See It on the Map',
    description:
      'Explore issues near you on an interactive map. Verify community reports and track progress.',
    color: 'bg-info/15 text-info',
  },
  {
    icon: Trophy,
    title: 'Earn Recognition',
    description:
      'Climb the leaderboard, earn badges, and make a real difference in your neighborhood.',
    color: 'bg-success/15 text-success',
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const slide = SLIDES[step];
  const Icon = slide.icon;
  const isLast = step === SLIDES.length - 1;

  const next = () => {
    if (isLast) navigate('/welcome');
    else setStep((s) => s + 1);
  };

  return (
    <AuthLayout>
      <div className="glass-medium rounded-3xl border border-white/10 p-8 shadow-[var(--shadow-island)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div
              className={`mx-auto mb-6 grid size-20 place-items-center rounded-2xl ${slide.color}`}
            >
              <Icon className="size-10" aria-hidden="true" />
            </div>
            <H2>{slide.title}</H2>
            <Lead className="mt-3">{slide.description}</Lead>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex justify-center gap-2" role="tablist" aria-label="Onboarding progress">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === step}
              aria-label={`Step ${i + 1} of ${SLIDES.length}`}
              onClick={() => setStep(i)}
              className={`h-2 rounded-full transition-all ${
                i === step ? 'w-8 bg-[image:var(--image-ai-gradient)]' : 'w-2 bg-white/10'
              }`}
            />
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Button size="lg" fullWidth onClick={next}>
            {isLast ? 'Get Started' : 'Continue'}
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
          {!isLast && (
            <Button
              variant="ghost"
              fullWidth
              onClick={() => navigate('/welcome')}
            >
              Skip
            </Button>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
