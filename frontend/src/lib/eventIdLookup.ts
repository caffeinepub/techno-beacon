import { Event } from '../backend';

/**
 * Maps composite key (artistId + "_" + dateTime nanoseconds) to backend event IDs.
 * This lookup table covers all seeded events.
 */
const EVENT_ID_MAP: Record<string, string> = {
  // Richie Hawtin
  'richie_hawtin_1765117121000000000': 'richie_detroit_love_day1',

  // Dave Clarke
  'dave_clarke_1767952000000000000': 'dave_live_techno_vancouver',
  'dave_clarke_1767958400000000000': 'dave_toronto_runnymeade',
  'dave_clarke_1768723200000000000': 'dave_nancy_wonder_rave',
  'dave_clarke_1768809600000000000': 'dave_paris_off_the_grid',
  'dave_clarke_1770995200000000000': 'dave_london_fabric_night',
  'dave_clarke_1773528000000000000': 'dave_brighton_city_wall',
  'dave_clarke_1779069600000000000': 'dave_ostend_beach_festival',
  'dave_clarke_1773715200000000000': 'dave_luvmuzik_cardiff',
  'dave_clarke_1820905600000000000': 'dave_iceland_eclipse',

  // Robert Hood
  'robert-hood_1785902800000000000': 'robert-hood_rs-dreaming-festival-2026',
  'robert-hood_1779084800000000000': 'robert-hood_terminal-v-festival-2026',
  'robert-hood_1785151200000000000': 'robert-hood_the-crave-festival-2026',

  // Jeff Mills
  'jeff_mills_1775484800000000000': 'jeff_mills_1',
  'jeff_mills_1775998400000000000': 'jeff_mills_2',
  'jeff_mills_1776012800000000000': 'jeff_mills_4',
  'jeff_mills_1776086400000000000': 'jeff_mills_5',
  'jeff_mills_1776172800000000000': 'jeff_mills_6',
  'jeff_mills_1776259200000000000': 'jeff_mills_7',
  'jeff_mills_1776793600000000000': 'jeff_mills_8',
  'jeff_mills_1776880000000000000': 'jeff_mills_9',
  'jeff_mills_1776966400000000000': 'jeff_mills_10',
  'jeff_mills_1777587200000000000': 'jeff_mills_11',
  'jeff_mills_1777673600000000000': 'jeff_mills_12',
  'jeff_mills_1777966400000000000': 'jeff_mills_13',
  'jeff_mills_1786134400000000000': 'jeff_mills_14',
  'jeff_mills_1792774400000000000': 'jeff_mills_15',
  'jeff_mills_1792951000000000000': 'jeff_mills_16',

  // Joey Beltram
  'joey-beltram_1768723200000000000': 'joey-beltram_phantasma',
  'joey-beltram_1768809600000000000': 'joey-beltram_resist26',

  // Derrick May
  'derrick-may_1769929600000000000': 'derrick-may_okeechobee_festival',
  'derrick-may_1772767200000000000': 'derrick-may_medetroit_2026',

  // Juan Atkins
  'juan-atkins_1768626400000000000': 'juan-atkins_blå_oslo',
  'juan-atkins_1768712800000000000': 'juan-atkins_traum_nacht',
  'juan-atkins_1773285600000000000': 'juan-atkins_detroit_love',
  'juan-atkins_1773673600000000000': 'juan-atkins_nuits_sonores',
  'juan-atkins_1792759600000000000': 'juan-atkins_dekmantel_festival',

  // Kevin Saunderson
  'kevin-saunderson_1768712800000000000': 'kevin-saunderson_baile_world',
  'kevin-saunderson_1770164800000000000': 'kevin-saunderson_club_vinyl',
  'kevin-saunderson_1786048800000000000': 'kevin-saunderson_distortion',
  'kevin-saunderson_1786134400000000000': 'kevin-saunderson_909_festival',
  'kevin-saunderson_1785902800000000000': 'kevin-saunderson_dreaming_festival',
  'kevin-saunderson_1796595200000000000': 'kevin-saunderson_defected_malta',
};

export function getEventId(event: Event): string | null {
  const key = `${event.artistId}_${event.dateTime}`;
  return EVENT_ID_MAP[key] ?? null;
}
