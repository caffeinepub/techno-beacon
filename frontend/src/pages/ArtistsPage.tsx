import { useState } from 'react';
import { useGetArtists, useGetAllEvents } from '../hooks/useQueries';
import ArtistCard from '../components/ArtistCard';
import AdminInitButton from '../components/AdminInitButton';
import { Users } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function ArtistsPage() {
  const { data: artists = [], isLoading: artistsLoading } = useGetArtists();
  const { data: events = [], isLoading: eventsLoading } = useGetAllEvents();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const [search, setSearch] = useState('');

  const isLoading = artistsLoading || eventsLoading;

  const filteredArtists = artists.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const getEventCount = (artistId: string) =>
    events.filter((e) => e.artistId === artistId).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-mono text-3xl font-bold text-foreground neon-text-amber tracking-tight">
              ARTISTS
            </h1>
            <p className="text-muted-foreground font-mono text-sm mt-1">
              Follow artists to track their upcoming events
            </p>
          </div>
          <input
            type="text"
            placeholder="SEARCH ARTISTS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-card border border-border text-foreground font-mono text-sm px-4 py-2 rounded-none focus:outline-none focus:border-neon-amber placeholder:text-muted-foreground w-full md:w-56"
          />
        </div>

        {/* Admin Init Button — shown below header for authenticated users */}
        {isAuthenticated && (
          <div className="mb-6">
            <AdminInitButton />
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-neon-amber border-t-transparent rounded-full animate-spin" />
              <p className="font-mono text-muted-foreground text-sm">LOADING ARTISTS...</p>
            </div>
          </div>
        )}

        {/* Artists Grid */}
        {!isLoading && filteredArtists.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredArtists.map((artist) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                eventCount={getEventCount(artist.id)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredArtists.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="w-16 h-16 text-muted-foreground mb-4 opacity-30" />
            <h3 className="font-mono text-xl text-muted-foreground mb-2">NO ARTISTS FOUND</h3>
            {search ? (
              <p className="text-muted-foreground text-sm max-w-md">
                Try adjusting your search query.
              </p>
            ) : (
              <p className="text-muted-foreground text-sm max-w-md">
                {isAuthenticated
                  ? 'Use the Initialize Data button above to load artists and events.'
                  : 'No artists have been loaded yet.'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
