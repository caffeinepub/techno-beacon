# Specification

## Summary
**Goal:** Add Robert Hood as a new seeded artist with 3 real RA events in the backend, update travel link city lookups, and ensure the frontend dynamically displays him alongside existing artists.

**Planned changes:**
- Add Robert Hood artist record (ID: `robert-hood`, genre: `Detroit Techno / Minimal`) to `initializeSeedData` in `backend/main.mo`
- Add 3 events for Robert Hood: "Dreaming Festival 2026" (Parque Norte, Medellin, 2026-06-27), "Terminal V Festival 2026" (Royal Highland Centre, Edinburgh, 2026-04-18), "The Crave Festival 2026" (Zuiderpark, The Hague, 2026-06-06), all with sourceLabel `RA`
- Retain all existing artist and event seed data unchanged; `postupgrade` continues to call `initializeSeedData` unconditionally
- Add Medellin (MDE), Edinburgh (EDI), and The Hague (AMS) to the IATA lookup table in `frontend/src/utils/travelLinks.ts`
- Frontend Artists page and Discover page artist strip dynamically render Robert Hood's card (name, 3 events) via the existing `useArtists` hook with no hardcoded filtering

**User-visible outcome:** Robert Hood appears on the Artists page and Discover page with 3 upcoming events. Clicking his card opens the ArtistEventPopup showing all 3 events in chronological order with working travel and ticket links.
