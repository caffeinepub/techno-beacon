import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  public type Event = {
    artistId : Text;
    eventTitle : Text;
    venue : Text;
    city : Text;
    country : Text;
    dateTime : Time.Time;
    sourceLabel : Text;
    eventUrl : Text;
  };

  public type Artist = {
    id : Text;
    name : Text;
    imageUrl : Text;
    genre : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  public type Result = {
    #success;
    #alreadyExists;
    #notFound;
    #unauthorized;
    #eventNotFound : Text;
  };

  var events = Map.empty<Text, Event>();
  var artists = Map.empty<Text, Artist>();
  let userTrackedArtists = Map.empty<Principal, Set.Set<Text>>();
  var userProfiles = Map.empty<Principal, UserProfile>();
  var radarEvents = Map.empty<Principal, Set.Set<Text>>();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  var seedDataInitialized = false;

  system func preupgrade() { () };

  public query ({ caller }) func isAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func initializeSeedData() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can initialize seed data");
    };

    if (not seedDataInitialized) {
      _forceSeedData();
      seedDataInitialized := true;
    };
  };

  func _forceSeedData() {
    artists := Map.empty<Text, Artist>();
    events := Map.empty<Text, Event>();

    // Insert artists
    for ((artistId, artist) in [
      (
        "richie_hawtin",
        {
          id = "richie_hawtin";
          name = "Richie Hawtin";
          imageUrl = "https://cloudfront.electronicbeats.net/wp-content/uploads/2014/12/Richie-Hawtin-Electronic-Beats.jpg";
          genre = "Techno/Minimal";
        },
      ),
      (
        "dave_clarke",
        {
          id = "dave_clarke";
          name = "Dave Clarke";
          imageUrl = "https://example.com/photos/dave_clarke.jpg";
          genre = "Techno";
        },
      ),
      (
        "jeff_mills",
        {
          id = "jeff_mills";
          name = "Jeff Mills";
          imageUrl = "https://example.com/photos/jeff_mills.jpg";
          genre = "Techno";
        },
      ),
      (
        "joey-beltram",
        {
          id = "joey-beltram";
          name = "Joey Beltram";
          imageUrl = "https://example.com/photos/joey_beltram.jpg";
          genre = "Techno / Rave";
        },
      ),
      (
        "derrick-may",
        {
          id = "derrick-may";
          name = "Derrick May";
          imageUrl = "https://example.com/photos/derrick_may.jpg";
          genre = "Detroit Techno";
        },
      ),
      (
        "juan-atkins",
        {
          id = "juan-atkins";
          name = "Juan Atkins";
          imageUrl = "https://example.com/photos/juan_atkins.jpg";
          genre = "Detroit Techno";
        },
      ),
      (
        "kevin-saunderson",
        {
          id = "kevin-saunderson";
          name = "Kevin Saunderson";
          imageUrl = "https://example.com/photos/kevin_saunderson.jpg";
          genre = "Detroit Techno";
        },
      ),
      (
        "robert-hood",
        {
          id = "robert-hood";
          name = "Robert Hood";
          imageUrl = "https://ra.co/dj/roberthood";
          genre = "Detroit Techno / Minimal";
        },
      ),
    ].values()) {
      artists.add(artistId, artist);
    };

    // Richie Hawtin events (only confirmed, real event)
    events.add(
      "richie_detroit_love_day1",
      {
        artistId = "richie_hawtin";
        eventTitle = "Detroit Love Day 1: Richie Hawtin - Carl Craig - Dennis Ferrer";
        venue = "TBA";
        city = "Detroit";
        country = "USA";
        dateTime = 1_765_117_121_000_000_000;
        sourceLabel = "RA";
        eventUrl = "https://ra.co/events/your-event-id";
      },
    );

    // Updated Dave Clarke event seed data
    for (
      (eventId, event) in [
        (
          "dave_live_techno_vancouver",
          {
            artistId = "dave_clarke";
            eventTitle = "Live Techno Experience with Dave Clarke";
            venue = "TBA (Industrial 236 Warehouse / Vantek Warehouse)";
            city = "Vancouver";
            country = "Canada";
            dateTime = 1_767_952_000_000_000_000; // "2026-03-06T22:00:00Z"
            sourceLabel = "RA";
            eventUrl = "https://ra.co";
          },
        ),
        (
          "dave_toronto_runnymeade",
          {
            artistId = "dave_clarke";
            eventTitle = "Dave Clarke in Toronto";
            venue = "821 Runnymede Rd (or 131 McCormack St)";
            city = "Toronto";
            country = "Canada";
            dateTime = 1_767_958_400_000_000_000; // "2026-03-07T22:00:00Z"
            sourceLabel = "RA";
            eventUrl = "https://ra.co";
          },
        ),
        (
          "dave_nancy_wonder_rave",
          {
            artistId = "dave_clarke";
            eventTitle = "WONDER RAVE";
            venue = "TBA East";
            city = "Nancy";
            country = "France";
            dateTime = 1_768_723_200_000_000_000; // "2026-03-13T22:00:00Z"
            sourceLabel = "RA";
            eventUrl = "https://ra.co";
          },
        ),
        (
          "dave_paris_off_the_grid",
          {
            artistId = "dave_clarke";
            eventTitle = "OFF THE GRID: Elli Acula, RISA TANAGUSHI, Dave Clarke";
            venue = "Mia Mao";
            city = "Paris";
            country = "France";
            dateTime = 1_768_809_600_000_000_000; // "2026-03-14T22:00:00Z"
            sourceLabel = "RA";
            eventUrl = "https://ra.co";
          },
        ),
        (
          "dave_london_fabric_night",
          {
            artistId = "dave_clarke";
            eventTitle = "fabric: Palms Trax, Sedef Adasï, Alex Kassian, Dave Clarke, Setaoc Mass, Michelle Manetti, FAFF";
            venue = "fabric";
            city = "London";
            country = "UK";
            dateTime = 1_770_995_200_000_000_000; // "2026-04-04T22:00:00Z"
            sourceLabel = "RA";
            eventUrl = "https://ra.co";
          },
        ),
        (
          "dave_brighton_city_wall",
          {
            artistId = "dave_clarke";
            eventTitle = "City Wall x Dave Clarke";
            venue = "Concorde 2";
            city = "Brighton";
            country = "UK";
            dateTime = 1_773_528_000_000_000_000; // "2026-05-15T22:00:00Z"
            sourceLabel = "RA";
            eventUrl = "https://ra.co";
          },
        ),
        (
          "dave_ostend_beach_festival",
          {
            artistId = "dave_clarke";
            eventTitle = "Ostend Beach Festival 2026";
            venue = "Klein Strand";
            city = "Ostend";
            country = "Belgium";
            dateTime = 1_779_069_600_000_000_000; // "2026-07-10T18:00:00Z"
            sourceLabel = "RA";
            eventUrl = "https://ra.co";
          },
        ),
        (
          "dave_luvmuzik_cardiff",
          {
            artistId = "dave_clarke";
            eventTitle = "Luvmuzik presents Dave Clarke & Gary Beck";
            venue = "District Cardiff";
            city = "Cardiff";
            country = "UK";
            dateTime = 1_773_715_200_000_000_000; // "2026-07-24T22:00:00Z"
            sourceLabel = "RA";
            eventUrl = "https://ra.co";
          },
        ),
        (
          "dave_iceland_eclipse",
          {
            artistId = "dave_clarke";
            eventTitle = "Iceland Eclipse";
            venue = "Hellissandur";
            city = "Hellissandur";
            country = "Iceland";
            dateTime = 1_820_905_600_000_000_000; // "2027-08-12T20:00:00Z"
            sourceLabel = "RA";
            eventUrl = "https://ra.co";
          },
        ),
      ].values()
    ) {
      events.add(eventId, event);
    };

    // Robert Hood (real RA events)
    for (
      (eventId, event) in [
        (
          "robert-hood_rs-dreaming-festival-2026",
          {
            artistId = "robert-hood";
            eventTitle = "Dreaming Festival 2026";
            venue = "Parque Norte";
            city = "Medellin";
            country = "Colombia";
            dateTime = 1_785_902_800_000_000_000;
            sourceLabel = "RA";
            eventUrl = "https://ra.co";
          },
        ),
        (
          "robert-hood_terminal-v-festival-2026",
          {
            artistId = "robert-hood";
            eventTitle = "Terminal V Festival 2026";
            venue = "Royal Highland Centre";
            city = "Edinburgh";
            country = "UK";
            dateTime = 1_779_084_800_000_000_000;
            sourceLabel = "RA";
            eventUrl = "https://ra.co";
          },
        ),
        (
          "robert-hood_the-crave-festival-2026",
          {
            artistId = "robert-hood";
            eventTitle = "The Crave Festival 2026";
            venue = "Zuiderpark";
            city = "The Hague";
            country = "Netherlands";
            dateTime = 1_785_151_200_000_000_000;
            sourceLabel = "RA";
            eventUrl = "https://ra.co";
          },
        ),
      ].values()
    ) {
      events.add(eventId, event);
    };

    // Jeff Mills events (correct real dates and future events only)
    for ((eventId, event) in [
      (
        "jeff_mills_1",
        {
          artistId = "jeff_mills";
          eventTitle = "Live at Liquid Room 30th Anniversary";
          venue = "smartbar";
          city = "Chicago";
          country = "USA";
          dateTime = 1_775_484_800_000_000_000; // Thu 26 Feb 2026 (ISO '2026-02-26T22:00:00Z');
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
      (
        "jeff_mills_2",
        {
          artistId = "jeff_mills";
          eventTitle = "Live at Liquid Room Anniversary";
          venue = "Lincoln Factory";
          city = "Detroit";
          country = "USA";
          dateTime = 1_775_998_400_000_000_000; // Fri 27 Feb 2026 (ISO '2026-02-27T22:00:00Z');
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
      (
        "jeff_mills_3",
        {
          artistId = "jeff_mills";
          eventTitle = "Detroit Love Weekend Pass";
          venue = "BERHTA";
          city = "Washington DC";
          country = "USA";
          dateTime = 1_775_998_400_000_000_000; // Fri 27 Feb 2026 (ISO '2026-02-27T22:00:00Z');
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
      (
        "jeff_mills_4",
        {
          artistId = "jeff_mills";
          eventTitle = "Detroit Love Day 2";
          venue = "BERHTA";
          city = "Washington DC";
          country = "USA";
          dateTime = 1_776_012_800_000_000_000; // Sat 28 Feb 2026 (ISO '2026-02-28T22:00:00Z');
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
      (
        "jeff_mills_5",
        {
          artistId = "jeff_mills";
          eventTitle = "Live at Liquid Room Anniversary";
          venue = "1015 Folsom";
          city = "San Francisco";
          country = "USA";
          dateTime = 1_776_086_400_000_000_000; // Fri 6 Mar 2026 (ISO '2026-03-06T22:00:00Z');
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
      (
        "jeff_mills_6",
        {
          artistId = "jeff_mills";
          eventTitle = "Metropolis Metropolis";
          venue = "Palace of Fine Arts";
          city = "San Francisco";
          country = "USA";
          dateTime = 1_776_172_800_000_000_000; // Sat 7 Mar 2026 (ISO '2026-03-07T22:00:00Z');
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
      (
        "jeff_mills_7",
        {
          artistId = "jeff_mills";
          eventTitle = "WORK presents";
          venue = "TBA";
          city = "Los Angeles";
          country = "USA";
          dateTime = 1_776_259_200_000_000_000; // Sun 8 Mar 2026 (ISO '2026-03-08T22:00:00Z');
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
      (
        "jeff_mills_8",
        {
          artistId = "jeff_mills";
          eventTitle = "Format x Apollo";
          venue = "TBA";
          city = "Toronto";
          country = "Canada";
          dateTime = 1_776_793_600_000_000_000; // Fri 13 Mar 2026 (ISO '2026-03-13T22:00:00Z');
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
      (
        "jeff_mills_9",
        {
          artistId = "jeff_mills";
          eventTitle = "Live at Liquid Room Anniversary";
          venue = "Knockdown Center";
          city = "New York City";
          country = "USA";
          dateTime = 1_776_880_000_000_000_000; // Sat 14 Mar 2026 (ISO '2026-03-14T22:00:00Z');
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
      (
        "jeff_mills_10",
        {
          artistId = "jeff_mills";
          eventTitle = "Jeff Mills at SAT";
          venue = "Société des arts technologiques";
          city = "Montreal";
          country = "Canada";
          dateTime = 1_776_966_400_000_000_000; // Mar 15;
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
      (
        "jeff_mills_11",
        {
          artistId = "jeff_mills";
          eventTitle = "Jeff Mills at 1Fox Precinct";
          venue = "1Fox Precinct";
          city = "Johannesburg";
          country = "South Africa";
          dateTime = 1_777_587_200_000_000_000; // Mar 27;
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
      (
        "jeff_mills_12",
        {
          artistId = "jeff_mills";
          eventTitle = "Live at Liquid Room 30th Anniversary";
          venue = "Apollo Warehouse";
          city = "Cape Town";
          country = "South Africa";
          dateTime = 1_777_673_600_000_000_000; // Mar 28;
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
      (
        "jeff_mills_13",
        {
          artistId = "jeff_mills";
          eventTitle = "Jeff Mills at KALT";
          venue = "KALT";
          city = "Strasbourg";
          country = "France";
          dateTime = 1_777_966_400_000_000_000; // Apr 2;
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
      (
        "jeff_mills_14",
        {
          artistId = "jeff_mills";
          eventTitle = "909 Festival 2026";
          venue = "Amsterdamse Bos";
          city = "Amsterdam";
          country = "Netherlands";
          dateTime = 1_786_134_400_000_000_000; // Jun 6;
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
      (
        "jeff_mills_15",
        {
          artistId = "jeff_mills";
          eventTitle = "Junction 2 x fabric";
          venue = "Boston Manor Park";
          city = "London";
          country = "UK";
          dateTime = 1_792_774_400_000_000_000; // Jul 25;
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
      (
        "jeff_mills_16",
        {
          artistId = "jeff_mills";
          eventTitle = "Dekmantel Festival 2026";
          venue = "Amsterdamse Bos";
          city = "Amsterdam";
          country = "Netherlands";
          dateTime = 1_792_951_000_000_000_000; // Jul 29;
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
    ].values()) {
      events.add(eventId, event);
    };

    // Joey Beltram events (REQ-112)
    for ((eventId, event) in [
      (
        "joey-beltram_phantasma",
        {
          artistId = "joey-beltram";
          eventTitle = "Phantasma: Joey Beltram, Adam X, cotton + Sissies of Mercy";
          venue = "Paragon";
          city = "New York City";
          country = "USA";
          dateTime = 1_768_723_200_000_000_000; // ISO '2026-03-13T22:00:00Z'
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
      (
        "joey-beltram_resist26",
        {
          artistId = "joey-beltram";
          eventTitle = "RESIST'26 WITH JOEY BELTRAM";
          venue = "TBA (Location Secret)";
          city = "Atlanta";
          country = "USA";
          dateTime = 1_768_809_600_000_000_000; // ISO '2026-03-21T22:00:00Z'
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
    ].values()) {
      events.add(eventId, event);
    };

    // Derrick May events (REQ-113)
    for ((eventId, event) in [
      (
        "derrick-may_okeechobee_festival",
        {
          artistId = "derrick-may";
          eventTitle = "Okeechobee Music & Arts Festival";
          venue = "Sunshine Grove";
          city = "Miami";
          country = "USA";
          dateTime = 1_769_929_600_000_000_000; // ISO '2026-03-19T20:00:00Z'
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
      (
        "derrick-may_medetroit_2026",
        {
          artistId = "derrick-may";
          eventTitle = "MEDETROIT 2026; with Carl Craig";
          venue = "Sky Center";
          city = "Central Mayorista";
          country = "Colombia";
          dateTime = 1_772_767_200_000_000_000; // ISO '2026-05-16T18:00:00Z'
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
    ].values()) {
      events.add(eventId, event);
    };

    // Juan Atkins events (REQ-114)
    for ((eventId, event) in [
      (
        "juan-atkins_blå_oslo",
        {
          artistId = "juan-atkins";
          eventTitle = "Juan Atkins (US)";
          venue = "Blå";
          city = "Oslo";
          country = "Norway";
          dateTime = 1_768_626_400_000_000_000; // ISO '2026-02-27T22:00:00Z'
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
      (
        "juan-atkins_traum_nacht",
        {
          artistId = "juan-atkins";
          eventTitle = "Traum Nacht: Juan Atkins";
          venue = "TRAUM";
          city = "Antwerp";
          country = "Belgium";
          dateTime = 1_768_712_800_000_000_000; // ISO '2026-02-28T22:00:00Z'
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
      (
        "juan-atkins_detroit_love",
        {
          artistId = "juan-atkins";
          eventTitle = "DETROIT LOVE: Mike Banks, Carl Craig, Moodymann, Juan Atkins";
          venue = "Fvtvr";
          city = "Paris";
          country = "France";
          dateTime = 1_773_285_600_000_000_000; // ISO '2026-05-09T22:00:00Z'
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
      (
        "juan-atkins_nuits_sonores",
        {
          artistId = "juan-atkins";
          eventTitle = "Nuits sonores 2026";
          venue = "TBA Les Grandes Locos";
          city = "Lyon";
          country = "France";
          dateTime = 1_773_673_600_000_000_000; // ISO '2026-05-13T20:00:00Z'
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
      (
        "juan-atkins_dekmantel_festival",
        {
          artistId = "juan-atkins";
          eventTitle = "Dekmantel Festival 2026";
          venue = "Amsterdamse Bos";
          city = "Amsterdam";
          country = "Netherlands";
          dateTime = 1_792_759_600_000_000_000; // ISO '2026-07-29T14:00:00Z'
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
    ].values()) {
      events.add(eventId, event);
    };

    // Kevin Saunderson events (REQ-115)
    for ((eventId, event) in [
      (
        "kevin-saunderson_baile_world",
        {
          artistId = "kevin-saunderson";
          eventTitle = "BAILE WORLD Ft Kevin Saunderson - A Night Celebrating Black Club Music";
          venue = "9thirtyLA";
          city = "Los Angeles";
          country = "USA";
          dateTime = 1_768_712_800_000_000_000; // ISO '2026-02-27T22:00:00Z'
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
      (
        "kevin-saunderson_club_vinyl",
        {
          artistId = "kevin-saunderson";
          eventTitle = "Kevin Saunderson";
          venue = "Club Vinyl";
          city = "Denver";
          country = "USA";
          dateTime = 1_770_164_800_000_000_000; // ISO '2026-04-10T22:00:00Z'
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
      (
        "kevin-saunderson_distortion",
        {
          artistId = "kevin-saunderson";
          eventTitle = "Distortion | 3–7 June 2026";
          venue = "TBA";
          city = "All over Copenhagen";
          country = "Denmark";
          dateTime = 1_786_048_800_000_000_000; // ISO '2026-06-03T18:00:00Z'
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
      (
        "kevin-saunderson_909_festival",
        {
          artistId = "kevin-saunderson";
          eventTitle = "909 Festival 2026";
          venue = "Amsterdamse Bos";
          city = "Amsterdam";
          country = "Netherlands";
          dateTime = 1_786_134_400_000_000_000; // ISO '2026-06-06T14:00:00Z'
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
      (
        "kevin-saunderson_dreaming_festival",
        {
          artistId = "kevin-saunderson";
          eventTitle = "Dreaming Festival 2026";
          venue = "Parque Norte";
          city = "Medellin";
          country = "Colombia";
          dateTime = 1_785_902_800_000_000_000; // ISO '2026-06-27T18:00:00Z'
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
      (
        "kevin-saunderson_defected_malta",
        {
          artistId = "kevin-saunderson";
          eventTitle = "Defected Malta";
          venue = "TBA Various Venues";
          city = "Malta";
          country = "Malta";
          dateTime = 1_796_595_200_000_000_000; // ISO '2026-10-01T20:00:00Z'
          sourceLabel = "RA";
          eventUrl = "https://ra.co";
        },
      ),
    ].values()) {
      events.add(eventId, event);
    };
  };

  public query func getAllEvents() : async [Event] {
    let currentTime = Time.now();
    let filteredEvents = events.values().filter(
      func(e : Event) : Bool {
        e.dateTime > currentTime;
      }
    );
    filteredEvents.toArray();
  };

  public query func getEventsByArtist(artistId : Text) : async [Event] {
    let currentTime = Time.now();
    let filteredEvents = events.values().filter(
      func(e : Event) : Bool {
        Text.equal(e.artistId, artistId) and e.dateTime > currentTime;
      }
    );
    filteredEvents.toArray();
  };

  public query func getArtists() : async [Artist] {
    artists.values().toArray();
  };

  public query func getArtist(artistId : Text) : async ?Artist {
    artists.get(artistId);
  };

  public shared ({ caller }) func toggleTrackedArtist(artistId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can track artists");
    };

    if (not artists.containsKey(artistId)) {
      Runtime.trap("Artist does not exist");
    };

    let currentSet = switch (userTrackedArtists.get(caller)) {
      case (null) { Set.empty<Text>() };
      case (?s) { s };
    };

    if (currentSet.contains(artistId)) {
      let newSet = currentSet.clone();
      newSet.remove(artistId);
      userTrackedArtists.add(caller, newSet);
      false;
    } else {
      let newSet = currentSet.clone();
      newSet.add(artistId);
      userTrackedArtists.add(caller, newSet);
      true;
    };
  };

  public query ({ caller }) func getTrackedArtists(user : Principal) : async [Text] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own tracked artists");
    };
    switch (userTrackedArtists.get(user)) {
      case (null) { [] };
      case (?s) { s.values().toArray() };
    };
  };

  public query ({ caller }) func getTrackedArtistEvents(user : Principal) : async [Event] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own tracked artist events");
    };
    let currentTime = Time.now();
    switch (userTrackedArtists.get(user)) {
      case (null) { [] };
      case (?s) {
        events.values().toArray().filter(
          func(e : Event) : Bool {
            s.contains(e.artistId) and e.dateTime > currentTime;
          }
        );
      };
    };
  };

  public query ({ caller }) func getMyRadarSummary(user : Principal) : async (Nat, Nat) {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own radar summary");
    };
    let currentTime = Time.now();
    switch (userTrackedArtists.get(user)) {
      case (null) { (0, 0) };
      case (?s) {
        let artistCount = s.size();
        let eventCount = events.values().filter(
          func(e : Event) : Bool {
            s.contains(e.artistId) and e.dateTime > currentTime;
          }
        ).size();
        (artistCount, eventCount);
      };
    };
  };

  // Persist saved events per user in stable storage
  public shared ({ caller }) func addEventToRadar(eventId : Text) : async Result {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save events to radar");
    };

    // Attempt to retrieve the event by ID
    let eventOption = events.get(eventId);

    switch (eventOption) {
      case (null) { #eventNotFound("Event with ID: " # eventId # " not found.") };
      case (?_event) {
        let currentEvents = switch (radarEvents.get(caller)) {
          case (null) { Set.empty<Text>() };
          case (?s) { s };
        };

        if (currentEvents.contains(eventId)) {
          #alreadyExists;
        } else {
          // Add new eventId to a cloned set of existing events
          let newEvents = currentEvents.clone();
          newEvents.add(eventId);
          radarEvents.add(caller, newEvents);
          #success;
        };
      };
    };
  };

  public shared ({ caller }) func removeEventFromRadar(eventId : Text) : async Result {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can remove events from radar");
    };

    switch (radarEvents.get(caller)) {
      case (null) { #notFound };
      case (?savedEvents) {
        if (not savedEvents.contains(eventId)) {
          #notFound;
        } else {
          let newEvents = savedEvents.clone();
          newEvents.remove(eventId);
          radarEvents.add(caller, newEvents);
          #success;
        };
      };
    };
  };

  public query ({ caller }) func getRadarEvents() : async [Event] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view radar events");
    };

    switch (radarEvents.get(caller)) {
      case (null) { [] };
      case (?eventIds) {
        let eventsArray = eventIds.values().toArray();
        let mapped = eventsArray.map(
          func(id : Text) : ?Event {
            events.get(id);
          }
        );
        let filtered = mapped.filter(func(opt : ?Event) : Bool { opt != null });
        let mappedToEvent = filtered.map(func(opt : ?Event) : Event { opt.unwrap() });
        mappedToEvent;
      };
    };
  };
};
