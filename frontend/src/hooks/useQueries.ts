import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Artist, Event, UserProfile } from '../backend';

// ── Public read hooks (no auth required) ──────────────────────────────────────

export function useGetArtists() {
  const { actor, isFetching } = useActor();

  return useQuery<Artist[]>({
    queryKey: ['artists'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not ready');
      const result = await actor.getArtists();
      if (!Array.isArray(result)) {
        console.error('[useGetArtists] Unexpected response from getArtists:', result);
        return [];
      }
      if (result.length === 0) {
        console.warn('[useGetArtists] getArtists returned an empty array — seed data may be missing.');
      }
      return result;
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 30, // 30 seconds — short enough to pick up fresh data after upgrades
    retry: 3,
  });
}

export function useGetAllEvents() {
  const { actor, isFetching } = useActor();

  return useQuery<Event[]>({
    queryKey: ['allEvents'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not ready');
      const result = await actor.getAllEvents();
      return Array.isArray(result) ? result : [];
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 30,
    retry: 3,
  });
}

export function useGetEventsByArtist(artistId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Event[]>({
    queryKey: ['eventsByArtist', artistId],
    queryFn: async () => {
      if (!actor || !artistId) return [];
      const result = await actor.getEventsByArtist(artistId);
      return Array.isArray(result) ? result : [];
    },
    enabled: !!actor && !isFetching && !!artistId,
    staleTime: 1000 * 30,
    retry: 3,
  });
}

export function useGetAllEventsByArtist(artistId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Event[]>({
    queryKey: ['allEventsByArtist', artistId],
    queryFn: async () => {
      if (!actor || !artistId) return [];
      const result = await actor.getEventsByArtist(artistId);
      return Array.isArray(result) ? result : [];
    },
    enabled: !!actor && !isFetching && !!artistId,
    staleTime: 1000 * 30,
    retry: 3,
  });
}

export function useGetArtist(artistId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Artist | null>({
    queryKey: ['artist', artistId],
    queryFn: async () => {
      if (!actor || !artistId) return null;
      const result = await actor.getArtist(artistId);
      return result ?? null;
    },
    enabled: !!actor && !isFetching && !!artistId,
    staleTime: 1000 * 30,
    retry: 3,
  });
}

// ── Auth-required hooks ────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !!identity && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetTrackedArtists() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<string[]>({
    queryKey: ['trackedArtists', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getTrackedArtists(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useToggleTrackedArtist() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (artistId: string) => {
      if (!actor || !identity) throw new Error('Must be logged in to track artists');
      return actor.toggleTrackedArtist(artistId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackedArtists'] });
      queryClient.invalidateQueries({ queryKey: ['trackedArtistEvents'] });
      queryClient.invalidateQueries({ queryKey: ['radarSummary'] });
    },
  });
}

export function useGetTrackedArtistEvents() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Event[]>({
    queryKey: ['trackedArtistEvents', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getTrackedArtistEvents(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetRadarSummary() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<[bigint, bigint]>({
    queryKey: ['radarSummary', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [BigInt(0), BigInt(0)];
      return actor.getMyRadarSummary(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useRadarEvents() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Event[]>({
    queryKey: ['radarEvents', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getRadarEvents();
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 1000 * 30,
  });
}

export function useAddEventToRadar() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!actor || !identity) throw new Error('Must be logged in to save events to radar');
      return actor.addEventToRadar(eventId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radarEvents'] });
    },
  });
}

export function useRemoveEventFromRadar() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!actor || !identity) throw new Error('Must be logged in to remove events from radar');
      return actor.removeEventFromRadar(eventId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radarEvents'] });
    },
  });
}

export function useInitializeSeedData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.initializeSeedData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      queryClient.invalidateQueries({ queryKey: ['allEvents'] });
      queryClient.invalidateQueries({ queryKey: ['eventsByArtist'] });
      queryClient.invalidateQueries({ queryKey: ['allEventsByArtist'] });
    },
  });
}
