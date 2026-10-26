import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import type {
  NavigationTab,
  CarpoolRide,
  ConcertEvent,
  TripPlan,
  Driver,
  StrangerMeet,
  Venue,
  Artist
} from './types';
import {
  mockCarpoolRides,
  mockConcerts,
  mockTrips,
  mockDrivers,
  mockStrangerMeets,
  mockVenues,
  mockArtists
} from './data/mockData';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { GlobalOverview } from './components/overview/GlobalOverview';
import { GlobalUsersView } from './components/users/GlobalUsersView';
import { GlobalUserDetailView } from './components/users/GlobalUserDetailView';
import { CarpoolBookingList } from './components/carpool/CarpoolBookingList';
import { CarpoolOverview } from './components/carpool/CarpoolOverview';
import { DriverVerificationScreen } from './components/carpool/DriverVerificationScreen';
import { RideDetailScreen } from './components/carpool/RideDetailScreen';
import { CarpoolSettings } from './components/carpool/CarpoolSettings';
import { CreateRideModal } from './components/carpool/CreateRideModal';
import { ConcertsDashboard } from './components/concerts/ConcertsList';
import { ConcertsOverview } from './components/concerts/ConcertsOverview';
import { ConcertDetailModal } from './components/concerts/ConcertDetailModal';
import { ConcertDetailScreen } from './components/concerts/ConcertDetailScreen';
import { UploadConcertModal } from './components/concerts/UploadConcertModal';
import { VenuesView } from './components/concerts/VenuesView';
import { ArtistsView } from './components/concerts/ArtistsView';
import { TripPlannerDashboard } from './components/trips/TripPlannerDashboard';
import { TripDetailModal } from './components/trips/TripDetailModal';
import { CreateTripModal } from './components/trips/CreateTripModal';
import { StrangerMeetDashboard } from './components/stranger-meet/StrangerMeetDashboard';
import { StrangerMeetDetailModal } from './components/stranger-meet/StrangerMeetDetailModal';
import { CreateStrangerMeetModal } from './components/stranger-meet/CreateStrangerMeetModal';
import { SettingsView } from './components/system/SettingsView';
import { HelpView } from './components/system/HelpView';
import { Login } from './components/auth/Login';
import { authService, carpoolService, driverService } from './services';
import type { AdminUser } from './types/index';

export function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    return authService.getCurrentUser();
  });

  // Listen for global session expiry events (triggered by 401 / Invalid or expired token)
  useEffect(() => {
    const handleSessionExpired = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string }>;
      setCurrentUser(null);
      navigate('/', { replace: true });
      showToast(customEvent.detail?.message || 'Invalid or expired token. Please log in again.');
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [navigate]);

  // Verify profile via API if token is present
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      authService
        .getCurrentAdminProfile()
        .then((profile) => {
          if (profile) setCurrentUser(profile);
        })
        .catch((err) => {
          // If token verification fails due to expiration or invalid token, terminate session
          if (
            err?.status === 401 ||
            err?.message?.toLowerCase().includes('token') ||
            err?.message?.toLowerCase().includes('expired')
          ) {
            authService.clearAllAuth();
            setCurrentUser(null);
          }
        });
    }
  }, []);

  // Derive active tab and subTab from current React Router pathname
  const pathParts = location.pathname.replace(/^\//, '').split('/');
  const tabCandidate = pathParts[0] as NavigationTab;
  const validTabs: NavigationTab[] = ['overview', 'users', 'carpooling', 'concerts', 'trips', 'stranger-meets', 'stranger-meet', 'settings', 'help'];
  const activeTab: NavigationTab = validTabs.includes(tabCandidate) ? tabCandidate : 'overview';
  const activeSubTab = pathParts[1] || (
    activeTab === 'carpooling' ? 'overview' :
      activeTab === 'concerts' ? 'all-concerts' :
        activeTab === 'trips' ? 'all-trips' :
          (activeTab === 'stranger-meets' || activeTab === 'stranger-meet') ? 'all-meets' : 'overview-pulse'
  );

  const [searchQuery, setSearchQuery] = useState('');

  const handleTabChange = (tab: NavigationTab, subTab?: string) => {
    if (tab === 'drivers') {
      navigate('/carpooling/verifications');
      return;
    }
    let path = `/${tab}`;
    if (tab === 'users') {
      path = '/users';
    } else if (subTab && subTab !== 'overview-pulse') {
      path += `/${subTab}`;
    } else if (tab === 'carpooling') {
      path += '/overview';
    } else if (tab === 'concerts') {
      path += '/all-concerts';
    } else if (tab === 'trips') {
      path += '/all-trips';
    } else if (tab === 'stranger-meets' || tab === 'stranger-meet') {
      path = '/stranger-meets/all-meets';
    }
    navigate(path);
    setSearchQuery('');
  };

  // Domain Entities State
  const [rides, setRides] = useState<CarpoolRide[]>(mockCarpoolRides);
  const [concerts, setConcerts] = useState<ConcertEvent[]>(mockConcerts);
  const [trips, setTrips] = useState<TripPlan[]>(mockTrips);
  const [drivers, setDrivers] = useState<Driver[]>(mockDrivers);
  const [strangerMeets, setStrangerMeets] = useState<StrangerMeet[]>(mockStrangerMeets);

  // Selected Detail Modals
  const [selectedRide, setSelectedRide] = useState<CarpoolRide | null>(null);
  const [selectedConcert, setSelectedConcert] = useState<ConcertEvent | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<TripPlan | null>(null);
  const [selectedStrangerMeet, setSelectedStrangerMeet] = useState<StrangerMeet | null>(null);

  // Creation Modals
  const [isCreateRideOpen, setIsCreateRideOpen] = useState(false);
  const [isUploadConcertOpen, setIsUploadConcertOpen] = useState(false);
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);
  const [isCreateStrangerMeetOpen, setIsCreateStrangerMeetOpen] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Carpool Handlers
  const handleAddRide = (newRide: CarpoolRide) => {
    setRides([newRide, ...rides]);
    showToast(`Carpool ride from ${newRide.originCity} to ${newRide.destinationCity} published!`);
  };

  const handleDeleteRide = async (rideId: string) => {
    try {
      await carpoolService.deleteRide(rideId);
    } catch (err) {
      console.warn('API delete ride notice:', err);
    }
    setRides(rides.filter(r => r.id !== rideId));
    showToast('Carpool ride removed from network.');
  };

  const handleUpdateRideStatus = async (rideId: string, newStatus: 'active' | 'completed' | 'cancelled') => {
    try {
      await carpoolService.updateRideStatus(rideId, newStatus);
    } catch (err) {
      console.warn('API update ride status notice:', err);
    }
    setRides(rides.map(r => r.id === rideId ? { ...r, status: newStatus } : r));
    showToast(`Ride status updated to ${newStatus}.`);
  };

  // Concert Handlers
  const handleAddConcert = (newConcert: ConcertEvent) => {
    setConcerts([newConcert, ...concerts]);
    showToast(`Concert "${newConcert.title}" published!`);
  };

  const handleDeleteConcert = (id: string) => {
    setConcerts(concerts.filter(c => c.id !== id));
    showToast('Concert event archived.');
  };

  const handleUpdateConcertStatus = (id: string, status: 'active' | 'upcoming' | 'completed' | 'cancelled') => {
    setConcerts(concerts.map(c => c.id === id ? { ...c, status } : c));
    showToast(`Event status updated to ${status}.`);
  };

  // Venues & Artists State
  const [venues, setVenues] = useState<Venue[]>(mockVenues);
  const [artists, setArtists] = useState<Artist[]>(mockArtists);

  const handleAddVenue = (newVenue: Venue) => {
    setVenues([newVenue, ...venues]);
  };

  const handleAddArtist = (newArtistData: Omit<Artist, 'id'>) => {
    const created: Artist = {
      ...newArtistData,
      id: `art-${Date.now().toString().slice(-4)}`
    };
    setArtists([created, ...artists]);
  };

  const handleDeleteArtist = (artistId: string) => {
    setArtists(artists.filter(a => a.id !== artistId));
  };

  // Trip Handlers
  const handleAddTrip = (newTrip: TripPlan) => {
    setTrips([newTrip, ...trips]);
    showToast(`Trip plan "${newTrip.title}" uploaded!`);
  };

  const handleDeleteTrip = (id: string) => {
    setTrips(trips.filter(t => t.id !== id));
    showToast('Trip plan removed.');
  };

  // Driver KYC Handlers
  const handleVerifyDriver = async (driverId: string, status: 'verified' | 'rejected' | 'pending') => {
    try {
      await driverService.verifyDriver(driverId, status);
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === driverId
            ? {
              ...d,
              verificationStatus: status,
              isKYC: status === 'verified'
            }
            : d
        )
      );
      showToast(status === 'verified' ? 'Driver approved & KYC verified!' : `Driver verification set to ${status}.`);
    } catch {
      setDrivers((prev) =>
        prev.map((d) => (d.id === driverId ? { ...d, verificationStatus: status } : d))
      );
      showToast(`Driver verification updated.`);
    }
  };

  // Stranger Meet Handlers
  const handleAddStrangerMeet = (newMeet: StrangerMeet) => {
    setStrangerMeets([newMeet, ...strangerMeets]);
    showToast(`Meetup "${newMeet.title}" hosted successfully!`);
  };

  const handleDeleteStrangerMeet = (id: string) => {
    setStrangerMeets(strangerMeets.filter(m => m.id !== id));
    showToast('Stranger meetup removed.');
  };

  const handleUpdateStrangerMeetStatus = (id: string, newStatus: StrangerMeet['status']) => {
    setStrangerMeets(strangerMeets.map(m => m.id === id ? { ...m, status: newStatus } : m));
    showToast(`Meetup status updated to ${newStatus}.`);
  };

  // Primary action button dispatch from header
  const handleHeaderAction = () => {
    if (activeTab === 'carpooling' || activeTab === 'drivers') {
      if (activeSubTab === 'verifications' || activeTab === 'drivers') {
        const pending = drivers.find(d => d.verificationStatus === 'pending');
        if (pending) {
          handleVerifyDriver(pending.id, 'verified');
        } else {
          showToast('All pending driver applications have been reviewed.');
        }
      } else {
        setIsCreateRideOpen(true);
      }
    } else if (activeTab === 'concerts') setIsUploadConcertOpen(true);
    else if (activeTab === 'trips') setIsCreateTripOpen(true);
    else if (activeTab === 'stranger-meets' || activeTab === 'stranger-meet') setIsCreateStrangerMeetOpen(true);
  };

  // Authentication Handlers
  const handleLogin = (user: AdminUser) => {
    setCurrentUser(user);
    authService.setCurrentUser(user);
    showToast(`Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    showToast('Signed out of admin panel.');
  };

  // If unauthenticated, display the dedicated Login Portal
  if (!currentUser) {
    return (
      <>
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white text-slate-800 px-4 py-3 shadow-lg transition-all animate-in slide-in-from-bottom-5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-normal text-slate-800">{toastMessage}</span>
          </div>
        )}
        <Login onLogin={handleLogin} />
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 antialiased font-sans">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg transition-all animate-in slide-in-from-bottom-5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-normal text-slate-800">{toastMessage}</span>
        </div>
      )}

      {/* Global Sidebar */}
      <Sidebar
        activeTab={activeTab}
        activeSubTab={activeSubTab}
        onTabChange={handleTabChange}
        pendingDriverCount={drivers.filter(d => d.verificationStatus === 'pending').length}
        activeCarpoolCount={rides.filter(r => r.status === 'active').length}
        concertCount={concerts.length}
        tripCount={trips.length}
        strangerMeetsCount={strangerMeets.length}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Administrative Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          activeSubTab={activeSubTab}
          onOpenCreateModal={handleHeaderAction}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 lg:p-5 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />

            {/* Overview */}
            <Route
              path="/overview"
              element={
                <GlobalOverview
                  rides={rides}
                  concerts={concerts}
                  trips={trips}
                  drivers={drivers}
                  onNavigateTab={(tab) => handleTabChange(tab)}
                  onOpenCreateRide={() => setIsCreateRideOpen(true)}
                  onOpenUploadConcert={() => setIsUploadConcertOpen(true)}
                  onOpenCreateTrip={() => setIsCreateTripOpen(true)}
                />
              }
            />

            {/* Global User Directory */}
            <Route
              path="/users"
              element={
                <GlobalUsersView
                  onShowToast={(msg) => showToast(msg)}
                />
              }
            />
            <Route
              path="/users/:userId"
              element={
                <GlobalUserDetailView
                  onShowToast={(msg) => showToast(msg)}
                />
              }
            />

            {/* Carpooling Module */}
            <Route path="/carpooling" element={<Navigate to="/carpooling/overview" replace />} />
            <Route
              path="/carpooling/overview"
              element={
                <CarpoolOverview
                  onNavigateSubTab={(sub) => navigate(`/carpooling/${sub}`)}
                  onSelectRide={(ride) => navigate(`/carpooling/rides/${ride.id}`)}
                  onOpenCreateModal={() => setIsCreateRideOpen(true)}
                />
              }
            />
            <Route
              path="/carpooling/rides"
              element={
                <CarpoolBookingList
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onSelectRide={(ride) => navigate(`/carpooling/rides/${ride.id}`)}
                  onDeleteRide={handleDeleteRide}
                  onOpenCreateModal={() => setIsCreateRideOpen(true)}
                />
              }
            />
            <Route
              path="/carpooling/rides/:rideId"
              element={
                <RideDetailScreen
                  onStatusChange={handleUpdateRideStatus}
                  onDeleteRide={handleDeleteRide}
                />
              }
            />
            <Route
              path="/carpooling/verifications"
              element={
                <DriverVerificationScreen
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onViewDriverDetails={(driver) => navigate(`/users/${driver.id}?tab=kyc`)}
                />
              }
            />
            <Route
              path="/carpooling/settings"
              element={
                <CarpoolSettings
                  onShowToast={(msg) => showToast(msg)}
                />
              }
            />
            <Route path="/drivers" element={<Navigate to="/carpooling/verifications" replace />} />

            {/* Concerts & Events Module */}
            <Route path="/concerts" element={<Navigate to="/concerts/overview" replace />} />
            <Route
              path="/concerts/overview"
              element={
                <ConcertsOverview
                  concerts={concerts}
                  onNavigateSubTab={(sub) => navigate(`/concerts/${sub}`)}
                  onSelectConcert={(concert) => navigate(`/concerts/${concert.id}`)}
                  onOpenUploadModal={() => setIsUploadConcertOpen(true)}
                />
              }
            />
            <Route
              path="/concerts/all-concerts"
              element={
                <ConcertsDashboard
                  concerts={concerts}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  activeSubTab="all-concerts"
                  onSubTabChange={(sub: string) => navigate(`/concerts/${sub}`)}
                  onSelectConcert={(concert) => navigate(`/concerts/${concert.id}`)}
                  onDeleteConcert={handleDeleteConcert}
                  onOpenUploadModal={() => setIsUploadConcertOpen(true)}
                />
              }
            />
            <Route
              path="/concerts/venues"
              element={
                <VenuesView
                  venues={venues}
                  onAddVenue={handleAddVenue}
                  onShowToast={(msg) => showToast(msg)}
                />
              }
            />
            <Route
              path="/concerts/artists"
              element={
                <ArtistsView
                  artists={artists}
                  onAddArtist={handleAddArtist}
                  onDeleteArtist={handleDeleteArtist}
                  onShowToast={(msg) => showToast(msg)}
                />
              }
            />
            <Route
              path="/concerts/:concertId"
              element={
                <ConcertDetailScreen
                  concerts={concerts}
                  onStatusChange={handleUpdateConcertStatus}
                  onDeleteConcert={handleDeleteConcert}
                />
              }
            />
            <Route
              path="/concerts/all-concerts/:concertId"
              element={
                <ConcertDetailScreen
                  concerts={concerts}
                  onStatusChange={handleUpdateConcertStatus}
                  onDeleteConcert={handleDeleteConcert}
                />
              }
            />

            {/* Trip Planner Module */}
            <Route path="/trips" element={<Navigate to="/trips/all-trips" replace />} />
            <Route
              path="/trips/all-trips"
              element={
                <TripPlannerDashboard
                  trips={trips}
                  carpoolRides={rides}
                  searchQuery={searchQuery}
                  activeSubTab="all-trips"
                  onSubTabChange={(sub) => navigate(`/trips/${sub}`)}
                  onSelectTrip={setSelectedTrip}
                  onDeleteTrip={handleDeleteTrip}
                  onOpenCreateModal={() => setIsCreateTripOpen(true)}
                />
              }
            />
            <Route
              path="/trips/companions"
              element={
                <TripPlannerDashboard
                  trips={trips}
                  carpoolRides={rides}
                  searchQuery={searchQuery}
                  activeSubTab="companions"
                  onSubTabChange={(sub) => navigate(`/trips/${sub}`)}
                  onSelectTrip={setSelectedTrip}
                  onDeleteTrip={handleDeleteTrip}
                  onOpenCreateModal={() => setIsCreateTripOpen(true)}
                />
              }
            />

            {/* Stranger Meets Module */}
            <Route path="/stranger-meets" element={<Navigate to="/stranger-meets/all-meets" replace />} />
            <Route path="/stranger-meet" element={<Navigate to="/stranger-meets/all-meets" replace />} />
            <Route
              path="/stranger-meets/all-meets"
              element={
                <StrangerMeetDashboard
                  meets={strangerMeets}
                  searchQuery={searchQuery}
                  activeSubTab="all-meets"
                  onSubTabChange={(sub) => navigate(`/stranger-meets/${sub}`)}
                  onSelectMeet={setSelectedStrangerMeet}
                  onDeleteMeet={handleDeleteStrangerMeet}
                  onOpenCreateModal={() => setIsCreateStrangerMeetOpen(true)}
                />
              }
            />
            <Route
              path="/stranger-meets/buddies"
              element={
                <StrangerMeetDashboard
                  meets={strangerMeets}
                  searchQuery={searchQuery}
                  activeSubTab="buddies"
                  onSubTabChange={(sub) => navigate(`/stranger-meets/${sub}`)}
                  onSelectMeet={setSelectedStrangerMeet}
                  onDeleteMeet={handleDeleteStrangerMeet}
                  onOpenCreateModal={() => setIsCreateStrangerMeetOpen(true)}
                />
              }
            />
            <Route path="/stranger-meets/all-trips" element={<Navigate to="/stranger-meets/all-meets" replace />} />
            <Route path="/stranger-meets/companions" element={<Navigate to="/stranger-meets/buddies" replace />} />

            {/* System */}
            <Route
              path="/settings"
              element={
                <SettingsView
                  currentUser={currentUser}
                  onSave={(msg) => showToast(msg)}
                />
              }
            />
            <Route path="/help" element={<HelpView />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Routes>
        </main>
      </div>

      {/* Modals & Dialogs */}
      {/* 1. Publish Carpool Ride */}
      <CreateRideModal
        isOpen={isCreateRideOpen}
        onClose={() => setIsCreateRideOpen(false)}
        drivers={drivers}
        onAddRide={handleAddRide}
      />

      {/* 2. Concert Details */}
      <ConcertDetailModal
        concert={selectedConcert}
        isOpen={!!selectedConcert}
        onClose={() => setSelectedConcert(null)}
        onStatusChange={handleUpdateConcertStatus}
      />

      {/* 3. Upload Concert */}
      <UploadConcertModal
        isOpen={isUploadConcertOpen}
        onClose={() => setIsUploadConcertOpen(false)}
        onAddConcert={handleAddConcert}
      />

      {/* 4. Trip Details */}
      <TripDetailModal
        trip={selectedTrip}
        isOpen={!!selectedTrip}
        onClose={() => setSelectedTrip(null)}
        linkedRide={rides.find(r => r.id === selectedTrip?.linkedCarpoolRideId)}
        onSelectRide={(ride) => {
          setSelectedTrip(null);
          navigate(`/carpooling/rides/${ride.id}`);
        }}
      />

      {/* 5. Create Trip Blueprint */}
      <CreateTripModal
        isOpen={isCreateTripOpen}
        onClose={() => setIsCreateTripOpen(false)}
        carpoolRides={rides}
        onAddTrip={handleAddTrip}
      />

      {/* 6. Stranger Meet Details */}
      <StrangerMeetDetailModal
        meet={selectedStrangerMeet}
        isOpen={!!selectedStrangerMeet}
        onClose={() => setSelectedStrangerMeet(null)}
        onStatusChange={handleUpdateStrangerMeetStatus}
      />

      {/* 7. Create Stranger Meetup */}
      <CreateStrangerMeetModal
        isOpen={isCreateStrangerMeetOpen}
        onClose={() => setIsCreateStrangerMeetOpen(false)}
        onAddMeet={handleAddStrangerMeet}
      />
    </div>
  );
}

export default App;
