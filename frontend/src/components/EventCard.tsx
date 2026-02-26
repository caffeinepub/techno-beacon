import React, { useState } from 'react';
import { MapPin, Calendar, ExternalLink, Music, Plane, Radio } from 'lucide-react';
import { toast } from 'sonner';
import type { Event } from '../backend';
import SourceBadge from './SourceBadge';
import TripPlannerModal from './TripPlannerModal';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useRadarEvents, useAddEventToRadar, useRemoveEventFromRadar } from '../hooks/useQueries';

interface EventCardProps {
  event: Event;
  eventId?: string;
  onArtistClick?: (artistId: string) => void;
}

function formatDate(dateTime: bigint): string {
  const ms = Number(dateTime) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(dateTime: bigint): string {
  const ms = Number(dateTime) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function artistIdToName(artistId: string): string {
  return artistId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Derive a stable event ID from event fields (matches backend seed data keys)
function deriveEventId(event: Event): string {
  // Use artistId + a slug of the title as a best-effort key
  // The backend uses keys like "richie_berlin_berghain", "dave_paris_off_the_grid", etc.
  // We pass the eventId prop when available; otherwise fall back to title-based slug
  const titleSlug = event.eventTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40);
  return `${event.artistId}_${titleSlug}`;
}

export default function EventCard({ event, eventId, onArtistClick }: EventCardProps) {
  const [showTripPlanner, setShowTripPlanner] = useState(false);
  const { identity } = useInternetIdentity();
  const { data: radarEvents = [] } = useRadarEvents();
  const addToRadar = useAddEventToRadar();
  const removeFromRadar = useRemoveEventFromRadar();

  const isAuthenticated = !!identity;

  // Check if this event is already in the radar by matching title + dateTime
  const isOnRadar = radarEvents.some(
    (re) => re.eventTitle === event.eventTitle && re.dateTime === event.dateTime
  );

  const handleRadarToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Log in to save events to your Radar');
      return;
    }

    // We need the event ID to call the backend. Use the passed eventId prop or derive it.
    const id = eventId ?? deriveEventId(event);

    if (isOnRadar) {
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

  const radarPending = addToRadar.isPending || removeFromRadar.isPending;

  return (
    <>
      <article className="group relative bg-card border border-border rounded-sm card-hover overflow-hidden">
        {/* Neon accent line on left */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-neon-amber opacity-60 group-hover:opacity-100 transition-opacity" />

        <div className="p-4 pl-5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Music className="w-3 h-3 text-neon-amber shrink-0" />
                {onArtistClick ? (
                  <button
                    className="text-xs font-mono uppercase tracking-widest text-neon-amber truncate hover:underline cursor-pointer"
                    onClick={() => onArtistClick(event.artistId)}
                    aria-label={`View ${event.artistId} events`}
                  >
                    {artistIdToName(event.artistId)}
                  </button>
                ) : (
                  <span className="text-xs font-mono uppercase tracking-widest text-neon-amber truncate">
                    {artistIdToName(event.artistId)}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
                {event.eventTitle}
              </h3>
            </div>
            <SourceBadge source={event.sourceLabel} className="shrink-0 mt-0.5" />
          </div>

          {/* Venue & Location */}
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground truncate">
              {event.venue} · {event.city}, {event.country}
            </span>
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-1.5 mb-4">
            <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
            <span className="text-xs font-mono text-muted-foreground">
              {formatDate(event.dateTime)} · {formatTime(event.dateTime)}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              {/* Plan Trip button */}
              <button
                onClick={() => setShowTripPlanner(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neon-green/10 text-neon-green border border-neon-green/30 rounded-sm hover:bg-neon-green/20 hover:border-neon-green/60 transition-all duration-200"
                aria-label="Plan trip to this event"
              >
                <Plane className="w-3 h-3" />
                Plan Trip
              </button>

              {/* Add to Radar button */}
              <button
                onClick={handleRadarToggle}
                disabled={radarPending}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-sm transition-all duration-200 disabled:opacity-50 ${
                  isOnRadar
                    ? 'bg-neon-amber/20 text-neon-amber border-neon-amber hover:bg-neon-amber/30'
                    : 'bg-neon-amber/5 text-neon-amber/70 border-neon-amber/30 hover:bg-neon-amber/15 hover:text-neon-amber hover:border-neon-amber/60'
                }`}
                aria-label={isOnRadar ? 'Remove from Radar' : 'Add to Radar'}
              >
                <Radio className="w-3 h-3" />
                {isOnRadar ? 'On Radar' : 'Add to Radar'}
              </button>
            </div>

            <a
              href={event.eventUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neon-amber/10 text-neon-amber border border-neon-amber/30 rounded-sm hover:bg-neon-amber/20 hover:border-neon-amber/60 transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              Tickets
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </article>

      {/* Trip Planner Modal */}
      {showTripPlanner && (
        <TripPlannerModal
          event={event}
          artistName={artistIdToName(event.artistId)}
          onClose={() => setShowTripPlanner(false)}
        />
      )}
    </>
  );
}
