import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Navigation from './components/Navigation';
import ProfileSetupModal from './components/ProfileSetupModal';
import DiscoverPage from './pages/DiscoverPage';
import ArtistsPage from './pages/ArtistsPage';
import ArtistDetailPage from './pages/ArtistDetailPage';
import MyRadarPage from './pages/MyRadarPage';
import NotFoundPage from './pages/NotFoundPage';
import { Heart } from 'lucide-react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';

const queryClient = new QueryClient();

function Layout() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border py-6 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} TECHNO BEACON — ALL RIGHTS RESERVED
          </p>
          <p className="font-mono text-xs text-muted-foreground flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-neon-amber fill-neon-amber" /> using{' '}
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

const rootRoute = createRootRoute({ component: Layout });

const discoverRoute = createRoute({
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

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFoundPage,
});

const routeTree = rootRoute.addChildren([
  discoverRoute,
  artistsRoute,
  artistDetailRoute,
  myRadarRoute,
  notFoundRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
