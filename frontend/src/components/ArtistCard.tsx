import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useToggleTrackedArtist } from '../hooks/useQueries';
import ArtistEventPopup from './ArtistEventPopup';
import { Star, StarOff, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface ArtistCardProps {
  id: string;
  name: string;
  imageUrl: string;
  genre: string;
  eventCount: number;
  isTracked: boolean;
  onLoginRequired?: () => void;
}

export default function ArtistCard({
  id,
  name,
  imageUrl,
  genre,
  eventCount,
  isTracked,
  onLoginRequired,
}: ArtistCardProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const toggleMutation = useToggleTrackedArtist();
  const [showPopup, setShowPopup] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!identity) {
      if (onLoginRequired) {
        onLoginRequired();
      } else {
        toast.error('Please log in to follow artists', {
          description: 'Use the Login button in the top navigation.',
        });
      }
      return;
    }
    try {
      const nowTracked = await toggleMutation.mutateAsync(id);
      toast.success(nowTracked ? `Following ${name}` : `Unfollowed ${name}`);
    } catch {
      toast.error('Failed to update tracking');
    }
  };

  const handleCardClick = () => {
    setShowPopup(true);
  };

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate({ to: '/artists/$artistId', params: { artistId: id } });
  };

  return (
    <>
      <div
        className="bg-card border border-border rounded overflow-hidden cursor-pointer hover:border-primary/60 transition-all group"
        onClick={handleCardClick}
      >
        {/* Artist image */}
        <div className="relative h-48 bg-muted overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl font-bold font-mono text-muted-foreground">
              {name.charAt(0)}
            </div>
          )}
          {/* Follow button overlay */}
          <button
            onClick={handleToggle}
            disabled={toggleMutation.isPending}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
              isTracked
                ? 'bg-primary text-primary-foreground'
                : 'bg-background/80 text-foreground hover:bg-primary hover:text-primary-foreground'
            } disabled:opacity-50`}
            title={isTracked ? 'Unfollow' : 'Follow'}
          >
            {toggleMutation.isPending ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin block" />
            ) : isTracked ? (
              <StarOff className="w-4 h-4" />
            ) : (
              <Star className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Card body */}
        <div className="p-4">
          <h3 className="font-bold font-mono text-foreground text-lg leading-tight mb-1">
            {name}
          </h3>
          {genre && (
            <p className="text-xs text-muted-foreground font-mono mb-3">{genre}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
              <Calendar className="w-3 h-3" />
              {eventCount} upcoming event{eventCount !== 1 ? 's' : ''}
            </span>
            <button
              onClick={handleNavigate}
              className="text-xs font-mono text-primary hover:underline"
            >
              View profile →
            </button>
          </div>
        </div>
      </div>

      {showPopup && (
        <ArtistEventPopup
          artistId={id}
          onClose={() => setShowPopup(false)}
        />
      )}
    </>
  );
}
