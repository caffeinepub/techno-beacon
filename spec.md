# Specification

## Summary
**Goal:** Restore Dice.fm and Songkick ticket search buttons on all event cards and remove any ra.co/ra.ca links throughout the app.

**Planned changes:**
- In `EventCard.tsx`, add two side-by-side ticket buttons ("🎟 Dice" and "🎟 Songkick") using `buildTicketSearchUrl`, styled with neon amber accent; remove any ra.co/ra.ca links.
- In `ArtistEventPopup.tsx`, add the same two ticket buttons to each event row; remove any ra.co/ra.ca links.
- In `MyRadarPage.tsx`, add the same two ticket buttons to each saved event row; remove any ra.co/ra.ca links.
- All ticket buttons open in a new tab and are visually consistent with the existing "✈ Plan Trip" and "📡 Add to Radar" buttons.

**User-visible outcome:** Every event card, popup event row, and saved radar event shows "🎟 Dice" and "🎟 Songkick" ticket search buttons with no ra.co/ra.ca links appearing anywhere.
