import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Artist {
    id: string;
    name: string;
    imageUrl: string;
    genre: string;
}
export type Time = bigint;
export interface UserProfile {
    name: string;
}
export interface Event {
    country: string;
    venue: string;
    city: string;
    artistId: string;
    eventTitle: string;
    sourceLabel: string;
    eventUrl: string;
    dateTime: Time;
}
export enum Result {
    alreadyExists = "alreadyExists",
    eventNotFound = "eventNotFound",
    notFound = "notFound",
    success = "success",
    unauthorized = "unauthorized"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addEventToRadar(eventId: string): Promise<Result>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllEvents(): Promise<Array<Event>>;
    getArtist(artistId: string): Promise<Artist | null>;
    getArtists(): Promise<Array<Artist>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEventsByArtist(artistId: string): Promise<Array<Event>>;
    getMyRadarSummary(user: Principal): Promise<[bigint, bigint]>;
    getRadarEvents(): Promise<Array<Event>>;
    getTrackedArtistEvents(user: Principal): Promise<Array<Event>>;
    getTrackedArtists(user: Principal): Promise<Array<string>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeSeedData(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    removeEventFromRadar(eventId: string): Promise<Result>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleTrackedArtist(artistId: string): Promise<boolean>;
}
