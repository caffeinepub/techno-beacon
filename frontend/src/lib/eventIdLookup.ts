/**
 * Maps (artistId + "_" + dateTime_nanoseconds) → backend event ID.
 * This is needed because the backend Event type does not include the event's
 * own key, so we derive it from the unique (artistId, dateTime) pair.
 */
const EVENT_ID_LOOKUP: Record<string, string> = {
  // Richie Hawtin — only the confirmed Detroit Love Day 1 event
  "richie_hawtin_1765117121000000000": "richie_detroit_love_day1",

  // Dave Clarke
  "dave_clarke_1767952000000000000": "dave_live_techno_vancouver",
  "dave_clarke_1767958400000000000": "dave_toronto_runnymeade",
  "dave_clarke_1768723200000000000": "dave_nancy_wonder_rave",
  "dave_clarke_1768809600000000000": "dave_paris_off_the_grid",
  "dave_clarke_1770995200000000000": "dave_london_fabric_night",
  // Brighton: corrected to 2026-05-15T22:00:00Z → 1_773_528_000_000_000_000
  "dave_clarke_1773528000000000000": "dave_brighton_city_wall",
  "dave_clarke_1779069600000000000": "dave_ostend_beach_festival",
  // Cardiff: corrected to 2026-07-24T22:00:00Z → 1_773_715_200_000_000_000
  "dave_clarke_1773715200000000000": "dave_luvmuzik_cardiff",
  "dave_clarke_1820905600000000000": "dave_iceland_eclipse",

  // Jeff Mills — corrected Feb/Mar 2026 dates
  // Chicago smartbar: Thu 26 Feb 2026
  "jeff_mills_1775484800000000000": "jeff_mills_1",
  // Lincoln Factory Detroit: Fri 27 Feb 2026
  "jeff_mills_1775998400000000000": "jeff_mills_2",
  // BERHTA DC Day 2: Sat 28 Feb 2026
  "jeff_mills_1776012800000000000": "jeff_mills_4",
  // 1015 Folsom SF: Fri 6 Mar 2026
  "jeff_mills_1776086400000000000": "jeff_mills_5",
  // Palace of Fine Arts SF: Sat 7 Mar 2026
  "jeff_mills_1776172800000000000": "jeff_mills_6",
  // TBA Los Angeles: Sun 8 Mar 2026
  "jeff_mills_1776259200000000000": "jeff_mills_7",
  // TBA Toronto: Fri 13 Mar 2026
  "jeff_mills_1776793600000000000": "jeff_mills_8",
  // Knockdown Center NYC: Sat 14 Mar 2026
  "jeff_mills_1776880000000000000": "jeff_mills_9",
  // SAT Montreal: Sun 15 Mar 2026
  "jeff_mills_1776966400000000000": "jeff_mills_10",
  // 1Fox Precinct Johannesburg: Fri 27 Mar 2026
  "jeff_mills_1777587200000000000": "jeff_mills_11",
  // Apollo Warehouse Cape Town: Sat 28 Mar 2026
  "jeff_mills_1777673600000000000": "jeff_mills_12",
  // KALT Strasbourg: Thu 2 Apr 2026
  "jeff_mills_1777966400000000000": "jeff_mills_13",
  // 909 Festival Amsterdam: Sat 6 Jun 2026
  "jeff_mills_1786134400000000000": "jeff_mills_14",
  // Junction 2 x fabric London: Sat 25 Jul 2026
  "jeff_mills_1792774400000000000": "jeff_mills_15",
  // Dekmantel Festival Amsterdam: Wed 29 Jul 2026
  "jeff_mills_1792951000000000000": "jeff_mills_16",

  // Joey Beltram
  "joey-beltram_1773600000000000000": "joey-beltram_berlin_techno_night",
  "joey-beltram_1780000000000000000": "joey-beltram_amsterdam_fabrique",
  "joey-beltram_1776250000000000000": "joey-beltram_london_minimalism",

  // Derrick May
  "derrick-may_1765805122000000000": "derrick-may_detroit_fest_days",
  "derrick-may_1790100000000000000": "derrick-may_berlin_dj_crate",
  "derrick-may_1800600000000000000": "derrick-may_frankfurt_bicentenary",

  // Juan Atkins — Rostock Kulturzentrum entry removed (event does not exist)
  "juan-atkins_1795100000000000000": "juan-atkins_berlin_minimal_dj",
  "juan-atkins_1806000000000000000": "juan-atkins_tokyo_freedom_fest",

  // Kevin Saunderson — Berlin Reunification at Tresor removed (unconfirmed)
  "kevin-saunderson_1790500000000000000": "kevin-saunderson_chicago_weekend_lockdown",
  "kevin-saunderson_1801000000000000000": "kevin-saunderson_stockholm_saturday_stage",

  // Robert Hood
  "robert-hood_1785902800000000000": "robert-hood_rs-dreaming-festival-2026",
  "robert-hood_1779084800000000000": "robert-hood_terminal-v-festival-2026",
  "robert-hood_1785151200000000000": "robert-hood_the-crave-festival-2026",
};

/**
 * Returns the backend event ID for a given event, or null if not found.
 * Uses artistId + dateTime (nanoseconds) as a unique fingerprint.
 */
export function getBackendEventId(artistId: string, dateTime: bigint): string | null {
  const key = `${artistId}_${dateTime.toString()}`;
  return EVENT_ID_LOOKUP[key] ?? null;
}
