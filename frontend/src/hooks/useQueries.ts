import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { Event, Artist } from '../backend';

export function useGetAllEvents() {
  const { actor, isFetching } = useActor();

  return useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEvents();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    retry: (failureCount) => {
      if (failureCount >= 3) return false;
      return true;
    },
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
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
    staleTime: 0,
    retry: (failureCount) => {
      if (failureCount >= 3) return false;
      return true;
    },
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
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

export function useGetArtistEvents(artistId: string) {
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

export function useGetRadarEvents() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return useQuery<Event[]>({
    queryKey: ['radarEvents'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRadarEvents();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useGetTrackedArtists() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return useQuery<string[]>({
    queryKey: ['trackedArtists'],
    queryFn: async () => {
      if (!actor) return [];
      if (!identity) return [];
      const principal = identity.getPrincipal();
      return actor.getTrackedArtists(principal);
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useToggleTrackedArtist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (artistId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleTrackedArtist(artistId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackedArtists'] });
    },
  });
}

export function useAddEventToRadar() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.addEventToRadar(eventId);
      if (result.__kind__ === 'eventNotFound') {
        throw new Error(result.eventNotFound);
      }
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
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'artist'] });
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const query = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
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
    mutationFn: async (profile: { name: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useIsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const query = useQuery<boolean>({
    queryKey: ['isAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      try {
        const result = await actor.isAdmin();
        return result;
      } catch {
        return false;
      }
    },
    // Only run when we have a fully authenticated actor (not anonymous)
    enabled: !!actor && !actorFetching && isAuthenticated && !isInitializing,
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
  });

  // isFetched is only true once the actor is ready AND the query has completed
  const isFetched = !!actor && !actorFetching && !isInitializing && query.isFetched;

  return {
    ...query,
    data: query.isError ? false : query.data,
    isLoading: isInitializing || actorFetching || (!isFetched && !query.isError && isAuthenticated),
    isFetched,
  };
}
