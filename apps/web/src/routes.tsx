import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { PageLoader } from './components/layout/PageLoader';
import { ErrorBoundary } from './components/ui/error-boundary';

const SplashPage = lazy(() => import('@/features/auth/pages/SplashPage'));
const OnboardingPage = lazy(() => import('@/features/auth/pages/OnboardingPage'));
const WelcomePage = lazy(() => import('@/features/auth/pages/WelcomePage'));
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const SignupPage = lazy(() => import('@/features/auth/pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const ProfileCompletionPage = lazy(() => import('@/features/auth/pages/ProfileCompletionPage'));
const UnauthorizedPage = lazy(() => import('@/features/auth/pages/UnauthorizedPage'));

const HomePage = lazy(() => import('@/features/home/pages/HomePage'));
const MapPage = lazy(() => import('@/features/map/pages/MapPage'));
const ReportWizardPage = lazy(() => import('@/features/report/pages/ReportWizardPage'));
const IssueDetailsPage = lazy(() => import('@/features/issues/pages/IssueDetailsPage'));
const LeaderboardPage = lazy(() => import('@/features/leaderboard/pages/LeaderboardPage'));
const ImpactPage = lazy(() => import('@/features/impact/pages/ImpactPage'));
const NotificationsPage = lazy(() => import('@/features/notifications/pages/NotificationsPage'));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'));
const SettingsPage = lazy(() => import('@/features/profile/pages/SettingsPage'));
const GovernmentDashboardPage = lazy(() => import('@/features/gov/pages/GovernmentDashboardPage'));

function Lazy({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

// eslint-disable-next-line react/only-export-components
export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Lazy>
        <SplashPage />
      </Lazy>
    ),
  },
  {
    path: '/onboarding',
    element: (
      <Lazy>
        <OnboardingPage />
      </Lazy>
    ),
  },
  {
    path: '/welcome',
    element: (
      <Lazy>
        <WelcomePage />
      </Lazy>
    ),
  },
  {
    path: '/login',
    element: (
      <Lazy>
        <LoginPage />
      </Lazy>
    ),
  },
  {
    path: '/signup',
    element: (
      <Lazy>
        <SignupPage />
      </Lazy>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <Lazy>
        <ForgotPasswordPage />
      </Lazy>
    ),
  },
  {
    path: '/profile-completion',
    element: (
      <Lazy>
        <ProfileCompletionPage />
      </Lazy>
    ),
  },
  {
    path: '/unauthorized',
    element: (
      <Lazy>
        <UnauthorizedPage />
      </Lazy>
    ),
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/home',
        element: (
          <Lazy>
            <HomePage />
          </Lazy>
        ),
      },
      {
        path: '/map',
        element: (
          <Lazy>
            <MapPage />
          </Lazy>
        ),
      },
      {
        path: '/report',
        element: (
          <Lazy>
            <ReportWizardPage />
          </Lazy>
        ),
      },
      {
        path: '/issues/:id',
        element: (
          <Lazy>
            <IssueDetailsPage />
          </Lazy>
        ),
      },
      {
        path: '/leaderboard',
        element: (
          <Lazy>
            <LeaderboardPage />
          </Lazy>
        ),
      },
      {
        path: '/impact',
        element: (
          <Lazy>
            <ImpactPage />
          </Lazy>
        ),
      },
      {
        path: '/notifications',
        element: (
          <Lazy>
            <NotificationsPage />
          </Lazy>
        ),
      },
      {
        path: '/profile',
        element: (
          <Lazy>
            <ProfilePage />
          </Lazy>
        ),
      },
      {
        path: '/settings',
        element: (
          <Lazy>
            <SettingsPage />
          </Lazy>
        ),
      },
    ],
  },

  {
    element: <ProtectedRoute allowedRoles={['official', 'moderator']} />,
    children: [
      {
        path: '/gov',
        element: (
          <Lazy>
            <GovernmentDashboardPage />
          </Lazy>
        ),
      },
    ],
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
