import type { CarpoolRide, ConcertEvent, TripPlan, Driver, StrangerMeet } from '../types';

export const mockDrivers: Driver[] = [
  {
    id: 'drv-01',
    name: 'Julian Vance',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 4.92,
    totalRides: 148,
    phone: '+33 6 42 89 10 32',
    email: 'julian.vance@rideshare.eu',
    verificationStatus: 'verified',
    idDocument: 'Passport EU-9023419',
    drivingLicenseNumber: 'DL-FR-889104',
    vehicleModel: 'Tesla Model Y Long Range',
    vehiclePlate: 'FR-892-TY',
    vehicleColor: 'Pearl White',
    joinedDate: 'Jan 2024'
  },
  {
    id: 'drv-02',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    rating: 4.88,
    totalRides: 92,
    phone: '+49 176 992813',
    email: 'elena.rostova@mobility.de',
    verificationStatus: 'verified',
    idDocument: 'DE-National-ID-4421',
    drivingLicenseNumber: 'DL-DE-390112',
    vehicleModel: 'Audi Q4 e-tron',
    vehiclePlate: 'B-ER 2024',
    vehicleColor: 'Mythos Black',
    joinedDate: 'Mar 2024'
  },
  {
    id: 'drv-03',
    name: 'Marcus Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 4.95,
    totalRides: 215,
    phone: '+1 415 882 9011',
    email: 'marcus.chen@baydrive.io',
    verificationStatus: 'verified',
    idDocument: 'US-Passport-Z771920',
    drivingLicenseNumber: 'CA-D8192031',
    vehicleModel: 'Toyota RAV4 Hybrid',
    vehiclePlate: '7XNZ991',
    vehicleColor: 'Magnetic Gray',
    joinedDate: 'Nov 2023'
  },
  {
    id: 'drv-04',
    name: 'Sofia Al-Mansoor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    rating: 4.79,
    totalRides: 34,
    phone: '+971 50 123 4567',
    email: 'sofia.mansoor@gulfcommute.ae',
    verificationStatus: 'pending',
    idDocument: 'Emirates ID 784-1994-1123',
    drivingLicenseNumber: 'DXB-L-091823',
    vehicleModel: 'Volvo XC60 Recharge',
    vehiclePlate: 'DXB-P-44812',
    vehicleColor: 'Pine Green',
    joinedDate: 'Oct 2024'
  },
  {
    id: 'drv-05',
    name: 'Aarav Patel',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rating: 4.84,
    totalRides: 68,
    phone: '+91 98200 44192',
    email: 'aarav.patel@expresspool.in',
    verificationStatus: 'pending',
    idDocument: 'Aadhaar 9912-3341-8891',
    drivingLicenseNumber: 'MH-01-2019-00912',
    vehicleModel: 'Hyundai Creta SX',
    vehiclePlate: 'MH-01-DW-8819',
    vehicleColor: 'Polar White',
    joinedDate: 'Sep 2024'
  }
];

export const mockCarpoolRides: CarpoolRide[] = [
  {
    id: 'ride-101',
    originCity: 'Paris',
    originPoint: 'Porte Maillot Metro Station',
    destinationCity: 'Brussels',
    destinationPoint: 'Bruxelles-Midi Railway Terminal',
    departureDate: '2026-10-25',
    departureTime: '08:30 AM',
    driver: mockDrivers[0],
    totalSeats: 4,
    availableSeats: 2,
    pricePerSeat: 28,
    currency: 'INR',
    status: 'active',
    waypoints: [
      { city: 'Compiègne', stopName: 'A1 Highway Service Area', estimatedTime: '09:20 AM' },
      { city: 'Lille', stopName: 'Gare Lille Europe', estimatedTime: '10:45 AM' }
    ],
    rules: {
      allowSmoking: false,
      allowPets: true,
      hasAC: true,
      maxTwoInBack: true,
      luggageSize: 'medium'
    },
    passengers: [
      { name: 'Lucas Martin', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80', seatsBooked: 1, pickupStop: 'Paris' },
      { name: 'Chloe Bernard', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', seatsBooked: 1, pickupStop: 'Lille' }
    ]
  },
  {
    id: 'ride-102',
    originCity: 'Berlin',
    originPoint: 'Alexanderplatz S-Bahn',
    destinationCity: 'Prague',
    destinationPoint: 'Praha Hlavní Nádraží',
    departureDate: '2026-10-26',
    departureTime: '09:00 AM',
    driver: mockDrivers[1],
    totalSeats: 3,
    availableSeats: 1,
    pricePerSeat: 32,
    currency: 'INR',
    status: 'active',
    waypoints: [
      { city: 'Dresden', stopName: 'Dresden Hbf Nord', estimatedTime: '11:15 AM' }
    ],
    rules: {
      allowSmoking: false,
      allowPets: false,
      hasAC: true,
      maxTwoInBack: true,
      luggageSize: 'large'
    },
    passengers: [
      { name: 'Markus Weber', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80', seatsBooked: 2, pickupStop: 'Berlin' }
    ]
  },
  {
    id: 'ride-103',
    originCity: 'San Francisco',
    originPoint: 'Salesforce Transit Center',
    destinationCity: 'Los Angeles',
    destinationPoint: 'Union Station Downtown LA',
    departureDate: '2026-10-28',
    departureTime: '06:45 AM',
    driver: mockDrivers[2],
    totalSeats: 4,
    availableSeats: 3,
    pricePerSeat: 45,
    currency: 'INR',
    status: 'active',
    waypoints: [
      { city: 'San Jose', stopName: 'Diridon Station', estimatedTime: '07:30 AM' },
      { city: 'Bakersfield', stopName: 'In-N-Out I-5 Stop', estimatedTime: '11:00 AM' }
    ],
    rules: {
      allowSmoking: false,
      allowPets: true,
      hasAC: true,
      maxTwoInBack: true,
      luggageSize: 'large'
    },
    passengers: [
      { name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80', seatsBooked: 1, pickupStop: 'San Jose' }
    ]
  },
  {
    id: 'ride-104',
    originCity: 'Mumbai',
    originPoint: 'Dadar Asiad Bus Terminal',
    destinationCity: 'Pune',
    destinationPoint: 'Wakad Bridge Flyover',
    departureDate: '2026-10-24',
    departureTime: '07:00 AM',
    driver: mockDrivers[4],
    totalSeats: 4,
    availableSeats: 0,
    pricePerSeat: 12,
    currency: 'INR',
    status: 'completed',
    waypoints: [
      { city: 'Navi Mumbai', stopName: 'Vashi Highway Plaza', estimatedTime: '07:45 AM' },
      { city: 'Lonavala', stopName: 'Expressway Food Court', estimatedTime: '08:45 AM' }
    ],
    rules: {
      allowSmoking: false,
      allowPets: false,
      hasAC: true,
      maxTwoInBack: false,
      luggageSize: 'medium'
    },
    passengers: [
      { name: 'Rohan Sharma', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', seatsBooked: 2, pickupStop: 'Dadar' },
      { name: 'Pooja Iyer', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80', seatsBooked: 2, pickupStop: 'Vashi' }
    ]
  }
];

export const mockConcerts: ConcertEvent[] = [
  {
    id: 'cnc-01',
    title: 'Neon Odyssey: World Electronic Symphony',
    artist: 'Anyma & Tale of Us',
    genre: 'EDM',
    date: '2026-11-14',
    doorsOpen: '19:00',
    venueName: 'Accor Arena',
    city: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=700&auto=format&fit=crop&q=80',
    totalCapacity: 18500,
    ticketsSold: 16920,
    minPrice: 65,
    maxPrice: 220,
    currency: 'INR',
    status: 'active',
    ticketTiers: [
      { name: 'General Admission Floor', price: 65, available: 420, total: 10000 },
      { name: 'Tier 1 Seated Vista', price: 110, available: 680, total: 6000 },
      { name: 'VIP Hologram Circle', price: 220, available: 480, total: 2500 }
    ],
    organizer: 'LiveNation Global Productions',
    connectedRidesCount: 42
  },
  {
    id: 'cnc-02',
    title: 'Music of the Spheres: Eco Tour Live',
    artist: 'Coldplay',
    genre: 'Rock',
    date: '2026-11-20',
    doorsOpen: '17:30',
    venueName: 'Olympiastadion',
    city: 'Berlin',
    country: 'Germany',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=700&auto=format&fit=crop&q=80',
    totalCapacity: 74000,
    ticketsSold: 71800,
    minPrice: 85,
    maxPrice: 350,
    currency: 'INR',
    status: 'active',
    ticketTiers: [
      { name: 'Solar Energy Standing Zone', price: 85, available: 1200, total: 40000 },
      { name: 'Grandstand Level 2', price: 145, available: 850, total: 25000 },
      { name: 'Infinity Kinetic Lounge', price: 350, available: 150, total: 9000 }
    ],
    organizer: 'Green Planet Entertainment',
    connectedRidesCount: 88
  },
  {
    id: 'cnc-03',
    title: 'Golden Horizon Acoustic Nights',
    artist: 'Lana Del Rey',
    genre: 'Indie',
    date: '2026-12-05',
    doorsOpen: '18:30',
    venueName: 'Hollywood Bowl',
    city: 'Los Angeles',
    country: 'United States',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=700&auto=format&fit=crop&q=80',
    totalCapacity: 17500,
    ticketsSold: 17200,
    minPrice: 95,
    maxPrice: 420,
    currency: 'INR',
    status: 'active',
    ticketTiers: [
      { name: 'Terrace Garden Tier', price: 95, available: 180, total: 8000 },
      { name: 'Pool Circle Premium', price: 210, available: 90, total: 6000 },
      { name: 'Artist Box Experience', price: 420, available: 30, total: 3500 }
    ],
    organizer: 'Goldenvoice West Coast',
    connectedRidesCount: 31
  },
  {
    id: 'cnc-04',
    title: 'Utopia Stadium Global Leg',
    artist: 'Travis Scott',
    genre: 'Hip-Hop',
    date: '2026-12-18',
    doorsOpen: '19:00',
    venueName: 'Coca-Cola Arena',
    city: 'Dubai',
    country: 'United Arab Emirates',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=700&auto=format&fit=crop&q=80',
    totalCapacity: 17000,
    ticketsSold: 12400,
    minPrice: 80,
    maxPrice: 380,
    currency: 'INR',
    status: 'upcoming',
    ticketTiers: [
      { name: 'Circus Maximus Pit', price: 80, available: 3200, total: 10000 },
      { name: 'Lower Tier Golden Seat', price: 170, available: 1100, total: 5000 },
      { name: 'VIP Skybox Suite', price: 380, available: 300, total: 2000 }
    ],
    organizer: 'Middlesea Concert Guild',
    connectedRidesCount: 19
  }
];

export const mockTrips: TripPlan[] = [
  {
    id: 'trip-301',
    title: 'Alpine Pass & Concert Odyssey',
    creatorName: 'Sebastian Miller',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    creatorBio: 'Architect & festival photographer traveling across western Europe.',
    origin: 'Paris, France',
    destination: 'Brussels & Bruges, Belgium',
    startDate: '2026-10-25',
    endDate: '2026-10-29',
    totalDays: 5,
    estimatedBudget: 380,
    currency: 'INR',
    category: 'Music Tour',
    maxTravelers: 4,
    joinedTravelers: [
      { id: 'usr-1', name: 'Sebastian Miller', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', joinedAt: 'Creator' },
      { id: 'usr-2', name: 'Alina Gomez', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80', joinedAt: '2 days ago' },
      { id: 'usr-3', name: 'Daniel Kim', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', joinedAt: '1 day ago' }
    ],
    waypoints: ['Paris (Starting Point)', 'Chantilly Historic Castle', 'Lille Grand Place', 'Brussels Grand Place', 'Bruges Canals'],
    linkedCarpoolRideId: 'ride-101',
    status: 'active',
    itinerary: [
      {
        dayNumber: 1,
        title: 'Departure & Lille Architecture Walk',
        destination: 'Lille, France',
        description: 'Meet at Porte Maillot Paris, carpool together in Tesla Model Y to Lille, lunch at Vieux-Lille.',
        highlights: ['Carpool departure 08:30', 'Old Town Lille', 'Local French Waffles']
      },
      {
        dayNumber: 2,
        title: 'Arrival in Brussels & Indie Showcase',
        destination: 'Brussels, Belgium',
        description: 'Short 1 hour drive to Brussels, check in hostel, attend local underground electronic festival.',
        highlights: ['Grand Place sunset', 'Atomium evening lights', 'Electronic showcase']
      },
      {
        dayNumber: 3,
        title: 'Day Trip to Medieval Bruges',
        destination: 'Bruges, Belgium',
        description: 'Cruise along ancient canals, visit Belfry tower, photography session.',
        highlights: ['Canal boat tour', 'Belfry panorama', 'Artisan chocolate tasting']
      }
    ]
  },
  {
    id: 'trip-302',
    title: 'Pacific Coast Highway Sunset Expedition',
    creatorName: 'Maya Lin',
    creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    creatorBio: 'Outdoor filmmaker & surfer looking for roadtrip companions.',
    origin: 'San Francisco, CA',
    destination: 'Los Angeles, CA',
    startDate: '2026-10-28',
    endDate: '2026-11-02',
    totalDays: 6,
    estimatedBudget: 620,
    currency: 'INR',
    category: 'Roadtrip',
    maxTravelers: 4,
    joinedTravelers: [
      { id: 'usr-4', name: 'Maya Lin', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80', joinedAt: 'Creator' },
      { id: 'usr-5', name: 'Trevor Vance', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', joinedAt: '3 days ago' }
    ],
    waypoints: ['San Francisco Embarcadero', 'Santa Cruz Boardwalk', 'Big Sur Bixby Bridge', 'San Luis Obispo', 'Santa Barbara Pier', 'Santa Monica'],
    linkedCarpoolRideId: 'ride-103',
    status: 'active',
    itinerary: [
      {
        dayNumber: 1,
        title: 'Bay Area to Monterey Bay Coast',
        destination: 'Monterey & Carmel',
        description: 'Early pickup across SF, scenic drive down Route 1, sunset at 17-Mile Drive.',
        highlights: ['Golden Gate view', 'Monterey Bay Aquarium', 'Carmel beach sunset']
      },
      {
        dayNumber: 2,
        title: 'The Iconic Bixby Creek & Coastal Redwoods',
        destination: 'Big Sur, CA',
        description: 'Pfeiffer Big Sur National Park, hiking trails through ancient redwoods.',
        highlights: ['Bixby Creek Bridge', 'McWay Falls lookout', 'Campfire stories']
      },
      {
        dayNumber: 3,
        title: 'Santa Barbara to Los Angeles Concert Finish',
        destination: 'Los Angeles, CA',
        description: 'Arrival in LA just in time for the Hollywood Bowl concert night.',
        highlights: ['State Street Santa Barbara', 'Malibu coast drive', 'Concert night at Hollywood Bowl']
      }
    ]
  },
  {
    id: 'trip-303',
    title: 'Bohemian Castles & Prague Music Nights',
    creatorName: 'Henrik Larsson',
    creatorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    creatorBio: 'History enthusiast and concert goer.',
    origin: 'Berlin, Germany',
    destination: 'Prague, Czech Republic',
    startDate: '2026-10-26',
    endDate: '2026-10-30',
    totalDays: 4,
    estimatedBudget: 340,
    currency: 'INR',
    category: 'City Hopping',
    maxTravelers: 3,
    joinedTravelers: [
      { id: 'usr-6', name: 'Henrik Larsson', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80', joinedAt: 'Creator' },
      { id: 'usr-7', name: 'Svenja Mueller', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', joinedAt: 'Yesterday' }
    ],
    waypoints: ['Berlin Alexanderplatz', 'Dresden Zwinger Palace', 'Saxon Switzerland National Park', 'Prague Old Town'],
    linkedCarpoolRideId: 'ride-102',
    status: 'upcoming',
    itinerary: [
      {
        dayNumber: 1,
        title: 'Berlin to Dresden Baroque Architecture',
        destination: 'Dresden, Germany',
        description: 'Carpool pickup with Elena, visit Dresden Frauenkirche, Saxon coffee break.',
        highlights: ['Carpool link', 'Zwinger Palace gardens', 'Elbe river twilight']
      },
      {
        dayNumber: 2,
        title: 'Arrival in Prague & Charles Bridge Night Stroll',
        destination: 'Prague, Czechia',
        description: 'Cross the Czech border, evening walk across Charles Bridge and Old Town Square.',
        highlights: ['Astronomical Clock', 'Prague Castle night view', 'Traditional Trdelník']
      }
    ]
  }
];

export const mockStrangerMeets: StrangerMeet[] = [
  {
    id: 'sm-01',
    title: 'Indiranagar Coffee & Roadtrip Icebreaker',
    description: 'Casual Sunday morning coffee to meet solo commuters, exchange road trip playlists, and coordinate upcoming weekend carpools to Coorg and Gokarna.',
    hostName: 'Aarav Sharma',
    hostAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    hostRating: 4.95,
    hostVerified: true,
    category: 'Coffee & Chill',
    city: 'Bengaluru',
    meetingPoint: 'Third Wave Coffee, 12th Main Indiranagar',
    meetDate: '2026-10-25',
    meetTime: '10:30 AM',
    maxParticipants: 8,
    status: 'upcoming',
    vibeTags: ['CoffeeLovers', 'CoorgTrip', 'Playlists', 'WeekendGetaway'],
    safetyGuidelines: [
      'Verified Government ID required at check-in',
      'Public cafe location with free Wi-Fi and parking',
      'Zero alcohol or substance tolerance',
      'Host coordinates dedicated group chat for transit'
    ],
    participants: [
      {
        id: 'p-01',
        name: 'Priya Iyer',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        age: 26,
        gender: 'Female',
        city: 'Bengaluru',
        bio: 'Product designer & solo backpacker. Looking for safe carpooling buddies for South India roadtrips.',
        verifiedKYC: true,
        interests: ['Hiking', 'Indie Rock', 'Photography'],
        joinedAt: '2 days ago',
        status: 'confirmed',
        socialScore: 98
      },
      {
        id: 'p-02',
        name: 'Rohan Mehra',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
        age: 28,
        gender: 'Male',
        city: 'Bengaluru',
        bio: 'Software engineer who loves driving to Western Ghats. Car owner with 3 empty seats.',
        verifiedKYC: true,
        interests: ['EV Driving', 'Camping', 'Tech Podcasts'],
        joinedAt: 'Yesterday',
        status: 'confirmed',
        socialScore: 94
      },
      {
        id: 'p-03',
        name: 'Ananya Deshmukh',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        age: 24,
        gender: 'Female',
        city: 'Bengaluru',
        bio: 'Architecture student looking to explore heritage temples near Hampi.',
        verifiedKYC: true,
        interests: ['History', 'Sketching', 'Specialty Coffee'],
        joinedAt: '3 hours ago',
        status: 'confirmed',
        socialScore: 96
      }
    ]
  },
  {
    id: 'sm-02',
    title: 'Nandi Hills Sunrise Pre-Roadtrip Squad',
    description: 'Early morning meetup at Hebbal flyover to split cars, grab breakfast, and chase the sunrise cloud-bed at Nandi Hills together.',
    hostName: 'Vikram Joshi',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    hostRating: 4.88,
    hostVerified: true,
    category: 'Weekend Roadtrip',
    city: 'Bengaluru',
    meetingPoint: 'Hebbal Esteem Mall Outer Ring Road',
    meetDate: '2026-10-26',
    meetTime: '04:45 AM',
    maxParticipants: 10,
    status: 'active',
    vibeTags: ['EarlyBirds', 'SunriseChasers', 'CarpoolGroup', 'ChaiBreak'],
    safetyGuidelines: [
      'Helmets/Seatbelts mandatory for all travelers',
      'Real-time GPS ride tracking enabled via platform',
      'Emergency contacts verified prior to meetup'
    ],
    participants: [
      {
        id: 'p-04',
        name: 'Kabir Verma',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        age: 27,
        gender: 'Male',
        city: 'Bengaluru',
        bio: 'Amateur drone pilot & morning cyclist. Bringing my GoPro!',
        verifiedKYC: true,
        interests: ['Drone Photography', 'Cycling', 'Fitness'],
        joinedAt: '1 day ago',
        status: 'confirmed',
        socialScore: 92
      },
      {
        id: 'p-05',
        name: 'Sneha Patel',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        age: 25,
        gender: 'Female',
        city: 'Bengaluru',
        bio: 'First time doing a stranger carpool meetup! Super excited for the hill view.',
        verifiedKYC: true,
        interests: ['Nature', 'Acoustic Guitar', 'Baking'],
        joinedAt: '5 hours ago',
        status: 'confirmed',
        socialScore: 90
      }
    ]
  },
  {
    id: 'sm-03',
    title: 'Bandra Bandstand Sunset Jam & Acoustic Talk',
    description: 'Sunset gathering on the rocks by Carter Road. Bring instruments, travel journals, and ideas for the upcoming Goa music festival carpool caravan.',
    hostName: 'Maya Nair',
    hostAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    hostRating: 4.97,
    hostVerified: true,
    category: 'Music & Nightlife',
    city: 'Mumbai',
    meetingPoint: 'Candies Cafe Pali Hill, Bandra West',
    meetDate: '2026-10-27',
    meetTime: '05:30 PM',
    maxParticipants: 12,
    status: 'upcoming',
    vibeTags: ['SunsetVibes', 'LiveMusic', 'GoaCaravan', 'TravelStories'],
    safetyGuidelines: [
      'Group gathers first at well-lit cafe before walking to promenade',
      'Community buddy safety pair system implemented'
    ],
    participants: [
      {
        id: 'p-06',
        name: 'Devansh Kulkarni',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
        age: 29,
        gender: 'Male',
        city: 'Mumbai',
        bio: 'Guitarist & music festival enthusiast. Heading to Sunburn Festival in December.',
        verifiedKYC: true,
        interests: ['Electric Guitar', 'EDM', 'Beach Volleyball'],
        joinedAt: '3 days ago',
        status: 'confirmed',
        socialScore: 97
      }
    ]
  },
  {
    id: 'sm-04',
    title: 'Triund Trek Weekend Strangers Companion Squad',
    description: 'Gathering at McLeodganj Main Square to form a safe, guided group for the 2-day Triund ridge trek with campfire stargazing.',
    hostName: 'Tenzin Norbu',
    hostAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    hostRating: 4.99,
    hostVerified: true,
    category: 'Trek & Adventure',
    city: 'Dharamshala',
    meetingPoint: 'Illiterati Books & Coffee, Jogiwara Road',
    meetDate: '2026-10-29',
    meetTime: '08:00 AM',
    maxParticipants: 8,
    status: 'upcoming',
    vibeTags: ['HimalayanTrek', 'Stargazing', 'Campfire', 'Backpackers'],
    safetyGuidelines: [
      'Certified mountain trek guide accompanies the group',
      'First-aid medical kit and oxygen canister provided',
      'Strict Leave No Trace eco-guidelines'
    ],
    participants: [
      {
        id: 'p-07',
        name: 'Tanvi Sen',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        age: 26,
        gender: 'Female',
        city: 'Delhi',
        bio: 'Solo hiker on workation in Himachal. Looking for fun trail buddies.',
        verifiedKYC: true,
        interests: ['Trekking', 'Mountain Views', 'Yoga'],
        joinedAt: '1 day ago',
        status: 'confirmed',
        socialScore: 99
      }
    ]
  },
  {
    id: 'sm-05',
    title: 'Old Delhi Heritage Food Walk & Strangers Circle',
    description: 'A curated evening food trail sampling iconic parathas, kebabs, and jalebis while bonding with fellow foodies and history lovers.',
    hostName: 'Zeeshan Akhtar',
    hostAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    hostRating: 4.86,
    hostVerified: true,
    category: 'City Walk & Food',
    city: 'Delhi',
    meetingPoint: 'Chandni Chowk Metro Station Exit Gate 1',
    meetDate: '2026-10-30',
    meetTime: '06:00 PM',
    maxParticipants: 10,
    status: 'upcoming',
    vibeTags: ['StreetFood', 'OldDelhi', 'Storytelling', 'Heritage'],
    safetyGuidelines: [
      'Meet at designated metro security kiosk',
      'Host provides verified route map and emergency contact cards'
    ],
    participants: [
      {
        id: 'p-08',
        name: 'Siddharth Rao',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        age: 31,
        gender: 'Male',
        city: 'Gurugram',
        bio: 'Food blogger and weekend traveler. Excited to meet local food enthusiasts.',
        verifiedKYC: true,
        interests: ['Food Photography', 'Culinary Arts', 'City Walks'],
        joinedAt: '2 days ago',
        status: 'confirmed',
        socialScore: 95
      }
    ]
  }
];

export const platformStats = {
  totalRidesListed: 14280,
  activeCarpoolsToday: 894,
  totalSeatsShared: 48920,
  co2SavedTons: 142.6,
  totalConcertsUploaded: 640,
  activeEventsThisMonth: 128,
  ticketsFacilitated: 382400,
  activeTripsPlanned: 1240,
  travelBuddiesMatched: 8430,
  strangerMeetsActive: 18,
  pendingDriverVerifications: 14
};
