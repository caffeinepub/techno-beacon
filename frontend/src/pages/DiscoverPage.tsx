import React, { useState, useMemo, useEffect } from 'react';
import { useGetArtists, useGetAllEvents } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import EventCard from '../components/EventCard';
import EventFilters from '../components/EventFilters';
import ArtistEventPopup from '../components/ArtistEventPopup';
import AdminInitButton from '../components/AdminInitButton';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function DiscoverPage() {
  const { identity } = useInternetIdentity();

  const {
    data: artists = [],
    isLoading: artistsLoading,
    isError: artistsError,
    error: artistsErrorObj,
    refetch: refetchArtists,
  } = useGetArtists();

  const {
    data: allEvents = [],
    isLoading: eventsLoading,
    isError: eventsError,
    error: eventsErrorObj,
    refetch: refetchEvents,
  } = useGetAllEvents();

  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    artistName: '',
    city: '',
    dateFrom: '',
    dateTo: '',
  });

  const isLoading = artistsLoading || eventsLoading;
  const hasError = artistsError || eventsError;

  // Log full errors to console whenever they change
  useEffect(() => {
    if (artistsError && artistsErrorObj) {
      console.error('[DiscoverPage] Failed to load artists:', artistsErrorObj);
    }
  }, [artistsError, artistsErrorObj]);

  useEffect(() => {
    if (eventsError && eventsErrorObj) {
      console.error('[DiscoverPage] Failed to load events:', eventsErrorObj);
    }
  }, [eventsError, eventsErrorObj]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const artist = artists.find((a) => a.id === event.artistId);
      const artistName = artist?.name ?? event.artistId;

      if (
        filters.artistName &&
        !artistName.toLowerCase().includes(filters.artistName.toLowerCase())
      ) {
        return false;
      }
      if (
        filters.city &&
        !event.city.toLowerCase().includes(filters.city.toLowerCase())
      ) {
        return false;
      }
      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom).getTime();
        const eventMs = Number(event.dateTime) / 1_000_000;
        if (eventMs < from) return false;
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo).getTime() + 86400000;
        const eventMs = Number(event.dateTime) / 1_000_000;
        if (eventMs > to) return false;
      }
      return true;
    });
  }, [allEvents, artists, filters]);

  const showAdminButton =
    !isLoading &&
    !hasError &&
    identity &&
    (artists.length === 0 || (artists.length > 0 && allEvents.length === 0));

  const handleRetry = () => {
    if (artistsError) refetchArtists();
    if (eventsError) refetchEvents();
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative w-full h-[320px] sm:h-[420px] overflow-hidden">
        <img
          src="/assets/generated/techno-beacon-hero.dim_1440x520.png"
          alt="Techno Beacon"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
        <div className="absolute bottom-8 left-0 right-0 px-4 sm:px-8">
          <h1 className="text-4xl sm:text-6xl font-bold font-mono text-foreground tracking-tight drop-shadow-lg">
            DISCOVER
          </h1>
          <p className="text-muted-foreground text-lg mt-1">
            Upcoming techno events worldwide
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Admin re-seed button */}
        {showAdminButton && (
          <div className="mb-8">
            <AdminInitButton />
          </div>
        )}

        {/* Error state — shown prominently above filters when backend is unreachable */}
        {hasError && !isLoading && (
          <div className="mb-8 flex items-start gap-4 p-5 bg-destructive/10 border border-destructive/40 rounded-sm">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-mono font-semibold text-destructive mb-1">
                Unable to connect to the backend
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                Event data could not be loaded. The backend may be temporarily unavailable — please try again shortly.
              </p>
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-neon-amber hover:text-neon-amber/80 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Artist roster chips — only shown when data loaded successfully */}
        {!hasError && artists.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
              Artists
            </p>
            <div className="flex flex-wrap gap-2">
              {artists.map((artist) => (
                <button
                  key={artist.id}
                  onClick={() => setSelectedArtistId(artist.id)}
                  className="px-3 py-1 text-sm font-mono border border-border rounded hover:border-primary hover:text-primary transition-colors"
                >
                  {artist.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8">
          <EventFilters filters={filters} onChange={setFilters} />
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded" />
            ))}
          </div>
        )}

        {/* Empty state — only when loaded successfully but no events match */}
        {!isLoading && !hasError && filteredEvents.length === 0 && (
          <div className="text-center py-20 text-muted-foreground font-mono">
            No upcoming events found.
          </div>
        )}

        {/* Event grid */}
        {!isLoading && !hasError && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, idx) => (
              <EventCard
                key={`${event.artistId}-${event.eventTitle}-${idx}`}
                event={event}
                onArtistClick={(artistId) => setSelectedArtistId(artistId)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Artist event popup */}
      {selectedArtistId && (
        <ArtistEventPopup
          artistId={selectedArtistId}
          onClose={() => setSelectedArtistId(null)}
        />
      )}
    </main>
  );
}
