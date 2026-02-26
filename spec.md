# Specification

## Summary
**Goal:** Update Dave Clarke's 9 event records in the backend seed data and the frontend event ID lookup table to match verified Resident Advisor listings.

**Planned changes:**
- In `backend/main.mo`, replace all 9 Dave Clarke event entries in `initializeSeedData` with corrected eventTitles, venue strings, cities, countries, and ISO dateTimes as specified (Vancouver, Toronto, Nancy, Paris, London, Brighton, Ostend, Cardiff, Iceland)
- All 9 events retain `sourceLabel: 'RA'` and `eventUrl: 'https://ra.co'` and remain associated with Dave Clarke's artist ID
- All other artists' event data (Jeff Mills, Richie Hawtin, Joey Beltram, Derrick May, Juan Atkins, Kevin Saunderson, Robert Hood) remain unchanged
- `postupgrade` continues to call `initializeSeedData` unconditionally
- In `frontend/src/lib/eventIdLookup.ts`, update composite keys for the 4 changed Dave Clarke events (Vancouver, Toronto, Brighton, Cardiff) to reflect corrected venues and dateTimes, and remove any stale entries that no longer match a live backend event

**User-visible outcome:** Dave Clarke event cards on the frontend display the correct venue names and dates, and the "Add to Radar" button correctly resolves to valid backend event IDs for all 9 Dave Clarke events.
