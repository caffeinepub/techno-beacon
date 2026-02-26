import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Event, Artist, UserProfile } from '../backend';

export function useGetAllEvents() {
  const { actor, isFetching } = useActor();

  return useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEvents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetEventsByArtist(artistId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Event[]>({
    queryKey: ['events', 'artist', artistId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEventsByArtist(artistId);
    },
    enabled: !!actor && !isFetching && !!artistId,
  });
}

export function useGetArtists() {
  const { actor, isFetching } = useActor();

  return useQuery<Artist[]>({
    queryKey: ['artists'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getArtists();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetArtist(artistId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Artist | null>({
    queryKey: ['artist', artistId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getArtist(artistId);
    },
    enabled: !!actor && !isFetching && !!artistId,
  });
}

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
    isFetched: !!actor && query.isFetched,
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

export function useToggleTrackedArtist() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (artistId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleTrackedArtist(artistId);
    },
    onSuccess: () => {
      if (identity) {
        queryClient.invalidateQueries({ queryKey: ['trackedArtists'] });
        queryClient.invalidateQueries({ queryKey: ['trackedArtistEvents'] });
        queryClient.invalidateQueries({ queryKey: ['radarSummary'] });
      }
    },
  });
}

export function useGetTrackedArtists() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<string[]>({
    queryKey: ['trackedArtists'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const principal = identity.getPrincipal();
      return actor.getTrackedArtists(principal);
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetTrackedArtistEvents() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Event[]>({
    queryKey: ['trackedArtistEvents'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const principal = identity.getPrincipal();
      return actor.getTrackedArtistEvents(principal);
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useRadarEvents() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Event[]>({
    queryKey: ['radarEvents'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getRadarEvents();
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 0,
  });
}

export function useAddEventToRadar() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.addEventToRadar(eventId);
      console.log('[addEventToRadar] result:', result);

      if (result.__kind__ === 'eventNotFound') {
        console.error('[addEventToRadar] Event not found in backend:', result.eventNotFound);
        throw new Error(`Event not found: ${result.eventNotFound}`);
      }
      if (result.__kind__ === 'unauthorized') {
        console.error('[addEventToRadar] Unauthorized');
        throw new Error('Unauthorized: Please log in to save events to your radar.');
      }
      // alreadyExists is treated as success (idempotent)
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radarEvents'] });
    },
  });
}

export function useRemoveEventFromRadar() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.removeEventFromRadar(eventId);
      console.log('[removeEventFromRadar] result:', result);

      if (result.__kind__ === 'unauthorized') {
        console.error('[removeEventFromRadar] Unauthorized');
        throw new Error('Unauthorized: Please log in to manage your radar.');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radarEvents'] });
    },
  });
}

export function useGetMyRadarSummary() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<[bigint, bigint]>({
    queryKey: ['radarSummary'],
    queryFn: async () => {
      if (!actor || !identity) return [BigInt(0), BigInt(0)];
      const principal = identity.getPrincipal();
      return actor.getMyRadarSummary(principal);
    },
    enabled: !!actor && !isFetching && !!identity,
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
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['artists'] });
    },
  });
}
