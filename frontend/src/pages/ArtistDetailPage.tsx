import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetArtist, useGetArtistEvents } from '../hooks/useQueries';
import EventCard from '../components/EventCard';
import { ArrowLeft, Music } from 'lucide-react';

export default function ArtistDetailPage() {
  const { artistId } = useParams({ from: '/artists/$artistId' });
  const navigate = useNavigate();

  const { data: artist, isLoading: artistLoading, isError: artistError } = useGetArtist(artistId);
  const { data: events = [], isLoading: eventsLoading } = useGetArtistEvents(artistId);

  const isLoading = artistLoading || eventsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-neon-amber border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-muted-foreground text-sm">LOADING ARTIST...</p>
        </div>
      </div>
    );
  }

  if (artistError || !artist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
          <h2 className="font-mono text-xl text-muted-foreground mb-4">ARTIST NOT FOUND</h2>
          <button
            onClick={() => navigate({ to: '/artists' })}
            className="font-mono text-sm text-neon-amber hover:underline flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO ARTISTS
          </button>
        </div>
      </div>
    );
  }

  const sortedEvents = [...events].sort((a, b) => Number(a.dateTime) - Number(b.dateTime));

  return (
    <div className="min-h-screen bg-background">
      {/* Artist Header */}
      <div className="relative">
        <div className="h-64 w-full overflow-hidden">
          <img
            src={artist.imageUrl}
            alt={artist.name}
            className="w-full h-full object-cover object-top"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=1a1a1a&color=f59e0b&size=256`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => navigate({ to: '/artists' })}
              className="font-mono text-xs text-muted-foreground hover:text-neon-amber flex items-center gap-1 mb-3 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              BACK TO ARTISTS
            </button>
            <h1 className="font-mono text-4xl font-bold text-foreground neon-text-amber">
              {artist.name.toUpperCase()}
            </h1>
            <p className="font-mono text-sm text-muted-foreground mt-1">{artist.genre}</p>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="font-mono text-lg font-bold text-foreground mb-4 tracking-wide">
          UPCOMING EVENTS ({sortedEvents.length})
        </h2>

        {sortedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Music className="w-12 h-12 text-muted-foreground mb-3 opacity-30" />
            <p className="font-mono text-muted-foreground">NO UPCOMING EVENTS</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedEvents.map((event, index) => (
              <EventCard
                key={`${event.artistId}-${event.dateTime}-${index}`}
                event={event}
                artistName={artist.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
