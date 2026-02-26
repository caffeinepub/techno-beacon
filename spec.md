# Specification

## Summary
**Goal:** Remove the Kulturzentrum Rostock event (Thu 5 Mar 2026) from all artist seed data and the frontend event ID lookup table.

**Planned changes:**
- In `backend/main.mo`, audit the `initializeSeedData` function and remove every event record with venue 'Kulturzentrum', city 'Rostock', country 'Germany', or dateTime matching '2026-03-05T...' across all artist arrays (Richie Hawtin, Juan Atkins, Joey Beltram, and any other artist)
- Ensure Richie Hawtin retains exactly one seeded event ('Detroit Love Day 1: Richie Hawtin - Carl Craig - Dennis Ferrer', Detroit, USA, '2026-02-27T22:00:00Z')
- Ensure the `postupgrade` hook continues to call `initializeSeedData` unconditionally
- In `frontend/src/lib/eventIdLookup.ts`, remove all entries whose composite key corresponds to the Rostock event (by dateTime nanoseconds for 2026-03-05, or by venue/city strings 'Rostock' or 'Kulturzentrum') across all artists

**User-visible outcome:** The Kulturzentrum Rostock event no longer appears for any artist in the app, and all other events and radar functionality remain unaffected.
