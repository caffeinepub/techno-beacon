import React from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router';
import Navigation from './components/Navigation';
import ProfileSetupModal from './components/ProfileSetupModal';
import DiscoverPage from './pages/DiscoverPage';
import ArtistsPage from './pages/ArtistsPage';
import ArtistDetailPage from './pages/ArtistDetailPage';
import MyRadarPage from './pages/MyRadarPage';
import NotFoundPage from './pages/NotFoundPage';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { Toaster } from '@/components/ui/sonner';

// Layout component
function Layout() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <div className="flex-1">
        <Outlet />
      </div>
      <footer className="border-t border-border py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-mono text-muted-foreground">
            © {new Date().getFullYear()} Techno Beacon. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with{' '}
            <span className="text-neon-amber">♥</span>{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'techno-beacon')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-amber hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
      <ProfileSetupModal open={showProfileSetup} />
      <Toaster theme="dark" />
    </div>
  );
}

// Routes
const rootRoute = createRootRoute({
  component: Layout,
  notFoundComponent: NotFoundPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DiscoverPage,
});

const artistsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/artists',
  component: ArtistsPage,
});

const artistDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/artists/$artistId',
  component: ArtistDetailPage,
});

const myRadarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-radar',
  component: MyRadarPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  artistsRoute,
  artistDetailRoute,
  myRadarRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
