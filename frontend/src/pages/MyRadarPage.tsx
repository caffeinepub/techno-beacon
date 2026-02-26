import React, { useMemo } from 'react';
import { Radio, Music, MapPin, Calendar, ExternalLink } from 'lucide-react';
import EventCard from '../components/EventCard';
import LoginPrompt from '../components/LoginPrompt';
import {
  useGetTrackedArtistEvents,
  useGetRadarSummary,
  useRadarEvents,
  useGetArtists,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Skeleton } from '@/components/ui/skeleton';
import type { Event } from '../backend';

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-card border border-border rounded-sm p-4 flex flex-col gap-1">
      <span className="text-2xl font-bold font-mono text-neon-amber">{value}</span>
      <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{label}</span>
    </div>
  );
}

function formatDate(dateTime: bigint): string {
  const ms = Number(dateTime) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(dateTime: bigint): string {
  const ms = Number(dateTime) / 1_000_000;
  return new Date(ms).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

interface SavedEventRowProps {
  event: Event;
  artistName: string;
}

function SavedEventRow({ event, artistName }: SavedEventRowProps) {
  return (
    <div className="bg-card border border-border rounded-sm p-4 pl-5 relative overflow-hidden hover:border-neon-amber/40 transition-colors">
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-neon-amber opacity-60" />
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono uppercase tracking-widest text-neon-amber mb-1 truncate">
            {artistName}
          </p>
          <h4 className="text-sm font-semibold text-foreground leading-snug mb-2 line-clamp-2">
            {event.eventTitle}
          </h4>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-mono">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" />
              {event.venue} · {event.city}, {event.country}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 shrink-0" />
              {formatDate(event.dateTime)} · {formatTime(event.dateTime)}
            </span>
          </div>
        </div>
        <a
          href={event.eventUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neon-amber/10 text-neon-amber border border-neon-amber/30 rounded-sm hover:bg-neon-amber/20 hover:border-neon-amber/60 transition-all duration-200 shrink-0"
        >
          Tickets
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

export default function MyRadarPage() {
  const { identity } = useInternetIdentity();
  const { data: trackedEvents, isLoading: eventsLoading } = useGetTrackedArtistEvents();
  const { data: summary, isLoading: summaryLoading } = useGetRadarSummary();
  const { data: radarEvents = [], isLoading: radarEventsLoading } = useRadarEvents();
  const { data: artists = [] } = useGetArtists();

  // Build artist id → name map
  const artistMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const a of artists) {
      map[a.id] = a.name;
    }
    return map;
  }, [artists]);

  // Always call useMemo unconditionally (Rules of Hooks)
  const sortedTrackedEvents = useMemo(() => {
    if (!trackedEvents) return [];
    return [...trackedEvents].sort((a, b) => Number(a.dateTime - b.dateTime));
  }, [trackedEvents]);

  const sortedRadarEvents = useMemo(() => {
    return [...radarEvents].sort((a, b) => Number(a.dateTime) - Number(b.dateTime));
  }, [radarEvents]);

  if (!identity) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <LoginPrompt
            title="Your Personal Radar"
            message="Login to see upcoming events from artists you follow. Build your personal techno radar."
          />
        </div>
      </div>
    );
  }

  const artistCount = summary ? Number(summary[0]) : 0;
  const eventCount = summary ? Number(summary[1]) : 0;

  const getArtistName = (artistId: string) =>
    artistMap[artistId] ??
    artistId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Radio className="w-5 h-5 text-neon-amber" />
          <h1 className="text-lg font-bold font-mono uppercase tracking-widest text-foreground">
            My Radar
          </h1>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {summaryLoading ? (
            <>
              <div className="bg-card border border-border rounded-sm p-4">
                <Skeleton className="h-8 w-12 mb-2 bg-secondary" />
                <Skeleton className="h-3 w-24 bg-secondary" />
              </div>
              <div className="bg-card border border-border rounded-sm p-4">
                <Skeleton className="h-8 w-12 mb-2 bg-secondary" />
                <Skeleton className="h-3 w-24 bg-secondary" />
              </div>
            </>
          ) : (
            <>
              <StatCard label="Artists Followed" value={artistCount} />
              <StatCard label="Upcoming Events" value={eventCount} />
              <StatCard label="Saved Events" value={sortedRadarEvents.length} />
            </>
          )}
        </div>

        {/* ── Saved Events section ─────────────────────────────────────────── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <Radio className="w-5 h-5 text-neon-amber" />
            <h2 className="text-lg font-bold font-mono uppercase tracking-widest text-foreground">
              Saved Events
            </h2>
            {!radarEventsLoading && sortedRadarEvents.length > 0 && (
              <span className="text-xs font-mono text-muted-foreground ml-auto">
                {sortedRadarEvents.length} {sortedRadarEvents.length === 1 ? 'event' : 'events'}
              </span>
            )}
          </div>

          {radarEventsLoading && (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-sm p-4 pl-5">
                  <Skeleton className="h-3 w-24 mb-2 bg-secondary" />
                  <Skeleton className="h-4 w-48 mb-3 bg-secondary" />
                  <Skeleton className="h-3 w-40 bg-secondary" />
                </div>
              ))}
            </div>
          )}

          {!radarEventsLoading && sortedRadarEvents.length === 0 && (
            <div className="text-center py-10 border border-dashed border-border rounded-sm">
              <Radio className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm font-mono mb-1">
                No saved events yet.
              </p>
              <p className="text-muted-foreground/60 text-xs font-mono">
                Tap <span className="text-neon-amber">📡 Add to Radar</span> on any event to save it here.
              </p>
            </div>
          )}

          {!radarEventsLoading && sortedRadarEvents.length > 0 && (
            <div className="space-y-3">
              {sortedRadarEvents.map((event, idx) => (
                <SavedEventRow
                  key={`${event.eventTitle}-${event.dateTime}-${idx}`}
                  event={event}
                  artistName={getArtistName(event.artistId)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Tracked Artist Events section ────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Music className="w-5 h-5 text-neon-amber" />
            <h2 className="text-lg font-bold font-mono uppercase tracking-widest text-foreground">
              Upcoming Events
            </h2>
            {!eventsLoading && sortedTrackedEvents.length > 0 && (
              <span className="text-xs font-mono text-muted-foreground ml-auto">
                {sortedTrackedEvents.length} {sortedTrackedEvents.length === 1 ? 'event' : 'events'}
              </span>
            )}
          </div>

          {eventsLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-sm p-4 pl-5">
                  <Skeleton className="h-3 w-24 mb-2 bg-secondary" />
                  <Skeleton className="h-4 w-48 mb-3 bg-secondary" />
                  <Skeleton className="h-3 w-40 mb-2 bg-secondary" />
                  <Skeleton className="h-3 w-36 bg-secondary" />
                </div>
              ))}
            </div>
          )}

          {!eventsLoading && sortedTrackedEvents.length === 0 && (
            <div className="text-center py-16">
              <Music className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-sm font-mono mb-2">
                No upcoming events from your followed artists.
              </p>
              <p className="text-muted-foreground/60 text-xs font-mono">
                Follow artists on the Artists page to see their events here.
              </p>
            </div>
          )}

          {!eventsLoading && sortedTrackedEvents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedTrackedEvents.map((event, idx) => (
                <EventCard key={`${event.artistId}-${event.dateTime}-${idx}`} event={event} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
