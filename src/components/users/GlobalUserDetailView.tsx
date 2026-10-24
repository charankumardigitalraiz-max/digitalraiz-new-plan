import React, { useState } from 'react';
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
  ChevronDown
} from 'lucide-react';
import type { GlobalUser } from '../../types';
import { mockGlobalUsers } from '../../data/mockUsers';
import { MetricCard, Table, type Column } from '../common';

interface GlobalUserDetailViewProps {
  onShowToast?: (message: string) => void;
}

type DetailTab = 'bookings' | 'kyc' | 'financials' | 'reviews';
type BookingModuleFilter = 'all' | 'carpool' | 'concerts' | 'trips' | 'meets';

export const GlobalUserDetailView: React.FC<GlobalUserDetailViewProps> = ({ onShowToast }) => {
  const { userId } = useParams<{ userId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Find user from mock dataset or default to first
  const [currentUser, setCurrentUser] = useState<GlobalUser | undefined>(() => {
    return (
      mockGlobalUsers.find(
        u =>
          u.id === userId ||
          u.id === userId?.replace('drv-0', 'usr-00').replace('drv-', 'usr-') ||
          u.email.toLowerCase() === userId?.toLowerCase()
      ) || mockGlobalUsers[0]
    );
  });

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

  const handleApproveKyc = () => {
    setCurrentUser(prev => prev ? { ...prev, kycStatus: 'verified', status: 'active', trustScore: 99 } : undefined);
    onShowToast?.(`KYC Approved for ${currentUser.name}. Account is now fully verified.`);
  };

  const handleToggleStatus = () => {
    const nextStatus = currentUser.status === 'active' ? 'suspended' : 'active';
    setCurrentUser(prev => prev ? { ...prev, status: nextStatus } : undefined);
    onShowToast?.(`Account status changed to ${nextStatus}.`);
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationMsg.trim()) return;
    setShowNotificationModal(false);
    setNotificationMsg('');
    onShowToast?.(`Direct message sent to ${currentUser.name} (${currentUser.email}).`);
  };

  // Mock cross-module bookings tailored to this user
  const userCarpoolRides = [
    {
      id: 'BK-CP-8910',
      type: 'carpool',
      title: `${currentUser.city} ➔ Pune Central Expressway`,
      origin: `${currentUser.city} Terminal 2`,
      destination: 'Pune Shivaji Nagar',
      date: 'Oct 26, 2026',
      time: '08:30 AM',
      role: currentUser.role === 'driver' ? 'Driver / Host' : 'Passenger',
      seats: currentUser.role === 'driver' ? '3 of 4 Filled' : 'Seat #2A Booked',
      amount: currentUser.role === 'driver' ? '₹1,350 Earned' : '₹450 Paid',
      vehicle: currentUser.vehicleDetails ? `${currentUser.vehicleDetails.model} (${currentUser.vehicleDetails.plate})` : 'Toyota Innova Crysta (MH-12-BF-4412)',
      status: 'Active / Upcoming'
    },
    {
      id: 'BK-CP-7712',
      type: 'carpool',
      title: 'Bengaluru ➔ Mysuru Highway Corridor',
      origin: 'Silk Board Junction',
      destination: 'Mysuru Palace Gate',
      date: 'Oct 18, 2026',
      time: '07:00 AM',
      role: 'Passenger',
      seats: 'Seat #1B',
      amount: '₹380 Paid',
      vehicle: 'Hyundai Creta SX (KA-03-MK-9912)',
      status: 'Completed'
    },
    {
      id: 'BK-CP-6241',
      type: 'carpool',
      title: 'Delhi NCR ➔ Agra Yamuna Expressway',
      origin: 'Noida City Center',
      destination: 'Taj East Gate Road',
      date: 'Sep 29, 2026',
      time: '06:15 AM',
      role: currentUser.role === 'driver' ? 'Driver / Host' : 'Passenger',
      seats: currentUser.role === 'driver' ? '4 of 4 Filled' : 'Seat #3',
      amount: currentUser.role === 'driver' ? '₹2,400 Earned' : '₹600 Paid',
      vehicle: currentUser.vehicleDetails ? `${currentUser.vehicleDetails.model} (${currentUser.vehicleDetails.plate})` : 'Honda City V (DL-01-AX-9921)',
      status: 'Completed'
    }
  ];

  const userConcerts = [
    {
      id: 'BK-CN-4412',
      type: 'concerts',
      title: 'Coldplay: Music of the Spheres World Tour',
      venue: 'DY Patil Sports Stadium, Mumbai',
      date: 'Jan 18, 2027',
      time: '06:00 PM',
      tier: 'VIP Platinum Lounge',
      passes: '2 Tickets',
      amount: '₹14,500 Paid',
      bookingCode: 'COLD-MUM-88192',
      status: 'Confirmed'
    },
    {
      id: 'BK-CN-3391',
      type: 'concerts',
      title: 'Diljit Dosanjh: Dil-Luminati Tour India',
      venue: 'JLN Stadium, New Delhi',
      date: 'Nov 12, 2026',
      time: '07:00 PM',
      tier: 'Gold Standing Zone',
      passes: '1 Ticket',
      amount: '₹5,500 Paid',
      bookingCode: 'DIL-DEL-33911',
      status: 'Confirmed'
    },
    {
      id: 'BK-CN-2018',
      type: 'concerts',
      title: 'Sunburn Goa Festival 2026 Finale',
      venue: 'Vagator Beach Arena, North Goa',
      date: 'Dec 30, 2026',
      time: '04:00 PM',
      tier: 'Early Bird 3-Day Pass',
      passes: '2 Tickets',
      amount: '₹9,800 Paid',
      bookingCode: 'SUN-GOA-20184',
      status: 'Confirmed'
    }
  ];

  const userTrips = [
    {
      id: 'BK-TR-9021',
      type: 'trips',
      title: 'Himachal & Spiti Valley 4x4 Expedition',
      destination: 'Manali, Kaza, Chandratal & Key Monastery',
      date: 'Nov 02 - Nov 09, 2026',
      duration: '7 Days / 6 Nights',
      role: currentUser.role === 'driver' || currentUser.role === 'multi_role' ? 'Expedition Convoy Leader' : 'Confirmed Adventurer',
      companions: '8 Road Companions',
      amount: '₹18,500 Contribution',
      status: 'Upcoming Departure'
    },
    {
      id: 'BK-TR-8102',
      type: 'trips',
      title: 'Coastal Karnataka & Gokarna Beach Haven',
      destination: 'Gokarna, Murudeshwar & Dandeli',
      date: 'Oct 02 - Oct 05, 2026',
      duration: '4 Days / 3 Nights',
      role: 'Co-Traveler',
      companions: '6 Travelers',
      amount: '₹8,200 Contribution',
      status: 'Completed'
    }
  ];

  const userStrangerMeets = [
    {
      id: 'BK-SM-5102',
      type: 'meets',
      title: 'Sunset Photography Walk & Artisan Brews',
      venue: 'Bandra Bandstand Promenade, Mumbai',
      category: 'City Walk & Food',
      date: 'Oct 25, 2026 • 05:00 PM',
      role: currentUser.role === 'host' ? 'Community Host' : 'Confirmed RSVP',
      attendees: '16 Attending',
      status: 'Confirmed'
    },
    {
      id: 'BK-SM-4019',
      type: 'meets',
      title: 'Weekend Board Games & Founders Chai',
      venue: 'Third Wave Coffee, Indiranagar, Bengaluru',
      category: 'Coffee & Chill',
      date: 'Oct 12, 2026 • 04:30 PM',
      role: 'Participant',
      attendees: '12 Attending',
      status: 'Completed'
    }
  ];

  const userTransactions = [
    {
      id: 'TX-990142',
      date: 'Oct 23, 2026',
      module: 'carpool',
      title: 'Carpool Passenger Fare',
      description: 'Mumbai to Pune Seat #2A',
      paymentMethod: 'HDFC UPI (•••• 8912)',
      amount: '+₹450.00',
      isCredit: true,
      status: 'Completed'
    },
    {
      id: 'TX-984102',
      date: 'Oct 18, 2026',
      module: 'concerts',
      title: 'Concert Platinum Pass',
      description: 'Coldplay World Tour (2 Passes)',
      paymentMethod: 'Visa Platinum (•••• 4018)',
      amount: '-₹14,500.00',
      isCredit: false,
      status: 'Completed'
    },
    {
      id: 'TX-970119',
      date: 'Oct 02, 2026',
      module: 'trips',
      title: 'Trip Organizer Escrow Payout',
      description: 'Gokarna Coastal Haven',
      paymentMethod: 'Direct Bank NEFT',
      amount: '+₹18,500.00',
      isCredit: true,
      status: 'Completed'
    },
    {
      id: 'TX-961028',
      date: 'Sep 29, 2026',
      module: 'carpool',
      title: 'Driver Escrow Payout',
      description: 'Delhi NCR to Agra Corridor (4 Seats)',
      paymentMethod: 'Direct Bank IMPS',
      amount: '+₹2,400.00',
      isCredit: true,
      status: 'Completed'
    },
    {
      id: 'TX-948210',
      date: 'Sep 15, 2026',
      module: 'meets',
      title: 'Stranger Meet Host Stipend',
      description: 'Sunset Photography Walk',
      paymentMethod: 'Razorpay UPI (•••• 3391)',
      amount: '+₹1,200.00',
      isCredit: true,
      status: 'Completed'
    }
  ];

  // Combined bookings filtered by sub-category & search query
  const allBookings = [
    ...userCarpoolRides,
    ...userConcerts,
    ...userTrips,
    ...userStrangerMeets
  ].filter(b => {
    // 1. Module filter
    if (bookingFilter === 'carpool' && b.type !== 'carpool') return false;
    if (bookingFilter === 'concerts' && b.type !== 'concerts') return false;
    if (bookingFilter === 'trips' && b.type !== 'trips') return false;
    if (bookingFilter === 'meets' && b.type !== 'meets') return false;

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
      header: 'Module & ID',
      width: '140px',
      render: (item) => {
        const isCarpool = item.type === 'carpool';
        const isConcert = item.type === 'concerts';
        const isTrip = item.type === 'trips';
        const isMeet = item.type === 'meets';

        return (
          <div className="flex items-center gap-2">
            <div
              className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border ${isCarpool
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                : isConcert
                  ? 'bg-purple-50 text-purple-600 border-purple-100'
                  : isTrip
                    ? 'bg-amber-50 text-amber-600 border-amber-100'
                    : 'bg-sky-50 text-sky-600 border-sky-100'
                }`}
            >
              {isCarpool && <Car className="h-3.5 w-3.5" />}
              {isConcert && <Music className="h-3.5 w-3.5" />}
              {isTrip && <MapPin className="h-3.5 w-3.5" />}
              {isMeet && <Sparkles className="h-3.5 w-3.5" />}
            </div>
            <div>
              <span
                className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${isCarpool
                  ? 'bg-emerald-50 text-emerald-700'
                  : isConcert
                    ? 'bg-purple-50 text-purple-700'
                    : isTrip
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-sky-50 text-sky-700'
                  }`}
              >
                {item.type}
              </span>
              <span className="font-mono text-[10px] text-slate-400 font-semibold block mt-0.5">
                {item.id}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'title',
      header: 'Booking & Route / Location',
      render: (item) => {
        const subtext =
          item.type === 'carpool'
            ? `${item.origin} ➔ ${item.destination} • ${item.vehicle}`
            : item.type === 'concerts'
              ? `${item.venue}${item.bookingCode ? ` • Ref: ${item.bookingCode}` : ''}`
              : item.type === 'trips'
                ? `${item.destination} • ${item.duration}`
                : `${item.venue}${item.category ? ` • ${item.category}` : ''}`;

        return (
          <div className="py-0.5">
            <div className="font-semibold text-slate-900 text-xs leading-snug">
              {item.title}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs sm:max-w-sm">
              {subtext}
            </div>
          </div>
        );
      }
    },
    {
      key: 'schedule',
      header: 'Date & Time',
      width: '220px',
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
          {item.duration && (
            <div className="text-[11px] text-amber-700 font-medium mt-0.5">
              {item.duration}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'details',
      header: 'Reservation Details',
      width: '140px',
      render: (item) => {
        if (item.type === 'carpool') {
          return (
            <div className="text-xs">
              <span className="font-medium text-slate-800">{item.seats}</span>
              <span className="text-[11px] text-slate-400 block">{item.role}</span>
            </div>
          );
        }
        if (item.type === 'concerts') {
          return (
            <div className="text-xs">
              <span className="font-medium text-purple-700">{item.tier}</span>
              <span className="text-[11px] text-slate-400 block">{item.passes}</span>
            </div>
          );
        }
        if (item.type === 'trips') {
          return (
            <div className="text-xs">
              <span className="font-medium text-amber-700">{item.companions}</span>
              <span className="text-[11px] text-slate-400 block">{item.role}</span>
            </div>
          );
        }
        return (
          <div className="text-xs">
            <span className="font-medium text-sky-700">{item.attendees}</span>
            <span className="text-[11px] text-slate-400 block">{item.role}</span>
          </div>
        );
      }
    },
    {
      key: 'amount',
      header: 'Amount / Fare',
      width: '110px',
      render: (item) => (
        <span className="font-bold text-slate-900 text-xs">
          {item.amount || 'Free RSVP'}
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
                  <span className="text-slate-400 font-normal">({currentUser.totalActivities})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            {currentUser.kycStatus === 'pending' && (
              <button
                type="button"
                onClick={handleApproveKyc}
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
                ? 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700 border border-slate-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-500'
                }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{currentUser.status === 'active' ? 'Suspend Account' : 'Reactivate Customer'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Key Metrics Cards using MetricCard component */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Spend / Volume"
          value={currentUser.totalSpentOrEarned}
          subtext="Verified platform payments"
          icon={Wallet}
          accentColor="indigo"
        />
        <MetricCard
          label="Carpool Journeys"
          value="148 Rides"
          subtext="Intercity completed journeys"
          icon={Car}
          accentColor="emerald"
        />
        <MetricCard
          label="Concert Passes"
          value="5 Passes"
          subtext="Live events & stadium tours"
          icon={Ticket}
          accentColor="purple"
        />
        <MetricCard
          label="Trips & Meets"
          value="6 Expeditions"
          subtext="Community & travel groups"
          icon={Compass}
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

          <button
            type="button"
            onClick={() => setActiveTab('financials')}
            className={`flex items-center gap-2 py-3.5 border-b-2 text-xs sm:text-[13px] font-semibold transition-all cursor-pointer whitespace-nowrap -mb-px ${activeTab === 'financials'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
          >
            <Wallet className={`h-4 w-4 ${activeTab === 'financials' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Financials & Invoices</span>
          </button>

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
                        All Bookings ({userCarpoolRides.length + userConcerts.length + userTrips.length + userStrangerMeets.length})
                      </option>
                      <option value="carpool">
                        Carpool Rides ({userCarpoolRides.length})
                      </option>
                      <option value="concerts">
                        Concerts & Festivals ({userConcerts.length})
                      </option>
                      <option value="trips">
                        Expeditions & Trips ({userTrips.length})
                      </option>
                      <option value="meets">
                        Stranger Meets ({userStrangerMeets.length})
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
                emptyMessage="No bookings found"
                emptySubtext="This customer does not have any bookings in this module category."
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
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    Verified
                  </span>
                </div>

                <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Document Type</span>
                    <span className="font-semibold text-slate-800">Passport / National Citizen ID</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Document Number</span>
                    <span className="font-mono font-medium text-slate-800">{currentUser.idDocument || 'ID-DOC-889104'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Issuing Authority</span>
                    <span className="font-medium text-slate-800">{currentUser.country} Ministry of Interior</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Biometric Facial Match</span>
                    <span className="font-semibold text-emerald-700">99.4% Match (Passed)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onShowToast?.('Opening encrypted document scan in audit viewer.')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                    <span>View Full Scan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onShowToast?.('Certificate downloaded to local storage.')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    title="Download Verification Proof"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-400" />
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
                      {currentUser.vehicleDetails ? `${currentUser.vehicleDetails.model} (${currentUser.vehicleDetails.color})` : 'Toyota RAV4 Hybrid'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">License Plate</span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {currentUser.vehicleDetails ? currentUser.vehicleDetails.plate : 'MH-01-DW-8819'}
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
          {activeTab === 'financials' && (
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

              {/* Financials Table using shared Table component */}
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
          )}

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

              <div className="space-y-3">
                <div className="rounded-lg bg-slate-50/70 border border-slate-100 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        LM
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-900">Lucas Martin</span>
                        <span className="text-[11px] text-slate-400 block">Carpool Passenger • Paris to Brussels</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>5.0</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    "Super smooth highway drive. The car was spotless, arrived right on time at Porte Maillot, and made great conversation. Would definitely ride again!"
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50/70 border border-slate-100 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                        AR
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-900">Aarav Roy</span>
                        <span className="text-[11px] text-slate-400 block">Concert Companion • Coldplay Mumbai</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>5.0</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    "Extremely reliable organizer! Coordinated the stadium entrance seamlessly and shared shuttle passes with the entire group."
                  </p>
                </div>
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
    </div>
  );
};
