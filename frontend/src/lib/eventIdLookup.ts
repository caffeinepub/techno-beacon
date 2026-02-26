/**
 * Maps (artistId + "_" + dateTime_nanoseconds) → backend event ID.
 * This is needed because the backend Event type does not include the event's
 * own key, so we derive it from the unique (artistId, dateTime) pair.
 */
const EVENT_ID_LOOKUP: Record<string, string> = {
  // Richie Hawtin
  "richie_hawtin_1765117121000000000": "richie_detroit_love_day1",
  "richie_hawtin_1789000000000000000": "richie_berlin_berghain",
  "richie_hawtin_1795800000000000000": "richie_ny_output",
  "richie_hawtin_1784200000000000000": "richie_barcelona_sonar",
  "richie_hawtin_1792600000000000000": "richie_london_fabric",
  "richie_hawtin_1802000000000000000": "richie_tokyo_womb",
  // Dave Clarke
  "dave_clarke_1767952000000000000": "dave_live_techno_vancouver",
  "dave_clarke_1767958400000000000": "dave_toronto_runnymeade",
  "dave_clarke_1768723200000000000": "dave_nancy_wonder_rave",
  "dave_clarke_1768809600000000000": "dave_paris_off_the_grid",
  "dave_clarke_1770995200000000000": "dave_london_fabric_night",
  "dave_clarke_1773528000000000000": "dave_brighton_city_wall",
  "dave_clarke_1779069600000000000": "dave_ostend_beach_festival",
  "dave_clarke_1773715200000000000": "dave_luvmuzik_cardiff",
  "dave_clarke_1820905600000000000": "dave_iceland_eclipse",
  // Jeff Mills
  "jeff_mills_1775484800000000000": "jeff_mills_1",
  "jeff_mills_1775998400000000000": "jeff_mills_2",
  // Note: jeff_mills_3 and jeff_mills_4 share the same dateTime as jeff_mills_2 and jeff_mills_4
  "jeff_mills_1776012800000000000": "jeff_mills_4",
  "jeff_mills_1776086400000000000": "jeff_mills_5",
  "jeff_mills_1776172800000000000": "jeff_mills_6",
  "jeff_mills_1776259200000000000": "jeff_mills_7",
  "jeff_mills_1776793600000000000": "jeff_mills_8",
  "jeff_mills_1776880000000000000": "jeff_mills_9",
  "jeff_mills_1776966400000000000": "jeff_mills_10",
  "jeff_mills_1777587200000000000": "jeff_mills_11",
  "jeff_mills_1777673600000000000": "jeff_mills_12",
  "jeff_mills_1777966400000000000": "jeff_mills_13",
  "jeff_mills_1786134400000000000": "jeff_mills_14",
  "jeff_mills_1792774400000000000": "jeff_mills_15",
  "jeff_mills_1792951000000000000": "jeff_mills_16",
};

/**
 * Returns the backend event ID for a given event, or null if not found.
 * Uses artistId + dateTime (nanoseconds) as a unique fingerprint.
 */
export function getBackendEventId(artistId: string, dateTime: bigint): string | null {
  const key = `${artistId}_${dateTime.toString()}`;
  return EVENT_ID_LOOKUP[key] ?? null;
}
