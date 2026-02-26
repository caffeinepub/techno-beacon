import React, { useState } from 'react';
import { useGetAllEventsByArtist, useGetArtist, useRadarEvents, useAddEventToRadar, useRemoveEventFromRadar } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import SourceBadge from './SourceBadge';
import TripPlannerModal from './TripPlannerModal';
import { MapPin, Calendar, ExternalLink, Plane, Radio } from 'lucide-react';
import { toast } from 'sonner';
import type { Event } from '../backend';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface ArtistEventPopupProps {
  artistId: string;
  onClose: () => void;
}

// Derive a stable event ID from event fields (matches backend seed data keys)
function deriveEventId(event: Event): string {
  const titleSlug = event.eventTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40);
  return `${event.artistId}_${titleSlug}`;
}

export default function ArtistEventPopup({ artistId, onClose }: ArtistEventPopupProps) {
  const { data: artist } = useGetArtist(artistId);
  const {
    data: events = [],
    isLoading,
    isFetched,
    isError,
  } = useGetAllEventsByArtist(artistId);

  const { identity } = useInternetIdentity();
  const { data: radarEvents = [] } = useRadarEvents();
  const addToRadar = useAddEventToRadar();
  const removeFromRadar = useRemoveEventFromRadar();

  const [tripPlanEvent, setTripPlanEvent] = useState<Event | null>(null);

  const isAuthenticated = !!identity;

  const sortedEvents = [...events].sort(
    (a, b) => Number(a.dateTime) - Number(b.dateTime)
  );

  const formatDate = (dateTime: bigint) => {
    const ms = Number(dateTime) / 1_000_000;
    return new Date(ms).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateTime: bigint) => {
    const ms = Number(dateTime) / 1_000_000;
    return new Date(ms).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isEventOnRadar = (event: Event) =>
    radarEvents.some(
      (re) => re.eventTitle === event.eventTitle && re.dateTime === event.dateTime
    );

  const handleRadarToggle = (event: Event) => {
    if (!isAuthenticated) {
      toast.error('Log in to save events to your Radar');
      return;
    }

    const id = deriveEventId(event);
    const onRadar = isEventOnRadar(event);

    if (onRadar) {
      removeFromRadar.mutate(id, {
        onSuccess: () => toast.success('Removed from Radar'),
        onError: () => toast.error('Failed to remove from Radar'),
      });
    } else {
      addToRadar.mutate(id, {
        onSuccess: () => toast.success('📡 Added to Radar!'),
        onError: () => toast.error('Failed to add to Radar'),
      });
    }
  };

  const artistName = artist?.name ?? artistId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <>
      <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-mono text-xl text-foreground">
              {artistName} — Upcoming Events
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-3">
            {/* Loading state */}
            {isLoading && (
              <>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded" />
                ))}
              </>
            )}

            {/* Error state */}
            {isError && !isLoading && (
              <p className="text-destructive font-mono text-sm text-center py-8">
                Failed to load events. Please try again.
              </p>
            )}

            {/* Empty state — only shown when fully loaded */}
            {!isLoading && isFetched && !isError && sortedEvents.length === 0 && (
              <p className="text-muted-foreground font-mono text-sm text-center py-8">
                No upcoming events found.
              </p>
            )}

            {/* Event list */}
            {!isLoading && sortedEvents.length > 0 &&
              sortedEvents.map((event, idx) => {
                const onRadar = isEventOnRadar(event);
                const radarPending = addToRadar.isPending || removeFromRadar.isPending;

                return (
                  <div
                    key={`${event.eventTitle}-${idx}`}
                    className="bg-background border border-border rounded p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-sm leading-snug mb-2">
                          {event.eventTitle}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-mono">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.venue}, {event.city}, {event.country}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(event.dateTime)} · {formatTime(event.dateTime)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                        <SourceBadge source={event.sourceLabel} />

                        {/* Add to Radar button */}
                        <button
                          onClick={() => handleRadarToggle(event)}
                          disabled={radarPending}
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold border rounded transition-all duration-200 disabled:opacity-50 ${
                            onRadar
                              ? 'bg-neon-amber/20 text-neon-amber border-neon-amber hover:bg-neon-amber/30'
                              : 'bg-neon-amber/5 text-neon-amber/70 border-neon-amber/30 hover:bg-neon-amber/15 hover:text-neon-amber hover:border-neon-amber/60'
                          }`}
                          aria-label={onRadar ? 'Remove from Radar' : 'Add to Radar'}
                        >
                          <Radio className="w-3 h-3" />
                          <span className="hidden sm:inline">{onRadar ? 'On Radar' : 'Add to Radar'}</span>
                        </button>

                        {/* Plan Trip button */}
                        <button
                          onClick={() => setTripPlanEvent(event)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-neon-green/10 text-neon-green border border-neon-green/30 rounded hover:bg-neon-green/20 hover:border-neon-green/60 transition-all duration-200"
                          aria-label="Plan trip to this event"
                        >
                          <Plane className="w-3 h-3" />
                          <span className="hidden sm:inline">Plan Trip</span>
                        </button>

                        {event.eventUrl && (
                          <a
                            href={event.eventUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </DialogContent>
      </Dialog>

      {/* Trip Planner Modal — rendered outside the artist popup dialog */}
      {tripPlanEvent && (
        <TripPlannerModal
          event={tripPlanEvent}
          artistName={artistName}
          onClose={() => setTripPlanEvent(null)}
        />
      )}
    </>
  );
}
