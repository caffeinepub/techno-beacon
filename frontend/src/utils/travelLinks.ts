import type { Time } from '../backend';

/**
 * Mapping of normalised city names to Skyscanner-recognised IATA airport codes or city codes.
 * Keys are lowercase, spaces/punctuation stripped for fuzzy matching.
 */
const CITY_TO_IATA: Record<string, string> = {
  // Canada
  vancouver: 'YVR',
  toronto: 'YYZ',
  montreal: 'YUL',

  // USA
  detroit: 'DTW',
  chicago: 'ORD',
  newyork: 'JFK',
  newyorkcity: 'JFK',
  nyc: 'JFK',
  washingtondc: 'DCA',
  washington: 'DCA',
  dc: 'DCA',
  sanfrancisco: 'SFO',
  sf: 'SFO',
  losangeles: 'LAX',
  la: 'LAX',
  denver: 'DEN',
  atlanta: 'ATL',
  miami: 'MIA',

  // UK
  london: 'LON',
  brighton: 'LGW',
  cardiff: 'CWL',
  manchester: 'MAN',
  edinburgh: 'EDI',
  birmingham: 'BHX',
  glasgow: 'GLA',

  // Iceland
  hellissandur: 'KEF',
  reykjavik: 'KEF',
  iceland: 'KEF',
  akureyri: 'AEY',

  // France
  paris: 'CDG',
  nancy: 'ETZ',
  strasbourg: 'SXB',
  lyon: 'LYS',
  marseille: 'MRS',
  nice: 'NCE',
  bordeaux: 'BOD',
  toulouse: 'TLS',
  nantes: 'NTE',

  // Germany
  berlin: 'BER',
  munich: 'MUC',
  hamburg: 'HAM',
  frankfurt: 'FRA',
  cologne: 'CGN',
  dusseldorf: 'DUS',
  stuttgart: 'STR',

  // Netherlands
  amsterdam: 'AMS',
  rotterdam: 'RTM',
  thehague: 'AMS',  // The Hague uses Amsterdam (AMS) as nearest major airport
  denhag: 'AMS',    // Dutch name variant
  denhaag: 'AMS',   // Dutch name variant

  // Belgium
  brussels: 'BRU',
  ostend: 'OST',
  antwerp: 'ANR',
  ghent: 'BRU',

  // Spain
  barcelona: 'BCN',
  madrid: 'MAD',
  ibiza: 'IBZ',
  seville: 'SVQ',
  valencia: 'VLC',
  malaga: 'AGP',

  // Italy
  rome: 'FCO',
  milan: 'MXP',
  florence: 'FLR',
  venice: 'VCE',
  naples: 'NAP',

  // Japan
  tokyo: 'NRT',
  osaka: 'KIX',
  kyoto: 'ITM',

  // South Africa
  johannesburg: 'JNB',
  capetown: 'CPT',
  durban: 'DUR',

  // Australia
  sydney: 'SYD',
  melbourne: 'MEL',
  brisbane: 'BNE',
  perth: 'PER',

  // Colombia
  bogota: 'BOG',
  medellin: 'MDE',    // José María Córdova International Airport
  medelln: 'MDE',     // Accent-stripped variant
  cali: 'CLO',

  // Other
  dubai: 'DXB',
  singapore: 'SIN',
  hongkong: 'HKG',
  bangkok: 'BKK',
  istanbul: 'IST',
  athens: 'ATH',
  lisbon: 'LIS',
  porto: 'OPO',
  vienna: 'VIE',
  zurich: 'ZRH',
  geneva: 'GVA',
  prague: 'PRG',
  warsaw: 'WAW',
  budapest: 'BUD',
  stockholm: 'ARN',
  oslo: 'OSL',
  copenhagen: 'CPH',
  helsinki: 'HEL',
  dublin: 'DUB',
  cairo: 'CAI',
  nairobi: 'NBO',
  lagos: 'LOS',
  mumbai: 'BOM',
  delhi: 'DEL',
  bangalore: 'BLR',
  seoul: 'ICN',
  beijing: 'PEK',
  shanghai: 'PVG',
  mexicocity: 'MEX',
  lima: 'LIM',
  santiago: 'SCL',
  buenosaires: 'EZE',
  saopaulo: 'GRU',
  riodejaneiro: 'GIG',
};

/**
 * Normalise a city name for lookup: lowercase, remove spaces, hyphens, punctuation.
 */
function normaliseCity(city: string): string {
  return city
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Resolve a city name to a Skyscanner-compatible IATA airport code.
 * Falls back to a simple lowercase slug if no mapping is found.
 * The fallback uses only the first word to avoid multi-word place names breaking Skyscanner.
 */
export function cityToIata(city: string): string {
  const key = normaliseCity(city);
  if (CITY_TO_IATA[key]) {
    return CITY_TO_IATA[key];
  }

  // Try matching just the first two words joined, then first word alone
  const words = city.toLowerCase().trim().split(/\s+/);
  if (words.length > 1) {
    const twoWordKey = words.slice(0, 2).join('').replace(/[^a-z0-9]/g, '');
    if (CITY_TO_IATA[twoWordKey]) {
      return CITY_TO_IATA[twoWordKey];
    }
    const oneWordKey = words[0].replace(/[^a-z0-9]/g, '');
    if (CITY_TO_IATA[oneWordKey]) {
      return CITY_TO_IATA[oneWordKey];
    }
  }

  // Last resort: use the first word only as a slug (avoids multi-word failures)
  return words[0].replace(/[^a-z0-9]/g, '');
}

/**
 * Convert a city name to a URL-friendly slug (used for Booking.com, not Skyscanner).
 * e.g. "New York City" → "new-york-city"
 */
export function cityToSlug(city: string): string {
  return city
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

/**
 * Convert Time (bigint nanoseconds) to a JS Date.
 */
export function timeToDate(time: Time): Date {
  return new Date(Number(time) / 1_000_000);
}

/**
 * Format a Date to YYMMDD for Skyscanner URLs.
 * e.g. 2026-03-28 → "260328"
 */
export function formatSkyscannerDate(date: Date): string {
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

/**
 * Format a Date to YYYY-MM-DD for Booking.com URLs.
 */
export function formatBookingDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Generate a Skyscanner deep-link URL using IATA airport codes.
 * Pattern: https://www.skyscanner.net/transport/flights/{origin}/{destination}/{outbound}/{return}/
 * Both origin and destination city names are resolved to IATA codes via cityToIata().
 */
export function generateSkyscannerUrl(
  originCity: string,
  destinationCity: string,
  outboundDate: Date,
  returnDate: Date
): string {
  const origin = cityToIata(originCity);
  const destination = cityToIata(destinationCity);
  const outbound = formatSkyscannerDate(outboundDate);
  const ret = formatSkyscannerDate(returnDate);
  return `https://www.skyscanner.net/transport/flights/${origin}/${destination}/${outbound}/${ret}/`;
}

/**
 * Generate a Booking.com deep-link URL.
 * Pattern: https://www.booking.com/searchresults.html?ss={city}&checkin={YYYY-MM-DD}&checkout={YYYY-MM-DD}
 */
export function generateBookingUrl(
  city: string,
  checkinDate: Date,
  checkoutDate: Date
): string {
  const params = new URLSearchParams({
    ss: city,
    checkin: formatBookingDate(checkinDate),
    checkout: formatBookingDate(checkoutDate),
  });
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

/**
 * Calculate outbound date: event date minus 1 day.
 */
export function getOutboundDate(eventDateTime: Time): Date {
  const eventDate = timeToDate(eventDateTime);
  const outbound = new Date(eventDate);
  outbound.setDate(outbound.getDate() - 1);
  return outbound;
}

/**
 * Calculate return date: event date plus 1 day.
 */
export function getReturnDate(eventDateTime: Time): Date {
  const eventDate = timeToDate(eventDateTime);
  const ret = new Date(eventDate);
  ret.setDate(ret.getDate() + 1);
  return ret;
}
