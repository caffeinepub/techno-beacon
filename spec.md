# Specification

## Summary
**Goal:** Add an "Add to Radar" feature so authenticated users can save specific events to their My Radar page from the Discover page and ArtistEventPopup.

**Planned changes:**
- Add a stable per-user saved-events map to the backend (`HashMap<Principal, [Text]>`), with `addEventToRadar`, `removeEventFromRadar`, and `getRadarEvents` functions (authenticated only)
- Add `useRadarEvents`, `useAddEventToRadar`, and `useRemoveEventFromRadar` React Query hooks in `useQueries.ts`
- Add a compact "📡 Add to Radar" / "📡 On Radar" toggle button to each event card in `EventCard.tsx`, with neon amber styling matching the existing theme, success/removal toasts, and a login prompt for unauthenticated users
- Add the same toggle button to each event row in `ArtistEventPopup.tsx` with identical behavior
- Update `MyRadarPage.tsx` to show a "Saved Events" section populated from `useRadarEvents`, sorted chronologically, with event title, artist, venue, city, date/time, and ticket links (Dice/Songkick); show an empty-state prompt when no events are saved

**User-visible outcome:** Authenticated users can tap "📡 Add to Radar" on any event card or artist popup to save it, then view all saved events in a dedicated "Saved Events" section on the My Radar page.
