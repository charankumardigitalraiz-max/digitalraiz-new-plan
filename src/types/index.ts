export type NavigationTab = 'overview' | 'users' | 'carpooling' | 'concerts' | 'trips' | 'stranger-meets' | 'stranger-meet' | 'drivers' | 'settings' | 'help';

export type StatusType = 'active' | 'upcoming' | 'completed' | 'cancelled' | 'pending' | 'verified' | 'rejected';



export * from './auth';
export * from './carpool';


export interface GlobalUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: 'driver' | 'passenger' | 'traveler' | 'concert_goer' | 'host' | 'multi_role' | 'user' | 'admin' | string;
  modules: ('carpooling' | 'concerts' | 'trips' | 'stranger-meets')[];
  status: 'active' | 'suspended' | 'pending' | string;
  kycStatus: 'verified' | 'pending' | 'unverified' | 'rejected' | string;
  isKYC?: boolean;
  isEmailVerified?: boolean;
  city: string;
  country: string;
  joinedDate: string;
  lastActive: string;
  rating: number;
  totalActivities: number; // total rides, trips, meets, concerts
  totalRidesPublished?: number;
  totalBookings?: number;
  totalSpentOrEarned: string;
  trustScore: number; // 0 - 100%
  govtIdNumber?: string;
  govtIdProof?: string;
  vehicleDetails?: {
    model: string;
    plate: string;
    color: string;
  };
  idDocument?: string;
  badges: string[];
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Driver {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  totalRides: number;
  phone: string;
  email: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  idDocument: string;
  drivingLicenseNumber: string;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleColor: string;
  joinedDate: string;
  govtIdNumber?: string | null;
  govtIdProof?: string | null;
  isKYC?: boolean;
  isEmailVerified?: boolean;
  KYCStatus?: 'verified' | 'pending' | 'rejected' | string;
}

export interface Waypoint {
  city: string;
  stopName: string;
  estimatedTime: string;
}

export interface CarpoolRide {
  id: string;
  originCity: string;
  originPoint: string;
  destinationCity: string;
  destinationPoint: string;
  departureTime: string;
  departureDate: string;
  driver: Driver;
  totalSeats: number;
  availableSeats: number;
  pricePerSeat: number;
  currency: string;
  status: 'active' | 'completed' | 'cancelled';
  waypoints: Waypoint[];
  distance?: string;
  rules: {
    allowSmoking: boolean;
    allowPets: boolean;
    hasAC: boolean;
    maxTwoInBack: boolean;
    luggageSize: 'small' | 'medium' | 'large';
  };
  passengers: {
    name: string;
    avatar: string;
    seatsBooked: number;
    pickupStop: string;
  }[];
}

export interface ConcertEvent {
  id: string;
  title: string;
  artist: string;
  genre: 'EDM' | 'Rock' | 'Pop' | 'Hip-Hop' | 'Indie' | 'Classical' | 'Jazz';
  date: string;
  doorsOpen: string;
  venueName: string;
  city: string;
  country: string;
  image: string;
  totalCapacity: number;
  ticketsSold: number;
  minPrice: number;
  maxPrice: number;
  currency: string;
  status: 'active' | 'upcoming' | 'completed' | 'cancelled';
  ticketTiers: {
    name: string;
    price: number;
    available: number;
    total: number;
  }[];
  organizer: string;
  connectedRidesCount: number;
}

export interface TripItineraryDay {
  dayNumber: number;
  title: string;
  destination: string;
  description: string;
  highlights: string[];
}

export interface TripTraveler {
  id: string;
  name: string;
  avatar: string;
  joinedAt: string;
  pickupStop?: string;
  seatsBooked?: number;
}

export interface TripPlan {
  id: string;
  title: string;
  creatorName: string;
  creatorAvatar: string;
  creatorBio: string;
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  estimatedBudget: number;
  currency: string;
  category: 'Roadtrip' | 'Music Tour' | 'Nature & Trek' | 'City Hopping' | 'Weekend Escape';
  maxTravelers: number;
  joinedTravelers: TripTraveler[];
  itinerary: TripItineraryDay[];
  waypoints: string[];
  linkedCarpoolRideId?: string;
  status: 'active' | 'upcoming' | 'completed';
}

export interface StrangerMeetParticipant {
  id: string;
  name: string;
  avatar: string;
  age: number;
  gender: string;
  city: string;
  bio: string;
  verifiedKYC: boolean;
  interests: string[];
  joinedAt: string;
  status: 'confirmed' | 'pending';
  socialScore: number;
}

export interface StrangerMeet {
  id: string;
  title: string;
  description: string;
  hostName: string;
  hostAvatar: string;
  hostRating: number;
  hostVerified: boolean;
  category: 'Coffee & Chill' | 'Weekend Roadtrip' | 'Trek & Adventure' | 'Music & Nightlife' | 'City Walk & Food';
  city: string;
  meetingPoint: string;
  meetDate: string;
  meetTime: string;
  maxParticipants: number;
  participants: StrangerMeetParticipant[];
  safetyGuidelines: string[];
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  vibeTags: string[];
}


