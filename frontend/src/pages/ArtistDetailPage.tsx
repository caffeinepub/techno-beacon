import React from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetArtist, useGetEventsByArtist, useGetTrackedArtists, useToggleTrackedArtist } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SourceBadge from '../components/SourceBadge';
import { ArrowLeft, Star, StarOff, ExternalLink, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function ArtistDetailPage() {
  const { artistId } = useParams({ strict: false }) as { artistId: string };
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();

  const { data: artist, isLoading: artistLoading } = useGetArtist(artistId ?? null);
  const { data: events = [], isLoading: eventsLoading } = useGetEventsByArtist(artistId ?? null);
  const { data: trackedArtists = [] } = useGetTrackedArtists();
  const toggleMutation = useToggleTrackedArtist();

  const isTracked = trackedArtists.includes(artistId ?? '');
  const isLoading = artistLoading || eventsLoading;

  const sortedEvents = [...events].sort(
    (a, b) => Number(a.dateTime) - Number(b.dateTime)
  );

  const handleToggleTrack = async () => {
    if (!identity) {
      toast.error('Please log in to follow artists', {
        description: 'Use the Login button in the top navigation.',
      });
      return;
    }
    if (!artistId) return;
    try {
      const nowTracked = await toggleMutation.mutateAsync(artistId);
      toast.success(nowTracked ? `Following ${artist?.name}` : `Unfollowed ${artist?.name}`);
    } catch (err) {
      toast.error('Failed to update tracking');
    }
  };

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

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-48 w-full mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!artist) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground font-mono text-xl mb-4">Artist not found.</p>
          <Button variant="outline" onClick={() => navigate({ to: '/artists' })}>
            Back to Artists
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <button
          onClick={() => navigate({ to: '/artists' })}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-mono text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK TO ARTISTS
        </button>

        {/* Artist header */}
        <div className="flex flex-col sm:flex-row gap-6 mb-10">
          <div className="w-32 h-32 shrink-0 rounded overflow-hidden bg-card border border-border">
            {artist.imageUrl ? (
              <img
                src={artist.imageUrl}
                alt={artist.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold font-mono text-muted-foreground">
                {artist.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-4xl font-bold font-mono text-foreground tracking-tight mb-2">
              {artist.name}
            </h1>
            {artist.genre && (
              <Badge variant="outline" className="mb-4 font-mono text-xs">
                {artist.genre}
              </Badge>
            )}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleToggleTrack}
                disabled={toggleMutation.isPending}
                variant={isTracked ? 'secondary' : 'default'}
                size="sm"
                className="font-mono"
              >
                {toggleMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </span>
                ) : isTracked ? (
                  <span className="flex items-center gap-2">
                    <StarOff className="w-4 h-4" />
                    Unfollow
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Follow
                  </span>
                )}
              </Button>
              {!identity && (
                <span className="text-xs text-muted-foreground font-mono">
                  Log in to follow this artist
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Events */}
        <div>
          <h2 className="text-xl font-bold font-mono text-foreground mb-6 tracking-tight">
            UPCOMING EVENTS ({sortedEvents.length})
          </h2>

          {sortedEvents.length === 0 ? (
            <p className="text-muted-foreground font-mono text-center py-12">
              No upcoming events found.
            </p>
          ) : (
            <div className="space-y-4">
              {sortedEvents.map((event, idx) => (
                <div
                  key={`${event.eventTitle}-${idx}`}
                  className="bg-card border border-border rounded p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm leading-snug mb-2">
                        {event.eventTitle}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-mono">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.venue}, {event.city}, {event.country}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(event.dateTime)} · {formatTime(event.dateTime)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <SourceBadge source={event.sourceLabel} />
                      {event.eventUrl && (
                        <a
                          href={event.eventUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
