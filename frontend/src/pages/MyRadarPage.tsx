import { useGetRadarEvents, useGetTrackedArtists } from '../hooks/useQueries';
import EventCard from '../components/EventCard';
import LoginPrompt from '../components/LoginPrompt';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Radar, Music } from 'lucide-react';

export default function MyRadarPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: radarEvents = [], isLoading: radarLoading } = useGetRadarEvents();
  const { data: trackedArtists = [], isLoading: artistsLoading } = useGetTrackedArtists();

  const isLoading = radarLoading || artistsLoading;

  if (!isAuthenticated) {
    return (
      <LoginPrompt
        title="MY RADAR"
        message="Login to track your favourite artists and save events to your personal radar."
      />
    );
  }

  const sortedEvents = [...radarEvents].sort((a, b) => Number(a.dateTime) - Number(b.dateTime));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-mono text-3xl font-bold text-foreground neon-text-amber tracking-tight">
            MY RADAR
          </h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            Your saved events and tracked artists
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-card border border-border p-4">
            <p className="font-mono text-xs text-muted-foreground mb-1">TRACKED ARTISTS</p>
            <p className="font-mono text-3xl font-bold text-neon-amber">
              {isLoading ? '—' : trackedArtists.length}
            </p>
          </div>
          <div className="bg-card border border-border p-4">
            <p className="font-mono text-xs text-muted-foreground mb-1">SAVED EVENTS</p>
            <p className="font-mono text-3xl font-bold text-neon-amber">
              {isLoading ? '—' : sortedEvents.length}
            </p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-neon-amber border-t-transparent rounded-full animate-spin" />
              <p className="font-mono text-muted-foreground text-sm">LOADING YOUR RADAR...</p>
            </div>
          </div>
        )}

        {/* Saved Events */}
        {!isLoading && (
          <div>
            <h2 className="font-mono text-lg font-bold text-foreground mb-4 tracking-wide">
              SAVED EVENTS
            </h2>
            {sortedEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Radar className="w-12 h-12 text-muted-foreground mb-3 opacity-30" />
                <p className="font-mono text-muted-foreground mb-1">NO SAVED EVENTS YET</p>
                <p className="font-mono text-xs text-muted-foreground">
                  Browse events and click the radar icon to save them here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedEvents.map((event, index) => (
                  <EventCard
                    key={`radar-${event.artistId}-${event.dateTime}-${index}`}
                    event={event}
                    artistName={event.artistId}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tracked Artists Section */}
        {!isLoading && trackedArtists.length > 0 && (
          <div className="mt-10">
            <h2 className="font-mono text-lg font-bold text-foreground mb-4 tracking-wide">
              TRACKED ARTISTS ({trackedArtists.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {trackedArtists.map((artistId) => (
                <span
                  key={artistId}
                  className="font-mono text-xs px-3 py-1.5 border border-neon-amber text-neon-amber"
                >
                  {artistId.replace(/-/g, ' ').replace(/_/g, ' ').toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
