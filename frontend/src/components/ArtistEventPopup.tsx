import { useState } from 'react';
import { useGetArtistEvents, useAddEventToRadar, useRemoveEventFromRadar, useGetRadarEvents } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Event } from '../backend';
import { getEventId } from '../lib/eventIdLookup';
import TripPlannerModal from './TripPlannerModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Radar, MapPin, Calendar } from 'lucide-react';
import { buildTicketSearchUrl } from '../utils/ticketSearch';
import { toast } from 'sonner';

interface ArtistEventPopupProps {
  open: boolean;
  onClose: () => void;
  artistId: string;
  artistName: string;
}

function formatDate(dateTime: bigint): string {
  const ms = Number(dateTime) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ArtistEventPopup({ open, onClose, artistId, artistName }: ArtistEventPopupProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: events = [], isLoading } = useGetArtistEvents(artistId);
  const { data: radarEvents = [] } = useGetRadarEvents();
  const addToRadar = useAddEventToRadar();
  const removeFromRadar = useRemoveEventFromRadar();

  const [tripEvent, setTripEvent] = useState<Event | null>(null);

  const sortedEvents = [...events].sort((a, b) => Number(a.dateTime) - Number(b.dateTime));

  const isOnRadar = (event: Event) =>
    radarEvents.some((e) => e.artistId === event.artistId && e.dateTime === event.dateTime);

  const handleRadarToggle = async (event: Event) => {
    if (!isAuthenticated) {
      toast.error('Please login to save events to your radar');
      return;
    }
    const eventId = getEventId(event);
    if (!eventId) {
      toast.error('Event ID not found');
      return;
    }
    try {
      if (isOnRadar(event)) {
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

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="bg-card border border-border max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm font-bold text-neon-amber">
              {artistName.toUpperCase()} — UPCOMING EVENTS
            </DialogTitle>
          </DialogHeader>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-neon-amber border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!isLoading && sortedEvents.length === 0 && (
            <p className="font-mono text-xs text-muted-foreground text-center py-8">
              NO UPCOMING EVENTS
            </p>
          )}

          {!isLoading && sortedEvents.length > 0 && (
            <div className="flex flex-col gap-3">
              {sortedEvents.map((event, index) => {
                const diceUrl = buildTicketSearchUrl('dice', artistName);
                const songkickUrl = buildTicketSearchUrl('songkick', artistName);
                return (
                  <div
                    key={`${event.artistId}-${event.dateTime}-${index}`}
                    className="border border-border p-3 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-mono text-xs font-bold text-foreground leading-tight flex-1">
                        {event.eventTitle}
                      </p>
                      <button
                        onClick={() => handleRadarToggle(event)}
                        disabled={addToRadar.isPending || removeFromRadar.isPending}
                        className={`shrink-0 p-1 border transition-all ${
                          isOnRadar(event)
                            ? 'border-neon-amber text-neon-amber bg-neon-amber/10'
                            : 'border-border text-muted-foreground hover:border-neon-amber hover:text-neon-amber'
                        } disabled:opacity-50`}
                      >
                        <Radar className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="font-mono text-xs">{event.venue}, {event.city}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span className="font-mono text-xs">{formatDate(event.dateTime)}</span>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => setTripEvent(event)}
                        className="font-mono text-xs px-2 py-1 border border-border text-muted-foreground hover:border-neon-amber hover:text-neon-amber transition-all"
                      >
                        ✈ PLAN TRIP
                      </button>
                      <a
                        href={diceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs px-2 py-1 border border-border text-muted-foreground hover:border-neon-amber hover:text-neon-amber transition-all"
                      >
                        🎟 DICE
                      </a>
                      <a
                        href={songkickUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs px-2 py-1 border border-border text-muted-foreground hover:border-neon-amber hover:text-neon-amber transition-all"
                      >
                        🎟 SONGKICK
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {tripEvent && (
        <TripPlannerModal
          event={tripEvent}
          artistName={artistName}
          onClose={() => setTripEvent(null)}
        />
      )}
    </>
  );
}
