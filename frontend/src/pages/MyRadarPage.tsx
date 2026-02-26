import React, { useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetTrackedArtists,
  useGetTrackedArtistEvents,
  useGetArtists,
  useRadarEvents,
} from '../hooks/useQueries';
import { Event } from '../backend';
import LoginPrompt from '../components/LoginPrompt';
import { Calendar, MapPin, Radio, AlertCircle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { buildTicketSearchUrl } from '../utils/ticketSearch';

function formatEventDate(dateTime: bigint): string {
  const dateObj = new Date(Number(dateTime) / 1_000_000);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatEventTime(dateTime: bigint): string {
  const dateObj = new Date(Number(dateTime) / 1_000_000);
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface SavedEventRowProps {
  event: Event;
  artistName?: string;
}

function SavedEventRow({ event, artistName }: SavedEventRowProps) {
  const nameForSearch = artistName ?? event.artistId;

  return (
    <div className="card-industrial p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-mono text-sm font-semibold text-foreground leading-tight line-clamp-2">
            {event.eventTitle}
          </h3>
          {artistName && (
            <p className="text-xs text-amber font-mono mt-0.5">{artistName}</p>
          )}
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded border border-amber/40 text-amber bg-amber/10 shrink-0">
          📡 Saved
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
        <MapPin className="w-3 h-3 shrink-0 text-neon-green" />
        <span className="truncate">
          {event.venue} · {event.city}, {event.country}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
        <Calendar className="w-3 h-3 shrink-0 text-amber" />
        <span>
          {formatEventDate(event.dateTime)} · {formatEventTime(event.dateTime)}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-1 flex-wrap">
        <a
          href={buildTicketSearchUrl('dice', nameForSearch)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono px-2.5 py-1 rounded border border-amber/40 text-amber hover:border-amber hover:bg-amber/10 transition-colors flex items-center gap-1"
        >
          🎟 Dice
        </a>
        <a
          href={buildTicketSearchUrl('songkick', nameForSearch)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono px-2.5 py-1 rounded border border-amber/40 text-amber hover:border-amber hover:bg-amber/10 transition-colors flex items-center gap-1"
        >
          🎟 Songkick
        </a>
      </div>
    </div>
  );
}

export default function MyRadarPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: trackedArtistIds = [] } = useGetTrackedArtists();
  const { data: trackedEvents = [], isLoading: trackedEventsLoading } = useGetTrackedArtistEvents();
  const { data: artists = [] } = useGetArtists();
  const {
    data: radarEvents = [],
    isLoading: radarEventsLoading,
    isSuccess: radarEventsSuccess,
    isError: radarEventsIsError,
    error: radarEventsError,
    refetch: refetchRadarEvents,
  } = useRadarEvents();

  useEffect(() => {
    if (radarEventsIsError && radarEventsError) {
      console.error('[MyRadarPage] Failed to load radar events:', radarEventsError);
    }
  }, [radarEventsIsError, radarEventsError]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <LoginPrompt
          title="My Radar"
          message="Login to track artists and save events to your personal radar."
        />
      </div>
    );
  }

  const getArtistName = (artistId: string) =>
    artists.find((a) => a.id === artistId)?.name ?? artistId;

  // Sort saved events chronologically
  const sortedRadarEvents = [...radarEvents].sort(
    (a, b) => Number(a.dateTime) - Number(b.dateTime)
  );

  // Sort tracked artist events chronologically
  const sortedTrackedEvents = [...trackedEvents].sort(
    (a, b) => Number(a.dateTime) - Number(b.dateTime)
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-10">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <Radio className="w-6 h-6 text-accent" />
          <div>
            <h1 className="font-mono text-2xl font-bold text-foreground tracking-tight">My Radar</h1>
            <p className="text-sm text-muted-foreground font-mono mt-0.5">
              Your saved events and tracked artists
            </p>
          </div>
        </div>

        {/* Backend error banner */}
        {radarEventsIsError && (
          <div className="flex items-start gap-4 p-5 bg-destructive/10 border border-destructive/40 rounded-sm">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-mono font-semibold text-destructive mb-1">
                Unable to connect to the backend
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                Your saved events could not be loaded. The backend may be temporarily unavailable — please try again shortly.
              </p>
              <button
                onClick={() => refetchRadarEvents()}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-neon-amber hover:text-neon-amber/80 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Saved Events Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-mono text-base font-semibold text-foreground">Saved Events</h2>
            {radarEventsSuccess && (
              <span className="text-xs font-mono px-2 py-0.5 rounded border border-border text-muted-foreground">
                {sortedRadarEvents.length}
              </span>
            )}
          </div>

          {radarEventsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-36 rounded" />
              ))}
            </div>
          ) : radarEventsIsError ? (
            <div className="card-industrial p-6 text-center">
              <p className="font-mono text-sm text-muted-foreground">
                Could not load saved events — please retry above.
              </p>
            </div>
          ) : sortedRadarEvents.length === 0 ? (
            <div className="card-industrial p-6 text-center">
              <p className="font-mono text-sm text-muted-foreground">
                No saved events yet. Browse the{' '}
                <a href="/" className="text-accent hover:underline">
                  Discover page
                </a>{' '}
                and add events to your radar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sortedRadarEvents.map((event, idx) => (
                <SavedEventRow
                  key={`${event.artistId}-${event.dateTime}-${idx}`}
                  event={event}
                  artistName={getArtistName(event.artistId)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Tracked Artists Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-mono text-base font-semibold text-foreground">Tracked Artists</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded border border-border text-muted-foreground">
              {trackedArtistIds.length}
            </span>
          </div>

          {trackedArtistIds.length === 0 ? (
            <div className="card-industrial p-6 text-center">
              <p className="font-mono text-sm text-muted-foreground">
                No tracked artists yet. Visit the{' '}
                <a href="/artists" className="text-accent hover:underline">
                  Artists page
                </a>{' '}
                to follow artists.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 mb-6">
              {trackedArtistIds.map((id) => (
                <span
                  key={id}
                  className="text-xs font-mono px-3 py-1.5 rounded border border-border text-muted-foreground bg-card"
                >
                  {getArtistName(id)}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Tracked Artist Events Section */}
        {trackedArtistIds.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-mono text-base font-semibold text-foreground">
                Upcoming from Tracked Artists
              </h2>
              {!trackedEventsLoading && (
                <span className="text-xs font-mono px-2 py-0.5 rounded border border-border text-muted-foreground">
                  {sortedTrackedEvents.length}
                </span>
              )}
            </div>

            {trackedEventsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded" />
                ))}
              </div>
            ) : sortedTrackedEvents.length === 0 ? (
              <div className="card-industrial p-6 text-center">
                <p className="font-mono text-sm text-muted-foreground">
                  No upcoming events from your tracked artists.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sortedTrackedEvents.map((event, idx) => (
                  <div key={`tracked-${event.artistId}-${event.dateTime}-${idx}`} className="card-industrial p-3 flex flex-col gap-2">
                    <h3 className="font-mono text-sm font-semibold text-foreground leading-tight line-clamp-2">
                      {event.eventTitle}
                    </h3>
                    <p className="text-xs text-accent font-mono">{getArtistName(event.artistId)}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                      <MapPin className="w-3 h-3 shrink-0 text-neon-green" />
                      <span className="truncate">{event.city}, {event.country}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                      <Calendar className="w-3 h-3 shrink-0 text-amber" />
                      <span>{formatEventDate(event.dateTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <a
                        href={buildTicketSearchUrl('dice', getArtistName(event.artistId))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono px-2.5 py-1 rounded border border-amber/40 text-amber hover:border-amber hover:bg-amber/10 transition-colors flex items-center gap-1"
                      >
                        🎟 Dice
                      </a>
                      <a
                        href={buildTicketSearchUrl('songkick', getArtistName(event.artistId))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono px-2.5 py-1 rounded border border-amber/40 text-amber hover:border-amber hover:bg-amber/10 transition-colors flex items-center gap-1"
                      >
                        🎟 Songkick
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
