import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useToggleTrackedArtist, useGetTrackedArtists } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Artist } from '../backend';
import ArtistEventPopup from './ArtistEventPopup';
import { CalendarDays, UserPlus, UserMinus } from 'lucide-react';
import { toast } from 'sonner';

interface ArtistCardProps {
  artist: Artist;
  eventCount: number;
}

export default function ArtistCard({ artist, eventCount }: ArtistCardProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: trackedArtists = [] } = useGetTrackedArtists();
  const toggleTracked = useToggleTrackedArtist();

  const [popupOpen, setPopupOpen] = useState(false);

  const isTracked = trackedArtists.includes(artist.id);

  const handleToggleTrack = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to follow artists');
      return;
    }
    try {
      const nowTracked = await toggleTracked.mutateAsync(artist.id);
      toast.success(nowTracked ? `Following ${artist.name}` : `Unfollowed ${artist.name}`);
    } catch {
      toast.error('Failed to update artist tracking');
    }
  };

  const handleEventsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPopupOpen(true);
  };

  return (
    <>
      <div
        className="bg-card border border-border hover:border-neon-amber transition-all duration-200 cursor-pointer group card-hover overflow-hidden"
        onClick={() => navigate({ to: '/artists/$artistId', params: { artistId: artist.id } })}
      >
        {/* Artist Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={artist.imageUrl}
            alt={artist.name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=1a1a1a&color=f59e0b&size=256`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        </div>

        {/* Artist Info */}
        <div className="p-4">
          <h3 className="font-mono text-sm font-bold text-foreground mb-0.5">{artist.name}</h3>
          <p className="font-mono text-xs text-muted-foreground mb-3">{artist.genre}</p>

          <div className="flex items-center justify-between gap-2">
            {/* Events Count Button */}
            <button
              onClick={handleEventsClick}
              className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-neon-amber transition-colors"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>{eventCount} EVENT{eventCount !== 1 ? 'S' : ''}</span>
            </button>

            {/* Follow Button */}
            <button
              onClick={handleToggleTrack}
              disabled={toggleTracked.isPending}
              className={`flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 border transition-all disabled:opacity-50 ${
                isTracked
                  ? 'border-neon-amber text-neon-amber bg-neon-amber/10 hover:bg-neon-amber/20'
                  : 'border-border text-muted-foreground hover:border-neon-amber hover:text-neon-amber'
              }`}
            >
              {isTracked ? (
                <>
                  <UserMinus className="w-3 h-3" />
                  FOLLOWING
                </>
              ) : (
                <>
                  <UserPlus className="w-3 h-3" />
                  FOLLOW
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <ArtistEventPopup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        artistId={artist.id}
        artistName={artist.name}
      />
    </>
  );
}
