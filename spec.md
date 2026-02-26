# Specification

## Summary
**Goal:** Restore the AdminInitButton and seed data initialization functionality so that admin users can initialize seed data from the ArtistsPage.

**Planned changes:**
- Fix the `AdminInitButton` component to correctly detect admin status and render the "Initialize Data" button for confirmed admin users
- Ensure the `useActor` hook (or a safe wrapper/alternative) resolves to a valid actor reference promptly after authentication, preventing the component from being stuck in a loading state indefinitely
- Fix the backend `initializeSeedData` (or equivalent) function so it is callable by the admin principal, correctly enforces access control, and persists seed artists and events to state

**User-visible outcome:** Admin users see and can click the "Initialize Data" button on the ArtistsPage, which successfully seeds artists and events data. Non-admin users do not see the button.
