import { useState } from 'react';
import { useAddEventToRadar, useRemoveEventFromRadar, useGetRadarEvents } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Event } from '../backend';
import SourceBadge from './SourceBadge';
import TripPlannerModal from './TripPlannerModal';
import { Radar, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { buildTicketSearchUrl } from '../utils/ticketSearch';
import { getEventId } from '../lib/eventIdLookup';
import { toast } from 'sonner';

interface EventCardProps {
  event: Event;
  artistName: string;
}

function formatDate(dateTime: bigint): string {
  const ms = Number(dateTime) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(dateTime: bigint): string {
  const ms = Number(dateTime) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function EventCard({ event, artistName }: EventCardProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: radarEvents = [] } = useGetRadarEvents();
  const addToRadar = useAddEventToRadar();
  const removeFromRadar = useRemoveEventFromRadar();

  const [tripPlannerOpen, setTripPlannerOpen] = useState(false);

  const eventId = getEventId(event);
  const isOnRadar = radarEvents.some(
    (e) => e.artistId === event.artistId && e.dateTime === event.dateTime
  );

  const handleRadarToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save events to your radar');
      return;
    }
    if (!eventId) {
      toast.error('Event ID not found');
      return;
    }
    try {
      if (isOnRadar) {
        await removeFromRadar.mutateAsync(eventId);
        toast.success('Removed from radar');
      } else {
        await addToRadar.mutateAsync(eventId);
        toast.success('Added to radar');
      }
    } catch {
      toast.error('Failed to update radar');
    }
  };

  const diceUrl = buildTicketSearchUrl('dice', artistName);
  const songkickUrl = buildTicketSearchUrl('songkick', artistName);

  return (
    <>
      <div className="bg-card border border-border hover:border-neon-amber transition-all duration-200 p-4 flex flex-col gap-3 group card-hover">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-mono text-sm font-bold text-foreground leading-tight line-clamp-2">
              {event.eventTitle}
            </h3>
            <p className="font-mono text-xs text-neon-amber mt-0.5">{artistName}</p>
          </div>
          <button
            onClick={handleRadarToggle}
            disabled={addToRadar.isPending || removeFromRadar.isPending}
            className={`shrink-0 p-1.5 border transition-all ${
              isOnRadar
                ? 'border-neon-amber text-neon-amber bg-neon-amber/10'
                : 'border-border text-muted-foreground hover:border-neon-amber hover:text-neon-amber'
            } disabled:opacity-50`}
            title={isOnRadar ? 'Remove from radar' : 'Add to radar'}
          >
            <Radar className="w-4 h-4" />
          </button>
        </div>

        {/* Event Details */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="font-mono text-xs truncate">
              {event.venue}, {event.city}, {event.country}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-3 h-3 shrink-0" />
            <span className="font-mono text-xs">
              {formatDate(event.dateTime)} · {formatTime(event.dateTime)}
            </span>
          </div>
        </div>

        {/* Source Badge */}
        <div className="flex items-center gap-2">
          <SourceBadge source={event.sourceLabel} />
          {event.eventUrl && event.eventUrl !== 'https://ra.co' && (
            <a
              href={event.eventUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-muted-foreground hover:text-neon-amber flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              VIEW
            </a>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-auto pt-2 border-t border-border">
          <button
            onClick={() => setTripPlannerOpen(true)}
            className="w-full font-mono text-xs py-2 border border-border text-muted-foreground hover:border-neon-amber hover:text-neon-amber transition-all"
          >
            ✈ PLAN TRIP
          </button>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={diceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs py-2 border border-border text-muted-foreground hover:border-neon-amber hover:text-neon-amber transition-all text-center"
            >
              🎟 DICE
            </a>
            <a
              href={songkickUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs py-2 border border-border text-muted-foreground hover:border-neon-amber hover:text-neon-amber transition-all text-center"
            >
              🎟 SONGKICK
            </a>
          </div>
        </div>
      </div>

      {tripPlannerOpen && (
        <TripPlannerModal
          event={event}
          artistName={artistName}
          onClose={() => setTripPlannerOpen(false)}
        />
      )}
    </>
  );
}
