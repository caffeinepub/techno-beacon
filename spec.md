# Specification

## Summary
**Goal:** Fix the AdminInitButton component so that admin users can see and use the "Initialize Data" button, and resolve the infinite spinner issue caused by incorrect actor readiness detection.

**Planned changes:**
- Fix AdminInitButton to correctly detect admin status and render the "Initialize Data" button for confirmed admin users on DiscoverPage and ArtistsPage
- Fix the loading/spinner state in AdminInitButton so it clears once actor is initialized and admin status is resolved
- Audit and fix the `useActor` hook readiness signaling so AdminInitButton re-renders correctly when the actor transitions from uninitialized to ready (using wrappers only, not modifying the hook directly)
- Audit and fix the backend `isAdmin` function to ensure it correctly identifies the calling principal and returns the correct value

**User-visible outcome:** Admin users will see the "Initialize Data" button on DiscoverPage and ArtistsPage without being stuck in a spinner, while non-admin users will not see the button.
