import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Note: Cursor will build out these actual page components
const Placeholder = ({ name }: { name: string }) => <div>{name}</div>;

export const router = createBrowserRouter([
  { path: '/', element: <Placeholder name="Splash / Landing" /> },
  { path: '/onboarding', element: <Placeholder name="Onboarding" /> },
  { path: '/login', element: <Placeholder name="Login" /> },
  
  // Protected Routes (Citizens & up)
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/home', element: <Placeholder name="Home" /> },
      { path: '/map', element: <Placeholder name="Map" /> },
      { path: '/report', element: <Placeholder name="Report Issue" /> },
      { path: '/camera', element: <Placeholder name="Camera" /> },
      { path: '/issues/:id', element: <Placeholder name="Issue Details" /> },
      { path: '/leaderboard', element: <Placeholder name="Leaderboard" /> },
      { path: '/notifications', element: <Placeholder name="Notifications" /> },
      { path: '/profile', element: <Placeholder name="Profile" /> },
      { path: '/settings', element: <Placeholder name="Settings" /> },
    ]
  },

  // Admin / Moderator Routes
  {
    element: <ProtectedRoute allowedRoles={['Admin', 'Moderator']} />,
    children: [
      { path: '/admin', element: <Placeholder name="Admin Dashboard" /> },
      { path: '/admin/ai-review', element: <Placeholder name="AI Review Queue" /> },
      { path: '/gov', element: <Placeholder name="Government Dashboard" /> },
    ]
  }
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
