import React, { useState } from 'react';
import { X, Calendar, MapPin, Loader2, Radio } from 'lucide-react';
import { toast } from 'sonner';
import { useGetEventsByArtist, useAddEventToRadar, useRemoveEventFromRadar, useRadarEvents } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { Event } from '../backend';
import SourceBadge from './SourceBadge';
import TripPlannerModal from './TripPlannerModal';
import { getBackendEventId } from '../lib/eventIdLookup';
import { buildTicketSearchUrl } from '../utils/ticketSearch';

interface ArtistEventPopupProps {
  artistId: string;
  artistName: string;
  onClose: () => void;
}

function EventRow({
  event,
  artistName,
}: {
  event: Event;
  artistName: string;
}) {
  const { identity } = useInternetIdentity();
  const { data: radarEvents } = useRadarEvents();
  const addToRadar = useAddEventToRadar();
  const removeFromRadar = useRemoveEventFromRadar();
  const [tripPlannerOpen, setTripPlannerOpen] = useState(false);

  const backendEventId = getBackendEventId(event.artistId, event.dateTime);

  const isOnRadar =
    radarEvents?.some(
      (e) => e.artistId === event.artistId && e.dateTime === event.dateTime
    ) ?? false;

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

  const handleToggleRadar = async () => {
    if (!identity) {
      toast.error('Login required', {
        description: 'Please log in to save events to your radar.',
      });
      return;
    }

    if (!backendEventId) {
      console.error('[ArtistEventPopup] Could not resolve backend event ID for event:', {
        artistId: event.artistId,
        dateTime: event.dateTime.toString(),
        eventTitle: event.eventTitle,
      });
      toast.error('Could not save event', {
        description: 'This event could not be identified. Please try again.',
      });
      return;
    }

    try {
      if (isOnRadar) {
        await removeFromRadar.mutateAsync(backendEventId);
        toast.success('Removed from Radar', {
          description: `${event.eventTitle} removed from your radar.`,
        });
      } else {
        await addToRadar.mutateAsync(backendEventId);
        toast.success('Added to Radar', {
          description: `${event.eventTitle} saved to your radar.`,
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error('[ArtistEventPopup] Radar toggle error:', error);
      const isNotFound = error.message?.toLowerCase().includes('not found');
      toast.error('Could not save event', {
        description: isNotFound
          ? 'Event not found — it may have been removed. Please refresh and try again.'
          : 'Something went wrong. Please try again.',
      });
    }
  };

  const isLoading = addToRadar.isPending || removeFromRadar.isPending;

  return (
    <div className="border border-border rounded p-3 flex flex-col gap-2 bg-background/60">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-mono text-sm font-semibold text-foreground leading-tight flex-1 min-w-0">
          {event.eventTitle}
        </h4>
        <SourceBadge source={event.sourceLabel} />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5 shrink-0 text-accent" />
          <span className="font-mono">
            {formatDate(event.dateTime)} · {formatTime(event.dateTime)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-accent" />
          <span className="font-mono truncate">
            {event.venue !== 'TBA' ? `${event.venue}, ` : ''}{event.city}, {event.country}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={handleToggleRadar}
          disabled={isLoading}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded transition-all ${
            isOnRadar
              ? 'bg-accent text-accent-foreground hover:bg-accent/80'
              : 'border border-border text-muted-foreground hover:border-accent hover:text-accent'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Radio className="w-3.5 h-3.5" />
          )}
          {isOnRadar ? '📡 On Radar' : 'Add to Radar'}
        </button>

        <button
          onClick={() => setTripPlannerOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium border border-border text-muted-foreground hover:border-accent hover:text-accent rounded transition-all"
        >
          ✈ Plan Trip
        </button>

        <a
          href={buildTicketSearchUrl('dice', artistName)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-medium border border-amber/40 text-amber hover:border-amber hover:bg-amber/10 rounded transition-all"
        >
          🎟 Dice
        </a>

        <a
          href={buildTicketSearchUrl('songkick', artistName)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-medium border border-amber/40 text-amber hover:border-amber hover:bg-amber/10 rounded transition-all"
        >
          🎟 Songkick
        </a>
      </div>

      {tripPlannerOpen && (
        <TripPlannerModal
          event={event}
          artistName={artistName}
          onClose={() => setTripPlannerOpen(false)}
        />
      )}
    </div>
  );
}

export default function ArtistEventPopup({ artistId, artistName, onClose }: ArtistEventPopupProps) {
  const { data: events = [], isLoading } = useGetEventsByArtist(artistId);

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card border border-border rounded shadow-neon-amber max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="font-mono text-base font-bold text-foreground">{artistName}</h2>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">Upcoming Events</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-3">
          {isLoading && (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="font-mono text-sm">Loading events…</span>
            </div>
          )}

          {!isLoading && sortedEvents.length === 0 && (
            <p className="text-center py-10 text-muted-foreground font-mono text-sm">
              No upcoming events found.
            </p>
          )}

          {!isLoading &&
            sortedEvents.map((event, idx) => (
              <EventRow
                key={`${event.artistId}-${event.dateTime}-${idx}`}
                event={event}
                artistName={artistName}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
