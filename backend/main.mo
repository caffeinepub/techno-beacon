import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
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
    #eventNotFound;
  };

  var events = Map.empty<Text, Event>();
  var artists = Map.empty<Text, Artist>();

  let userTrackedArtists = Map.empty<Principal, Set.Set<Text>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var userRadarEvents = Map.empty<Principal, Set.Set<Text>>();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // System hooks.
  system func postupgrade() { _forceSeedData() };
  system func preupgrade() { () };
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

  // Admin-only: forcibly re-initialize ALL seed data, including after upgrades or data loss.
  public shared ({ caller }) func initializeSeedData() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can initialize seed data");
    };
    _forceSeedData();
  };

  // Internal: never call this after upgrade for new data, only for forced seed state.
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
    ].values()) {
      artists.add(artistId, artist);
    };

    // Richie Hawtin events
    for ((eventId, event) in [
      (
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
      ),
      (
        "richie_berlin_berghain",
        {
          artistId = "richie_hawtin";
          eventTitle = "Richie Hawtin @ Berghain";
          venue = "Berghain";
          city = "Berlin";
          country = "Germany";
          dateTime = 1_789_000_000_000_000_000;
          sourceLabel = "RA";
          eventUrl = "https://ra.co/events/berghain-richiehawtin";
        },
      ),
      (
        "richie_ny_output",
        {
          artistId = "richie_hawtin";
          eventTitle = "Richie Hawtin @ Output";
          venue = "Output";
          city = "New York";
          country = "USA";
          dateTime = 1_795_800_000_000_000_000;
          sourceLabel = "RA";
          eventUrl = "https://ra.co/events/output-richiehawtin";
        },
      ),
      (
        "richie_barcelona_sonar",
        {
          artistId = "richie_hawtin";
          eventTitle = "Richie Hawtin @ Sónar";
          venue = "Sónar Festival";
          city = "Barcelona";
          country = "Spain";
          dateTime = 1_784_200_000_000_000_000;
          sourceLabel = "RA";
          eventUrl = "https://ra.co/events/sonar-richiehawtin";
        },
      ),
      (
        "richie_london_fabric",
        {
          artistId = "richie_hawtin";
          eventTitle = "Richie Hawtin @ Fabric";
          venue = "Fabric";
          city = "London";
          country = "UK";
          dateTime = 1_792_600_000_000_000_000;
          sourceLabel = "RA";
          eventUrl = "https://ra.co/events/fabric-richiehawtin";
        },
      ),
      (
        "richie_tokyo_womb",
        {
          artistId = "richie_hawtin";
          eventTitle = "Richie Hawtin @ Womb";
          venue = "Womb";
          city = "Tokyo";
          country = "Japan";
          dateTime = 1_802_000_000_000_000_000;
          sourceLabel = "RA";
          eventUrl = "https://ra.co/events/womb-richiehawtin";
        },
      ),
    ].values()) {
      events.add(eventId, event);
    };

    // Dave Clarke events (replacing all with real RA events)
    for (
      (eventId, event) in [
        (
          "dave_live_techno_vancouver",
          {
            artistId = "dave_clarke";
            eventTitle = "Live Techno Experience with Dave Clarke";
            venue = "TBA";
            city = "Vancouver";
            country = "Canada";
            dateTime = 1_767_952_000_000_000_000;
            sourceLabel = "RA";
            eventUrl = "https://ra.co";
          },
        ),
        (
          "dave_toronto_runnymeade",
          {
            artistId = "dave_clarke";
            eventTitle = "Dave Clarke in Toronto";
            venue = "821 Runnymede Rd";
            city = "Toronto";
            country = "Canada";
            dateTime = 1_767_958_400_000_000_000;
            sourceLabel = "RA";
            eventUrl = "https://ra.co";
          },
        ),
        (
          "dave_nancy_wonder_rave",
          {
            artistId = "dave_clarke";
            eventTitle = "WONDER RAVE";
            venue = "LA STATION NANCY";
            city = "Nancy";
            country = "France";
            dateTime = 1_768_723_200_000_000_000;
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
            dateTime = 1_768_809_600_000_000_000;
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
            dateTime = 1_770_995_200_000_000_000;
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
            dateTime = 1_773_528_000_000_000_000;
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
            dateTime = 1_779_069_600_000_000_000;
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
            dateTime = 1_773_715_200_000_000_000;
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
            dateTime = 1_820_905_600_000_000_000;
            sourceLabel = "RA";
            eventUrl = "https://ra.co";
          },
        ),
      ].values()
    ) {
      events.add(eventId, event);
    };

    // Jeff Mills events
    for ((eventId, event) in [
      (
        "jeff_mills_1",
        {
          artistId = "jeff_mills";
          eventTitle = "Live at Liquid Room 30th Anniversary";
          venue = "smartbar";
          city = "Chicago";
          country = "USA";
          dateTime = 1_775_484_800_000_000_000;
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
          dateTime = 1_775_998_400_000_000_000;
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
          dateTime = 1_775_998_400_000_000_000;
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
          dateTime = 1_776_012_800_000_000_000;
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
          dateTime = 1_776_086_400_000_000_000;
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
          dateTime = 1_776_172_800_000_000_000;
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
          dateTime = 1_776_259_200_000_000_000;
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
          dateTime = 1_776_793_600_000_000_000;
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
          dateTime = 1_776_880_000_000_000_000;
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
          dateTime = 1_776_966_400_000_000_000;
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
          dateTime = 1_777_587_200_000_000_000;
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
          dateTime = 1_777_673_600_000_000_000;
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
          dateTime = 1_777_966_400_000_000_000;
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
          dateTime = 1_786_134_400_000_000_000;
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
          dateTime = 1_792_774_400_000_000_000;
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
          dateTime = 1_792_951_000_000_000_000;
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

  // New CRUD: Persist save events per user
  public shared ({ caller }) func addEventToRadar(eventId : Text) : async Result {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save events to radar");
    };

    // Check if event exists
    if (not events.containsKey(eventId)) {
      return #eventNotFound;
    };

    let currentEvents = switch (userRadarEvents.get(caller)) {
      case (null) { Set.empty<Text>() };
      case (?s) { s };
    };

    if (currentEvents.contains(eventId)) {
      #alreadyExists;
    } else {
      let newEvents = Set.empty<Text>();
      newEvents.add(eventId);
      userRadarEvents.add(caller, newEvents);
      #success;
    };
  };

  public shared ({ caller }) func removeEventFromRadar(eventId : Text) : async Result {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can remove events from radar");
    };

    switch (userRadarEvents.get(caller)) {
      case (null) { #notFound };
      case (?events) {
        if (not events.contains(eventId)) {
          #notFound;
        } else {
          let newEvents = events.clone();
          newEvents.remove(eventId);
          userRadarEvents.add(caller, newEvents);
          #success;
        };
      };
    };
  };

  public query ({ caller }) func getRadarEvents() : async [Event] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view radar events");
    };

    switch (userRadarEvents.get(caller)) {
      case (null) { [] };
      case (?eventIds) {
        let eventsArray = eventIds.toArray();
        let mapped = eventsArray.map(
          func(id) {
            events.get(id);
          }
        );
        let filtered = mapped.filter(func(opt) { opt != null });
        let mappedToEvent = filtered.map(func(opt) { opt.unwrap() });
        mappedToEvent;
      };
    };
  };
};
