import React, { useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import { useGetArtist, useGetEventsByArtist } from '../hooks/useQueries';
import EventCard from '../components/EventCard';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@tanstack/react-router';

export default function ArtistDetailPage() {
  const { artistId } = useParams({ strict: false }) as { artistId?: string };

  const {
    data: artist,
    isLoading: artistLoading,
    isError: artistError,
    error: artistErrorObj,
    refetch: refetchArtist,
  } = useGetArtist(artistId ?? null);

  const {
    data: events = [],
    isLoading: eventsLoading,
    isError: eventsError,
    error: eventsErrorObj,
    refetch: refetchEvents,
  } = useGetEventsByArtist(artistId ?? null);

  const isLoading = artistLoading || eventsLoading;
  const hasError = artistError || eventsError;

  useEffect(() => {
    if (artistError && artistErrorObj) {
      console.error('[ArtistDetailPage] Failed to load artist:', artistErrorObj);
    }
    if (eventsError && eventsErrorObj) {
      console.error('[ArtistDetailPage] Failed to load events:', eventsErrorObj);
    }
  }, [artistError, artistErrorObj, eventsError, eventsErrorObj]);

  const handleRetry = () => {
    refetchArtist();
    refetchEvents();
  };

  // Defensive filter: exclude any stale Rostock / Kulturzentrum events
  const sanitisedEvents = events.filter((event) => {
    const cityLower = event.city.toLowerCase();
    const venueLower = event.venue.toLowerCase();
    if (cityLower.includes('rostock')) return false;
    if (venueLower.includes('kulturzentrum')) return false;
    return true;
  });

  const sortedEvents = [...sanitisedEvents].sort(
    (a, b) => Number(a.dateTime) - Number(b.dateTime)
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back link */}
        <Link
          to="/artists"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All Artists
        </Link>

        {/* Error state */}
        {hasError && !isLoading && (
          <div className="mb-8 flex items-start gap-4 p-5 bg-destructive/10 border border-destructive/40 rounded-sm">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-mono font-semibold text-destructive mb-1">
                Unable to connect to the backend — please try again shortly.
              </p>
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-neon-amber hover:text-neon-amber/80 transition-colors mt-2"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded" />
              ))}
            </div>
          </div>
        )}

        {/* Artist header */}
        {!isLoading && artist && (
          <div className="flex items-start gap-6 mb-10">
            <img
              src={artist.imageUrl}
              alt={artist.name}
              className="w-24 h-24 rounded object-cover border border-border shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://via.placeholder.com/96x96/1a1a1a/666666?text=' +
                  encodeURIComponent(artist.name.charAt(0));
              }}
            />
            <div>
              <h1 className="text-3xl font-bold font-mono text-foreground">{artist.name}</h1>
              <p className="text-sm text-muted-foreground font-mono mt-1">{artist.genre}</p>
              <p className="text-xs text-muted-foreground font-mono mt-2">
                {sortedEvents.length} upcoming event{sortedEvents.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Events grid */}
        {!isLoading && !hasError && sortedEvents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {sortedEvents.map((event, idx) => (
              <EventCard
                key={`${event.artistId}-${event.dateTime}-${idx}`}
                event={event}
                artistName={artist?.name ?? event.artistId}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !hasError && sortedEvents.length === 0 && artist && (
          <div className="text-center py-20 text-muted-foreground font-mono">
            No upcoming events for {artist.name}.
          </div>
        )}
      </div>
    </main>
  );
}
