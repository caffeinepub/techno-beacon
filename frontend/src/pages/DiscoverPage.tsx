import { useState, useMemo } from 'react';
import { useGetAllEvents, useGetArtists } from '../hooks/useQueries';
import EventCard from '../components/EventCard';
import EventFilters from '../components/EventFilters';
import AdminInitButton from '../components/AdminInitButton';
import { Radio } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface FilterState {
  artistName: string;
  city: string;
  dateFrom: string;
  dateTo: string;
}

export default function DiscoverPage() {
  const { data: events = [], isLoading: eventsLoading } = useGetAllEvents();
  const { data: artists = [], isLoading: artistsLoading } = useGetArtists();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    artistName: '',
    city: '',
    dateFrom: '',
    dateTo: '',
  });

  const isLoading = eventsLoading || artistsLoading;

  const filteredEvents = useMemo(() => {
    let result = [...events];

    if (selectedArtistId) {
      result = result.filter((e) => e.artistId === selectedArtistId);
    }

    if (filters.artistName.trim()) {
      const name = filters.artistName.toLowerCase();
      result = result.filter((e) => {
        const artist = artists.find((a) => a.id === e.artistId);
        return artist?.name.toLowerCase().includes(name);
      });
    }

    if (filters.city.trim()) {
      const city = filters.city.toLowerCase();
      result = result.filter((e) => e.city.toLowerCase().includes(city));
    }

    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime();
      result = result.filter((e) => Number(e.dateTime) / 1_000_000 >= from);
    }

    if (filters.dateTo) {
      const to = new Date(filters.dateTo).getTime() + 86400000;
      result = result.filter((e) => Number(e.dateTime) / 1_000_000 <= to);
    }

    result.sort((a, b) => Number(a.dateTime) - Number(b.dateTime));
    return result;
  }, [events, artists, selectedArtistId, filters]);

  const hasArtists = artists.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative w-full overflow-hidden" style={{ height: '320px' }}>
        <img
          src="/assets/generated/techno-beacon-hero.dim_1440x520.png"
          alt="Techno Beacon"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="font-mono text-4xl md:text-5xl font-bold text-foreground neon-text-amber mb-3 tracking-tight">
            DISCOVER EVENTS
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl font-mono">
            Track your favourite techno artists and never miss a show
          </p>
          {isAuthenticated && (
            <div className="mt-4">
              <AdminInitButton />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Artist Filter Chips */}
        {hasArtists && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedArtistId(null)}
                className={`px-4 py-1.5 rounded-none font-mono text-sm border transition-all ${
                  selectedArtistId === null
                    ? 'bg-neon-amber text-background border-neon-amber'
                    : 'bg-transparent text-muted-foreground border-border hover:border-neon-amber hover:text-neon-amber'
                }`}
              >
                ALL
              </button>
              {artists.map((artist) => (
                <button
                  key={artist.id}
                  onClick={() => setSelectedArtistId(artist.id === selectedArtistId ? null : artist.id)}
                  className={`px-4 py-1.5 rounded-none font-mono text-sm border transition-all ${
                    selectedArtistId === artist.id
                      ? 'bg-neon-amber text-background border-neon-amber'
                      : 'bg-transparent text-muted-foreground border-border hover:border-neon-amber hover:text-neon-amber'
                  }`}
                >
                  {artist.name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Event Filters */}
        {hasArtists && (
          <EventFilters filters={filters} onFiltersChange={setFilters} />
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-neon-amber border-t-transparent rounded-full animate-spin" />
              <p className="font-mono text-muted-foreground text-sm">LOADING EVENTS...</p>
            </div>
          </div>
        )}

        {/* Events Grid */}
        {!isLoading && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((event, index) => (
              <EventCard
                key={`${event.artistId}-${event.dateTime}-${index}`}
                event={event}
                artistName={artists.find((a) => a.id === event.artistId)?.name ?? event.artistId}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Radio className="w-16 h-16 text-muted-foreground mb-4 opacity-30" />
            <h3 className="font-mono text-xl text-muted-foreground mb-2">NO EVENTS AVAILABLE YET.</h3>
            {isAuthenticated ? (
              <p className="text-muted-foreground text-sm max-w-md">
                Use the <span className="text-neon-amber font-mono">Initialize Data</span> button above to load event data.
              </p>
            ) : (
              <p className="text-muted-foreground text-sm max-w-md">
                Check back soon for upcoming techno events.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
