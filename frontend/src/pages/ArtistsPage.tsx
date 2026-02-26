import React, { useState, useEffect } from 'react';
import { useGetArtists, useGetEventsByArtist, useGetTrackedArtists } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import ArtistCard from '../components/ArtistCard';
import AdminInitButton from '../components/AdminInitButton';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { AlertCircle, RefreshCw } from 'lucide-react';

// Per-artist event count fetcher — avoids relying on getAllEvents which filters by future dates
function ArtistCardWithEvents({
  artist,
  trackedArtists,
  onLoginRequired,
}: {
  artist: { id: string; name: string; imageUrl: string; genre: string };
  trackedArtists: string[];
  onLoginRequired: () => void;
}) {
  const { data: events = [] } = useGetEventsByArtist(artist.id);
  return (
    <ArtistCard
      key={artist.id}
      id={artist.id}
      name={artist.name}
      imageUrl={artist.imageUrl}
      genre={artist.genre}
      eventCount={events.length}
      isTracked={trackedArtists.includes(artist.id)}
      onLoginRequired={onLoginRequired}
    />
  );
}

export default function ArtistsPage() {
  const [search, setSearch] = useState('');
  const { identity } = useInternetIdentity();

  const {
    data: artists = [],
    isLoading: artistsLoading,
    isError: artistsError,
    error: artistsErrorObj,
    refetch: refetchArtists,
  } = useGetArtists();

  const { data: trackedArtists = [] } = useGetTrackedArtists();

  // Log full error to console whenever it changes
  useEffect(() => {
    if (artistsError && artistsErrorObj) {
      console.error('[ArtistsPage] Failed to load artists:', artistsErrorObj);
    }
  }, [artistsError, artistsErrorObj]);

  const filtered = artists.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleLoginRequired = () => {
    toast.error('Please log in to follow artists', {
      description: 'Use the Login button in the top navigation.',
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold font-mono text-foreground tracking-tight mb-2">
            ARTISTS
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover and follow your favourite techno artists.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search artists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md bg-card border border-border rounded px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Error state */}
        {artistsError && (
          <div className="mb-8 flex items-start gap-4 p-5 bg-destructive/10 border border-destructive/40 rounded-sm">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-mono font-semibold text-destructive mb-1">
                Unable to connect to the backend
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                The artist data could not be loaded. The backend may be temporarily unavailable — please try again shortly.
                {search && (
                  <span className="block mt-1 text-xs opacity-70">
                    (Search filter "{search}" is active but no data could be fetched.)
                  </span>
                )}
              </p>
              <button
                onClick={() => refetchArtists()}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-neon-amber hover:text-neon-amber/80 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Admin re-seed button — shown when no artists found (data missing) */}
        {!artistsLoading && !artistsError && artists.length === 0 && identity && (
          <div className="mb-8">
            <AdminInitButton />
          </div>
        )}

        {/* Loading skeletons */}
        {artistsLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded" />
            ))}
          </div>
        )}

        {/* Empty state — search returned no matches */}
        {!artistsLoading && !artistsError && filtered.length === 0 && artists.length > 0 && (
          <div className="text-center py-20 text-muted-foreground font-mono">
            No artists match your search.
          </div>
        )}

        {/* No data at all (not loading, no error, no artists, not authenticated) */}
        {!artistsLoading && !artistsError && artists.length === 0 && !identity && (
          <div className="text-center py-20 text-muted-foreground font-mono">
            No artists found.
          </div>
        )}

        {/* Artist grid */}
        {!artistsLoading && !artistsError && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((artist) => (
              <ArtistCardWithEvents
                key={artist.id}
                artist={artist}
                trackedArtists={trackedArtists}
                onLoginRequired={handleLoginRequired}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
