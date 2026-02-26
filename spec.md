# Specification

## Summary
**Goal:** Replace all existing Dave Clarke seed data in the backend with 9 fully corrected, verified event records, and synchronize the frontend event ID lookup table to match.

**Planned changes:**
- In `backend/main.mo`, replace all Dave Clarke event records in `initializeSeedData` with exactly 9 verified events (Vancouver, Toronto, Nancy, Paris, London, Brighton, Ostend, Cardiff, Iceland) using the correct venues, dateTimes, titles, sourceLabel 'RA', and eventUrl 'https://ra.co'
- Ensure `postupgrade` continues to call `initializeSeedData` unconditionally so data is present on every deploy
- In `frontend/src/lib/eventIdLookup.ts`, update all Dave Clarke entries to match the corrected venue strings and dateTimes, removing any stale composite keys that no longer correspond to live backend event IDs
- Leave all other artists' event datasets (Jeff Mills, Richie Hawtin, Joey Beltram, Derrick May, Juan Atkins, Kevin Saunderson, Robert Hood) unchanged

**User-visible outcome:** All 9 Dave Clarke events display with correct titles, venues, and dates; the Add to Radar button works correctly for each Dave Clarke event; no stale or incorrect Dave Clarke events appear anywhere in the app.
