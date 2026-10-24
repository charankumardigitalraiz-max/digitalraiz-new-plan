import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  Star,
  Car,
  Music,
  MapPin,
  Sparkles,
  Phone,
  Mail,
  Copy,
  Check,
  Calendar,
  Clock,
  Download,
  CreditCard,
  FileText,
  Trash2,
  CheckCircle2,
  UserCheck,
  ExternalLink,
  Wallet,
  Receipt,
  Ticket,
  Compass,
  QrCode,
  Eye,
  MessageSquare,
  AlertTriangle,
  BadgeCheck,
  Building,
  Info,
  Search,
  X,
  Filter,
  ChevronDown,
  Loader2,
  Edit3
} from 'lucide-react';
import type { GlobalUser } from '../../types';
import { MetricCard, Table, type Column } from '../common';
import { userService, type UserCardCount } from '../../services';

function extractAddress(location: any, fallback: string = ''): string {
  if (!location) return fallback;
  if (typeof location === 'string') return location;
  if (typeof location === 'object') {
    return location.address || location.name || location.city || fallback;
  }
  return fallback;
}

interface GlobalUserDetailViewProps {
  onShowToast?: (message: string) => void;
}

type DetailTab = 'bookings' | 'kyc' | 'financials' | 'reviews';
type BookingModuleFilter = 'all' | 'carpool' | 'published' | 'booked';

export const GlobalUserDetailView: React.FC<GlobalUserDetailViewProps> = ({ onShowToast }) => {
  const { userId } = useParams<{ userId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<GlobalUser | undefined>(undefined);
  const [cardCount, setCardCount] = useState<UserCardCount | undefined>(undefined);
  const [userPublishedRides, setUserPublishedRides] = useState<any[]>([]);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Edit Profile Form State
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'user'
  });
  const [isSubmittingProfile, setIsSubmittingProfile] = useState<boolean>(false);

  // Edit KYC Form State
  const [isEditingKyc, setIsEditingKyc] = useState<boolean>(false);
  const [kycForm, setKycForm] = useState({
    isKYC: true,
    isEmailVerified: true,
    govtIdNumber: '',
    govtIdProof: ''
  });
  const [isSubmittingKyc, setIsSubmittingKyc] = useState<boolean>(false);

  // Fetch user details from API
  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    setIsLoading(true);

    userService
      .getUserById(userId)
      .then((res) => {
        if (!isMounted) return;
        if (res?.user) {
          setCurrentUser(res.user);
          setCardCount(res.cardCount);
          setUserPublishedRides(res.publishedRides || []);
          setUserBookings(res.bookings || []);
          setEditForm({
            name: res.user.name,
            phone: res.user.phone,
            email: res.user.email,
            role: res.user.role || 'user'
          });
          setKycForm({
            isKYC: Boolean(res.user.isKYC || res.user.kycStatus === 'verified'),
            isEmailVerified: Boolean(res.user.isEmailVerified),
            govtIdNumber: res.user.govtIdNumber || res.user.idDocument || '',
            govtIdProof: res.user.govtIdProof || ''
          });
        }
      })
      .catch((err) => {
        console.warn('Failed to load user details:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const tabParam = searchParams.get('tab') as DetailTab | null;
  const [activeTab, setActiveTab] = useState<DetailTab>(() => {
    if (tabParam && ['bookings', 'kyc', 'financials', 'reviews'].includes(tabParam)) {
      return tabParam;
    }
    return 'bookings';
  });
  const [bookingFilter, setBookingFilter] = useState<BookingModuleFilter>('all');
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingPageSize, setBookingPageSize] = useState(10);
  const [financialPage, setFinancialPage] = useState(1);
  const [financialPageSize, setFinancialPageSize] = useState(10);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200/90 bg-white p-16 text-center shadow-2xs space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">Loading Customer Profile</h3>
        <p className="text-xs text-slate-400">Fetching customer account records, bookings and verifications...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/users')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Customers</span>
        </button>

        <div className="rounded-xl border border-slate-200/90 bg-white p-12 text-center shadow-2xs space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Customer Profile Not Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            The customer identifier "{userId}" does not match any registered account.
          </p>
          <button
            onClick={() => navigate('/users')}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 cursor-pointer transition-all"
          >
            Return to Customers
          </button>
        </div>
      </div>
    );
  }

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
    onShowToast?.(`Copied ${fieldName} to clipboard`);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmittingProfile(true);
    try {
      const updated = await userService.updateUser(currentUser.id, {
        name: editForm.name,
        phone: editForm.phone,
        email: editForm.email,
        role: editForm.role
      });
      setCurrentUser((prev) => (prev ? { ...prev, ...updated } : updated));
      setIsEditingProfile(false);
      onShowToast?.('Customer profile updated successfully.');
    } catch (err: any) {
      onShowToast?.(err.message || 'Failed to update profile.');
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleUpdateKyc = async (isApproved: boolean) => {
    if (!currentUser) return;
    try {
      await userService.updateUserKyc(currentUser.id, {
        isKYC: isApproved,
        isEmailVerified: isApproved ? true : kycForm.isEmailVerified,
        govtIdNumber: kycForm.govtIdNumber,
        govtIdProof: kycForm.govtIdProof
      });
      setCurrentUser((prev) =>
        prev
          ? {
            ...prev,
            isKYC: isApproved,
            kycStatus: isApproved ? 'verified' : 'rejected',
            isEmailVerified: isApproved ? true : prev.isEmailVerified,
            trustScore: isApproved ? 99 : 70
          }
          : undefined
      );
      onShowToast?.(
        isApproved
          ? `KYC Approved for ${currentUser.name}. Account is now fully verified.`
          : `KYC rejected for ${currentUser.name}.`
      );
    } catch (err: any) {
      onShowToast?.(err.message || 'Failed to update KYC status.');
    }
  };

  const handleSaveKycDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmittingKyc(true);
    try {
      await userService.updateUserKyc(currentUser.id, kycForm);
      setCurrentUser((prev) =>
        prev
          ? {
            ...prev,
            isKYC: kycForm.isKYC,
            kycStatus: kycForm.isKYC ? 'verified' : 'pending',
            isEmailVerified: kycForm.isEmailVerified,
            govtIdNumber: kycForm.govtIdNumber,
            govtIdProof: kycForm.govtIdProof
          }
          : undefined
      );
      setIsEditingKyc(false);
      onShowToast?.('KYC verification status & document updated successfully.');
    } catch (err: any) {
      onShowToast?.(err.message || 'Failed to update KYC documentation.');
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!currentUser) return;
    const nextStatus = currentUser.status === 'active' ? 'suspended' : 'active';
    try {
      await userService.updateUser(currentUser.id, { status: nextStatus });
      setCurrentUser((prev) => (prev ? { ...prev, status: nextStatus } : undefined));
      onShowToast?.(`Customer account status changed to ${nextStatus}.`);
    } catch (err: any) {
      onShowToast?.(err.message || 'Failed to update account status.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    if (
      window.confirm(
        `Are you sure you want to permanently delete user account '${currentUser.name}'? This action cannot be undone.`
      )
    ) {
      try {
        const res = await userService.deleteUser(currentUser.id);
        onShowToast?.(res.message || `Customer account deleted successfully.`);
        navigate('/users');
      } catch (err: any) {
        onShowToast?.(err.message || 'Failed to delete customer account.');
      }
    }
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationMsg.trim()) return;
    setShowNotificationModal(false);
    setNotificationMsg('');
    onShowToast?.(`Direct message sent to ${currentUser.name} (${currentUser.email}).`);
  };

  // Dynamic carpool rides & bookings mapped directly from backend /api/admin/users/:id response
  const apiPublishedRides = userPublishedRides.map((ride: any, idx: number) => {
    const originStr = extractAddress(ride.origin, 'Origin');
    const destStr = extractAddress(ride.destination, 'Destination');
    const departure = ride.departureTime ? new Date(ride.departureTime) : null;
    const vehicleInfo = ride.vehicleModel
      ? `${ride.vehicleModel}${ride.vehicleNumber ? ` (${ride.vehicleNumber})` : (ride.vehiclePlate ? ` (${ride.vehiclePlate})` : '')}`
      : (currentUser.vehicleDetails
        ? `${currentUser.vehicleDetails.model} (${currentUser.vehicleDetails.plate})`
        : 'Carpool Vehicle');

    const seatsInfo = ride.totalSeats !== undefined
      ? `${ride.availableSeats ?? 0}/${ride.totalSeats} seats`
      : `${ride.availableSeats ?? ride.seats ?? 0} seats`;

    return {
      id: String(ride.id || ride.rideId || `RD-${idx + 1}`),
      type: 'carpool',
      title: `${originStr} ➔ ${destStr}`,
      origin: originStr,
      destination: destStr,
      date: departure && !isNaN(departure.getTime())
        ? new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }).format(departure)
        : (ride.departureDate || 'Scheduled'),
      time: departure && !isNaN(departure.getTime())
        ? new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }).format(departure)
        : 'Flexible',
      role: 'Driver / Publisher',
      seats: seatsInfo,
      amount: ride.pricePerSeat !== undefined ? `₹${ride.pricePerSeat} / seat` : (ride.fare ? `₹${ride.fare}` : '₹0'),
      vehicle: vehicleInfo,
      status: ride.status ? (ride.status.charAt(0).toUpperCase() + ride.status.slice(1)) : 'Active'
    };
  });

  const apiBookedRides = userBookings.map((bk: any, idx: number) => {
    const originStr = extractAddress(bk.pickupLocation || bk.origin || bk.ride?.origin, 'Pickup Point');
    const destStr = extractAddress(bk.dropLocation || bk.destination || bk.ride?.destination, 'Drop Point');
    const bkDate = bk.createdAt ? new Date(bk.createdAt) : null;
    const seatsCount = bk.seatsBooked || bk.seats || 1;

    return {
      id: String(bk.id || bk.bookingId || `BK-${idx + 1}`),
      type: 'carpool',
      title: `${originStr} ➔ ${destStr}`,
      origin: originStr,
      destination: destStr,
      date: bkDate && !isNaN(bkDate.getTime())
        ? new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }).format(bkDate)
        : 'Recent',
      time: bkDate && !isNaN(bkDate.getTime())
        ? new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }).format(bkDate)
        : 'Booked',
      role: 'Passenger',
      seats: `${seatsCount} Seat${seatsCount > 1 ? 's' : ''}`,
      amount: bk.totalAmount !== undefined ? `₹${bk.totalAmount} Paid` : (bk.fare ? `₹${bk.fare} Paid` : 'Paid'),
      vehicle: bk.vehicle || bk.ride?.vehicleModel || 'Carpool Vehicle',
      status: bk.status ? (bk.status.charAt(0).toUpperCase() + bk.status.slice(1)) : 'Confirmed'
    };
  });

  // Purely dynamic bookings & published rides from backend API
  const allBookings = [
    ...apiPublishedRides,
    ...apiBookedRides
  ].filter(b => {
    // 1. Role / Type filter
    if (bookingFilter === 'published' && b.role !== 'Driver / Publisher') return false;
    if (bookingFilter === 'booked' && b.role !== 'Passenger') return false;

    // 2. Search query filter
    if (bookingSearchQuery.trim()) {
      const q = bookingSearchQuery.toLowerCase().trim();
      const matchId = b.id.toLowerCase().includes(q);
      const matchTitle = b.title.toLowerCase().includes(q);
      const matchStatus = b.status.toLowerCase().includes(q);
      const matchDate = (b as any).date?.toLowerCase().includes(q);
      const matchVenue = (b as any).venue?.toLowerCase().includes(q);
      const matchOrigin = (b as any).origin?.toLowerCase().includes(q);
      const matchDestination = (b as any).destination?.toLowerCase().includes(q);
      const matchVehicle = (b as any).vehicle?.toLowerCase().includes(q);
      const matchAmount = (b as any).amount?.toLowerCase().includes(q);

      return (
        matchId ||
        matchTitle ||
        matchStatus ||
        matchDate ||
        matchVenue ||
        matchOrigin ||
        matchDestination ||
        matchVehicle ||
        matchAmount
      );
    }

    return true;
  });

  const bookingColumns: Column<any>[] = [
    {
      key: 'type',
      header: 'Type & Reference',
      width: '160px',
      render: (item) => {
        const isDriver = item.role.includes('Driver');
        const shortId = item.id.length > 10 ? `#${item.id.slice(-6).toUpperCase()}` : item.id;
        return (
          <div className="flex items-center gap-2.5">
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${
                isDriver
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-300 shadow-2xs'
                  : 'bg-indigo-100 text-indigo-700 border-indigo-300 shadow-2xs'
              }`}
            >
              {isDriver ? <Car className="h-4 w-4" /> : <Ticket className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-2xs ${
                  isDriver
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-indigo-50 text-indigo-800 border-indigo-300'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                    isDriver ? 'bg-emerald-600' : 'bg-indigo-600'
                  }`}
                />
                {isDriver ? 'Published' : 'Booking'}
              </span>
              <span
                className="font-mono text-[11px] font-semibold text-slate-600 block mt-0.5 tracking-tight truncate cursor-default"
                title={item.id}
              >
                {shortId}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'title',
      header: 'Route & Transit Details',
      render: (item) => (
        <div className="py-0.5">
          <div className="font-semibold text-slate-900 text-xs leading-snug">
            {item.title}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs sm:max-w-sm">
            {item.origin} ➔ {item.destination} • {item.vehicle}
          </div>
        </div>
      )
    },
    {
      key: 'schedule',
      header: 'Date & Time',
      width: '180px',
      className: 'whitespace-nowrap',
      headerClassName: 'whitespace-nowrap',
      render: (item) => (
        <div className="whitespace-nowrap">
          <div className="font-medium text-slate-800 text-xs">
            {item.date}
          </div>
          {item.time && (
            <div className="text-[11px] text-slate-400 mt-0.5">
              {item.time}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'details',
      header: 'Seat Allocation',
      width: '160px',
      render: (item) => (
        <div className="text-xs">
          <span className="font-medium text-slate-800">{item.seats}</span>
          <span className="text-[11px] text-slate-400 block">{item.role}</span>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Fare / Amount',
      width: '120px',
      render: (item) => (
        <span className="font-bold text-slate-900 text-xs">
          {item.amount}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: '130px',
      render: (item) => {
        const isUpcoming =
          item.status.includes('Active') ||
          item.status.includes('Upcoming') ||
          item.status.includes('Confirmed');

        return (
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${isUpcoming
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                : 'bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
          >
            {item.status}
          </span>
        );
      }
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      width: '100px',
      render: (item) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onShowToast?.(`Viewing manifest receipt for ${item.id}`);
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-indigo-200/80 transition-all cursor-pointer"
        >
          <Receipt className="h-3.5 w-3.5" />
          <span>Receipt</span>
        </button>
      )
    }
  ];

  const financialColumns: Column<any>[] = [
    {
      key: 'id',
      header: 'Transaction ID',
      width: '140px',
      render: (item) => (
        <span className="font-mono text-[11px] font-semibold text-slate-900">
          {item.id}
        </span>
      )
    },
    {
      key: 'date',
      header: 'Date',
      width: '130px',
      className: 'whitespace-nowrap',
      headerClassName: 'whitespace-nowrap',
      render: (item) => (
        <span className="text-slate-600 font-medium text-xs">
          {item.date}
        </span>
      )
    },
    {
      key: 'description',
      header: 'Module & Description',
      render: (item) => (
        <div className="py-0.5">
          <span className="font-semibold text-slate-800 text-xs block">
            {item.title}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {item.description}
          </span>
        </div>
      )
    },
    {
      key: 'paymentMethod',
      header: 'Payment Method',
      width: '200px',
      className: 'whitespace-nowrap',
      headerClassName: 'whitespace-nowrap',
      render: (item) => (
        <span className="text-slate-600 text-xs font-medium">
          {item.paymentMethod}
        </span>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      width: '140px',
      render: (item) => (
        <span
          className={`font-bold text-xs ${item.isCredit ? 'text-emerald-700' : 'text-slate-900'
            }`}
        >
          {item.amount}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      width: '110px',
      render: (item) => (
        <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap">
          {item.status}
        </span>
      )
    },
    {
      key: 'receipt',
      header: 'Receipt',
      align: 'right',
      width: '100px',
      render: (item) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onShowToast?.(`Downloading tax receipt PDF for ${item.id}`);
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
        >
          <FileText className="h-3.5 w-3.5" />
          <span>PDF</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* 1. Breadcrumb & Back Navigation Card */}
      <div className="rounded-xl border border-slate-200/90 bg-white px-4 py-3 sm:px-5 sm:py-3.5 shadow-2xs flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Customers</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          {/* <Link to="/overview" className="hover:text-slate-600 transition-colors">Overview</Link>
          <span className="text-slate-300">/</span>
          <Link to="/users" className="hover:text-slate-600 transition-colors">Customers</Link>
          <span className="text-slate-300">/</span> */}
          <span className="font-semibold text-slate-800">{currentUser.name}</span>
        </div>
      </div>

      {/* 2. Customer Profile Header Card */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Customer Avatar & Details */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-14 w-14 rounded-xl object-cover ring-1 ring-slate-200/80 shadow-2xs"
              />
              <span
                className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full ring-2 ring-white ${currentUser.status === 'active'
                  ? 'bg-emerald-500'
                  : currentUser.status === 'pending'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                  }`}
                title={`Status: ${currentUser.status}`}
              />
            </div>

            <div className="space-y-3">
              {/* Name, ID, Status Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  {currentUser.name}
                </h1>
                <span className="font-mono text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200/80">
                  {currentUser.id}
                </span>

                {currentUser.kycStatus === 'verified' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    <span>KYC Verified</span>
                  </span>
                ) : currentUser.kycStatus === 'pending' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                    <AlertCircle className="h-3 w-3 text-amber-600" />
                    <span>KYC Pending</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200">
                    <ShieldAlert className="h-3 w-3 text-rose-600" />
                    <span>Restricted</span>
                  </span>
                )}

                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${currentUser.status === 'active'
                  ? 'bg-slate-100 text-slate-700 border border-slate-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                  {currentUser.status}
                </span>
              </div>

              {/* Contact Information & Rating */}
              <div className="flex items-center gap-5 text-xs text-slate-500 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>{currentUser.email}</span>
                  <button
                    onClick={() => handleCopy(currentUser.email, 'Email')}
                    className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title="Copy Email"
                  >
                    {copiedField === 'Email' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{currentUser.phone}</span>
                  <button
                    onClick={() => handleCopy(currentUser.phone, 'Phone')}
                    className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title="Copy Phone"
                  >
                    {copiedField === 'Phone' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>

                <div className="flex items-center gap-1 text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{currentUser.city}, {currentUser.country}</span>
                </div>

                <div className="flex items-center gap-1 font-medium text-slate-700">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span>{currentUser.rating.toFixed(2)}</span>
                  <span className="text-slate-400 font-normal">({cardCount?.totalActivities ?? (userPublishedRides.length + userBookings.length)} total)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => setIsEditingProfile(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5 text-slate-500" />
              <span>Edit Profile</span>
            </button>

            {(!currentUser.isKYC || currentUser.kycStatus === 'pending') && (
              <button
                type="button"
                onClick={() => handleUpdateKyc(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-all cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Approve KYC</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleToggleStatus}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all cursor-pointer ${currentUser.status === 'active'
                ? 'bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-800 border border-slate-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-500'
                }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{currentUser.status === 'active' ? 'Suspend Account' : 'Reactivate Customer'}</span>
            </button>

            <button
              type="button"
              onClick={handleDeleteAccount}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-600 hover:text-white px-2.5 py-1.5 text-xs font-semibold text-rose-700 shadow-2xs transition-all cursor-pointer"
              title="Delete Account Permanently"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Key Metrics Cards using MetricCard component */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Spend / Volume"
          value={
            cardCount?.totalSpent !== undefined
              ? `₹${cardCount.totalSpent}`
              : (userBookings.length > 0 || userPublishedRides.length > 0
                ? (currentUser.totalSpentOrEarned || '₹0')
                : '₹0')
          }
          subtext="Verified platform payments"
          icon={Wallet}
          accentColor="indigo"
        />
        <MetricCard
          label="Published Rides"
          value={`${cardCount?.totalRidesPublished ?? userPublishedRides.length} Rides`}
          subtext={
            cardCount
              ? `${cardCount.activeRides ?? 0} Active • ${cardCount.completedRides ?? 0} Done`
              : 'Driver offered routes'
          }
          icon={Car}
          accentColor="emerald"
        />
        <MetricCard
          label="Passenger Bookings"
          value={`${cardCount?.totalBookings ?? userBookings.length} Bookings`}
          subtext={
            cardCount
              ? `${cardCount.confirmedBookings ?? 0} Confirmed • ${cardCount.completedBookings ?? 0} Done`
              : 'Confirmed seat reservations'
          }
          icon={Ticket}
          accentColor="purple"
        />
        <MetricCard
          label="Trust Score"
          value={`${currentUser.trustScore}% Verified`}
          subtext={currentUser.isKYC || currentUser.kycStatus === 'verified' ? 'Fully verified KYC' : 'Pending verification'}
          icon={ShieldCheck}
          accentColor="amber"
        />
      </div>

      {/* 4. Tab Navigation Bar */}
      <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="px-4 sm:px-6 flex items-center gap-6 sm:gap-8 overflow-x-auto border-b border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 py-3.5 border-b-2 text-xs sm:text-[13px] font-semibold transition-all cursor-pointer whitespace-nowrap -mb-px ${activeTab === 'bookings'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
          >
            <Calendar className={`h-4 w-4 ${activeTab === 'bookings' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>All Bookings & Dispatches</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${activeTab === 'bookings'
                ? 'bg-indigo-50 text-indigo-700'
                : 'bg-slate-100 text-slate-500'
                }`}
            >
              {allBookings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kyc')}
            className={`flex items-center gap-2 py-3.5 border-b-2 text-xs sm:text-[13px] font-semibold transition-all cursor-pointer whitespace-nowrap -mb-px ${activeTab === 'kyc'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
          >
            <ShieldCheck className={`h-4 w-4 ${activeTab === 'kyc' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>KYC & Document Verification</span>
          </button>

          {/* <button
            type="button"
            onClick={() => setActiveTab('financials')}
            className={`flex items-center gap-2 py-3.5 border-b-2 text-xs sm:text-[13px] font-semibold transition-all cursor-pointer whitespace-nowrap -mb-px ${activeTab === 'financials'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
          >
            <Wallet className={`h-4 w-4 ${activeTab === 'financials' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Financials & Invoices</span>
          </button> */}

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-2 py-3.5 border-b-2 text-xs sm:text-[13px] font-semibold transition-all cursor-pointer whitespace-nowrap -mb-px ${activeTab === 'reviews'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
          >
            <Star className={`h-4 w-4 ${activeTab === 'reviews' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Ratings & Community Feedback</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-5 sm:p-6">
          {/* 5. TAB 1: ALL BOOKINGS & ACTIVITY */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              {/* Search Box on Left & Module Dropdown on Right */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Left: Search Box */}
                <div className="relative flex-1 max-w-md w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={bookingSearchQuery}
                    onChange={(e) => {
                      setBookingSearchQuery(e.target.value);
                      setBookingPage(1);
                    }}
                    placeholder="Search bookings by ID, route, venue, vehicle, date..."
                    className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/70 pl-9.5 pr-8 py-2 text-xs sm:text-[13px] font-normal text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-colors shadow-2xs"
                  />
                  {bookingSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setBookingSearchQuery('');
                        setBookingPage(1);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      title="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Right: Dropdown for Booking Module Filter */}
                <div className="flex items-center gap-2">
                  <div className="relative inline-flex items-center">
                    <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    <select
                      value={bookingFilter}
                      onChange={(e) => {
                        setBookingFilter(e.target.value as BookingModuleFilter);
                        setBookingPage(1);
                      }}
                      className="appearance-none h-10 rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-9 py-2 text-xs sm:text-[13px] font-medium text-slate-700 outline-none transition-all hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 cursor-pointer shadow-2xs"
                    >
                      <option value="all">
                        All Records ({apiPublishedRides.length + apiBookedRides.length})
                      </option>
                      <option value="published">
                        Published Rides ({apiPublishedRides.length})
                      </option>
                      <option value="booked">
                        Passenger Bookings ({apiBookedRides.length})
                      </option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Bookings Data Table */}
              <Table
                data={allBookings}
                columns={bookingColumns}
                keyExtractor={(item) => item.id}
                emptyMessage="No rides or bookings found"
                emptySubtext="This customer has not published any rides or booked any journeys yet."
                emptyIcon={Calendar}
                hoverClassName="hover:bg-slate-50/70"
                pagination={{
                  currentPage: bookingPage,
                  pageSize: bookingPageSize,
                  totalItems: allBookings.length,
                  onPageChange: setBookingPage,
                  onPageSizeChange: (newSize) => {
                    setBookingPageSize(newSize);
                    setBookingPage(1);
                  },
                  pageSizeOptions: [5, 10, 20],
                  itemName: 'bookings'
                }}
              />
            </div>
          )}

          {/* 6. TAB 2: KYC & COMPLIANCE DOCUMENTS */}
          {activeTab === 'kyc' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Identity Document Card */}
              <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Government Identity Record</h3>
                      <p className="text-[11px] text-slate-400">National ID, Aadhaar or Passport verification</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${currentUser.isKYC || currentUser.kycStatus === 'verified'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                    {currentUser.isKYC || currentUser.kycStatus === 'verified' ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>

                <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">ID Number / Code</span>
                    <span className="font-mono font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {currentUser.govtIdNumber || currentUser.idDocument || 'Not provided'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Proof Document</span>
                    <span className="font-mono text-[11px] text-slate-600 truncate max-w-[200px]" title={currentUser.govtIdProof || currentUser.idDocument || 'No document uploaded'}>
                      {currentUser.govtIdProof || currentUser.idDocument || 'No document uploaded'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Email Verification</span>
                    <span className={`font-semibold ${currentUser.isEmailVerified ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {currentUser.isEmailVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Trust Score</span>
                    <span className="font-semibold text-emerald-700">{currentUser.trustScore}% Verified</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {(!currentUser.isKYC || currentUser.kycStatus !== 'verified') ? (
                    <button
                      type="button"
                      onClick={() => handleUpdateKyc(true)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white py-2 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Approve & Verify KYC</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUpdateKyc(false)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-2 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <span>Revoke KYC</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsEditingKyc(true)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                    <span>Update KYC Info</span>
                  </button>
                </div>
              </div>

              {/* Driving License & Fleet Card */}
              <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <Car className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Driving License & Fleet Credentials</h3>
                      <p className="text-[11px] text-slate-400">Motor vehicle operator authorization</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    Active Commercial / LMV
                  </span>
                </div>

                <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">License Authority</span>
                    <span className="font-semibold text-slate-800">{currentUser.country} RTO Fleet Registry</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Registered Vehicle</span>
                    <span className="font-medium text-slate-800">
                      {currentUser.vehicleDetails ? `${currentUser.vehicleDetails.model} (${currentUser.vehicleDetails.color})` : 'No vehicle registered'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">License Plate</span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {currentUser.vehicleDetails ? currentUser.vehicleDetails.plate : 'Not available'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Road Safety Record</span>
                    <span className="font-semibold text-emerald-700">0 Violations • Clean Record</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onShowToast?.('Driving license scanned copy verified.')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                    <span>Audit License Scan</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 7. TAB 3: FINANCIALS & INVOICES */}
          {/* {activeTab === 'financials' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Enterprise Transaction Ledger</h3>
                  <p className="text-[11px] text-slate-400">Itemized carpool payouts, ticket purchases & platform fees</p>
                </div>
                <button
                  type="button"
                  onClick={() => onShowToast?.('Exporting financial ledger as CSV.')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Download className="h-3.5 w-3.5 text-slate-500" />
                  <span>Download Tax Statement</span>
                </button>
              </div>

             
              <Table
                data={userTransactions}
                columns={financialColumns}
                keyExtractor={(item) => item.id}
                emptyMessage="No transactions found"
                emptySubtext="This customer has no recorded financial transactions yet."
                emptyIcon={Wallet}
                hoverClassName="hover:bg-slate-50/70"
                pagination={{
                  currentPage: financialPage,
                  pageSize: financialPageSize,
                  totalItems: userTransactions.length,
                  onPageChange: setFinancialPage,
                  onPageSizeChange: (newSize) => {
                    setFinancialPageSize(newSize);
                    setFinancialPage(1);
                  },
                  pageSizeOptions: [5, 10, 20],
                  itemName: 'transactions'
                }}
              />
            </div>
          )} */}

          {/* 8. TAB 4: REVIEWS & COMMUNITY FEEDBACK */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Verified Peer Ratings & Reviews</h3>
                  <p className="text-[11px] text-slate-400">Reviews submitted by fellow passengers, co-travelers and event attendees</p>
                </div>
                <div className="flex items-center gap-1.5 text-amber-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/80">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-slate-900">{currentUser.rating.toFixed(2)}</span>
                  <span className="text-xs text-slate-400 font-normal">/ 5.0 Rating</span>
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center space-y-2">
                <Star className="h-8 w-8 text-slate-300 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-700">No Reviews Recorded</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  This customer has not received any reviews or ratings from fellow travelers yet.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 9. Direct Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-900">Send Direct Notification</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNotificationModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Recipient
                </label>
                <input
                  type="text"
                  disabled
                  value={`${currentUser.name} (${currentUser.email})`}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Message Body
                </label>
                <textarea
                  required
                  rows={4}
                  value={notificationMsg}
                  onChange={(e) => setNotificationMsg(e.target.value)}
                  placeholder="Enter important operational update, KYC audit question, or account notification..."
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNotificationModal(false)}
                  className="rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-all cursor-pointer"
                >
                  Send Transmission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Edit3 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Edit Customer Profile</h3>
                  <p className="text-[11px] text-slate-400">Update customer personal details & directory role</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none bg-white"
                >
                  <option value="user">User / Member</option>
                  <option value="driver">Fleet Driver</option>
                  <option value="admin">Administrator</option>
                  <option value="passenger">Passenger</option>
                  <option value="traveler">Trip Explorer</option>
                  <option value="concert_goer">Concert VIP</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  disabled={isSubmittingProfile}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingProfile && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{isSubmittingProfile ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit KYC Details Modal */}
      {isEditingKyc && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Update KYC & Verification</h3>
                  <p className="text-[11px] text-slate-400">Update govt ID document number & verification compliance</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingKyc(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveKycDetails} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Government ID Number (Aadhaar / PAN)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AADHAAR-8932-1245-7890"
                  value={kycForm.govtIdNumber}
                  onChange={(e) => setKycForm({ ...kycForm, govtIdNumber: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Proof File Path / URL</label>
                <input
                  type="text"
                  placeholder="e.g. /uploads/kyc/user_1_proof.jpg"
                  value={kycForm.govtIdProof}
                  onChange={(e) => setKycForm({ ...kycForm, govtIdProof: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-2">
                <label className="flex items-center gap-2 text-slate-700 text-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={kycForm.isKYC}
                    onChange={(e) => setKycForm({ ...kycForm, isKYC: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-slate-800">Identity Verified (isKYC: true)</span>
                </label>

                <label className="flex items-center gap-2 text-slate-700 text-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={kycForm.isEmailVerified}
                    onChange={(e) => setKycForm({ ...kycForm, isEmailVerified: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Email Address Verified</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingKyc(false)}
                  disabled={isSubmittingKyc}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingKyc}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingKyc && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{isSubmittingKyc ? 'Updating...' : 'Update KYC Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
