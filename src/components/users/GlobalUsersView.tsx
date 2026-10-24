import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Download,
  LayoutGrid,
  List,
  Star,
  Car,
  Music,
  MapPin,
  Sparkles,
  Compass,
  Phone,
  Mail,
  Eye,
  ChevronDown,
  X,
  CheckCircle2,
  ShieldAlert,
  Calendar,
  Clock,
  BadgeCheck,
  FileText,
  Trash2,
  UserPlus
} from 'lucide-react';
import type { GlobalUser } from '../../types';
import { mockGlobalUsers } from '../../data/mockUsers';
import { Table, type Column, Pagination, MetricCard } from '../common';

interface GlobalUsersViewProps {
  onShowToast?: (message: string) => void;
}

type ModuleFilter = 'all' | 'carpooling' | 'concerts' | 'trips' | 'stranger-meets';
type RoleFilter = 'all' | 'driver' | 'passenger' | 'traveler' | 'concert_goer' | 'host' | 'multi_role';
type KycFilter = 'all' | 'verified' | 'pending' | 'unverified';

export const GlobalUsersView: React.FC<GlobalUsersViewProps> = ({ onShowToast }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<GlobalUser[]>(mockGlobalUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<ModuleFilter>('all');
  const [selectedRole, setSelectedRole] = useState<RoleFilter>('all');
  const [selectedKyc, setSelectedKyc] = useState<KycFilter>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // New User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'Mumbai',
    country: 'India',
    role: 'passenger' as GlobalUser['role'],
    modules: ['carpooling'] as GlobalUser['modules'],
    kycStatus: 'verified' as GlobalUser['kycStatus'],
    vehicleModel: '',
    vehiclePlate: '',
    bio: ''
  });

  // KPI Computations
  const totalUsersCount = users.length;
  const verifiedDriversCount = users.filter(u => (u.role === 'driver' || u.role === 'multi_role') && u.kycStatus === 'verified').length;
  const activePassengersAndAttendees = users.filter(u => u.status === 'active' && u.role !== 'driver').length;
  const pendingKycCount = users.filter(u => u.kycStatus === 'pending').length;

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search matching
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone.toLowerCase().includes(query) ||
        user.city.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query) ||
        (user.vehicleDetails && user.vehicleDetails.plate.toLowerCase().includes(query));

      // Module filter
      const matchesModule =
        selectedModule === 'all' || user.modules.includes(selectedModule);

      // Role filter
      const matchesRole =
        selectedRole === 'all' || user.role === selectedRole;

      // KYC filter
      const matchesKyc =
        selectedKyc === 'all' || user.kycStatus === selectedKyc;

      return matchesSearch && matchesModule && matchesRole && matchesKyc;
    });
  }, [users, searchQuery, selectedModule, selectedRole, selectedKyc]);

  // Actions
  const handleVerifyKyc = (userId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, kycStatus: 'verified', status: 'active', trustScore: 98 } : u))
    );
    onShowToast?.(`User identity verified successfully.`);
  };

  const handleToggleStatus = (userId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const newStatus = u.status === 'active' ? 'suspended' : 'active';
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
    onShowToast?.(`User account status updated.`);
  };

  const handleDeleteUser = (userId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (window.confirm('Are you sure you want to remove this user from the directory?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      onShowToast?.(`User removed from global directory.`);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    const created: GlobalUser = {
      id: `usr-${String(users.length + 1).padStart(3, '0')}`,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone || '+91 98000 00000',
      avatar: `https://images.unsplash.com/photo-${1534528741775 + users.length}?w=150&auto=format&fit=crop&q=80`,
      role: newUser.role,
      modules: newUser.modules.length > 0 ? newUser.modules : ['carpooling'],
      status: 'active',
      kycStatus: newUser.kycStatus,
      city: newUser.city || 'Mumbai',
      country: newUser.country || 'India',
      joinedDate: 'Oct 23, 2026',
      lastActive: 'Just now',
      rating: 5.0,
      totalActivities: 1,
      totalSpentOrEarned: newUser.role === 'driver' ? '₹0 Earned' : '₹0 Spent',
      trustScore: newUser.kycStatus === 'verified' ? 95 : 80,
      vehicleDetails: newUser.vehicleModel ? {
        model: newUser.vehicleModel,
        plate: newUser.vehiclePlate || 'MH-01-NEW',
        color: 'White'
      } : undefined,
      badges: ['New Member'],
      bio: newUser.bio || 'New member of ORBITA global mobility network.'
    };

    setUsers([created, ...users]);
    setIsAddUserModalOpen(false);
    setNewUser({
      name: '',
      email: '',
      phone: '',
      city: 'Mumbai',
      country: 'India',
      role: 'passenger',
      modules: ['carpooling'],
      kycStatus: 'verified',
      vehicleModel: '',
      vehiclePlate: '',
      bio: ''
    });
    onShowToast?.(`New user ${created.name} added to global directory.`);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Modules', 'City', 'KYC Status', 'Rating'];
    const rows = filteredUsers.map(u => [
      u.id,
      `"${u.name}"`,
      u.email,
      u.phone,
      u.role,
      `"${u.modules.join(', ')}"`,
      u.city,
      u.kycStatus,
      u.rating
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orbita_global_users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast?.(`Exported ${filteredUsers.length} user records to CSV.`);
  };

  const getModuleBadge = (mod: string) => {
    switch (mod) {
      case 'carpooling':
        return (
          <span key={mod} className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200/60">
            <Car className="h-2.5 w-2.5" />
            <span>Carpool</span>
          </span>
        );
      case 'concerts':
        return (
          <span key={mod} className="inline-flex items-center gap-1 rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 border border-purple-200/60">
            <Music className="h-2.5 w-2.5" />
            <span>Concerts</span>
          </span>
        );
      case 'trips':
        return (
          <span key={mod} className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-200/60">
            <MapPin className="h-2.5 w-2.5" />
            <span>Trips</span>
          </span>
        );
      case 'stranger-meets':
        return (
          <span key={mod} className="inline-flex items-center gap-1 rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-700 border border-sky-200/60">
            <Sparkles className="h-2.5 w-2.5" />
            <span>Meets</span>
          </span>
        );
      default:
        return null;
    }
  };

  const paginatedGridUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const columns: Column<GlobalUser>[] = useMemo(() => [
    {
      key: 'identity',
      header: 'User Identity',
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
            />
            <span
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white ${user.status === 'active'
                ? 'bg-emerald-500'
                : user.status === 'pending'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
                }`}
            />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
              {user.name}
            </div>
            <div className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
              <span>{user.email}</span>
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {user.phone}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role & Modules',
      render: (user) => (
        <div className="space-y-1.5">
          <span className="inline-block px-2 py-0.5 rounded-md text-[10.5px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
            {user.role.replace('_', ' ')}
          </span>
          <div className="flex items-center gap-1 flex-wrap">
            {user.modules.map((m) => getModuleBadge(m))}
          </div>
        </div>
      )
    },
    {
      key: 'location',
      header: 'Location',
      className: 'whitespace-nowrap',
      render: (user) => (
        <div>
          <div className="font-medium text-slate-800">{user.city}</div>
          <div className="text-[11px] text-slate-400">{user.country}</div>
        </div>
      )
    },
    {
      key: 'kycStatus',
      header: 'KYC Status',
      className: 'whitespace-nowrap',
      render: (user) => (
        <div>
          {user.kycStatus === 'verified' ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/80">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              <span>Verified</span>
            </span>
          ) : user.kycStatus === 'pending' ? (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200/80">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <span>Pending KYC</span>
              </span>
              <button
                type="button"
                onClick={(e) => handleVerifyKyc(user.id, e)}
                className="rounded bg-amber-600 hover:bg-amber-500 text-white px-2 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer"
              >
                Approve
              </button>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200/80">
              <ShieldAlert className="h-3 w-3 text-rose-600" />
              <span>Restricted</span>
            </span>
          )}
        </div>
      )
    },
    {
      key: 'rating',
      header: 'Rating & Trust',
      className: 'whitespace-nowrap',
      render: (user) => (
        <div>
          <div className="flex items-center gap-1 text-slate-800 font-semibold">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{user.rating.toFixed(2)}</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
            {user.trustScore}% Trust Score
          </div>
        </div>
      )
    },
    // {
    //   key: 'activity',
    //   header: 'Activity',
    //   className: 'whitespace-nowrap',
    //   render: (user) => (
    //     <div>
    //       <div className="font-semibold text-slate-800">
    //         {user.totalActivities} Activities
    //       </div>
    //       <div className="text-[11px] text-slate-400">
    //         {user.totalSpentOrEarned}
    //       </div>
    //     </div>
    //   )
    // },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      className: 'whitespace-nowrap',
      render: (user) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => navigate(`/users/${user.id}`)}
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 p-1.5 text-indigo-700 hover:text-indigo-900 transition-colors cursor-pointer"
            title="View User Details & Bookings"
          >
            <Eye className="h-4 w-4" />
          </button>
          {/* <button
            type="button"
            onClick={(e) => handleToggleStatus(user.id, e)}
            className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${user.status === 'active'
              ? 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-800'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
          >
            {user.status === 'active' ? 'Suspend' : 'Activate'}
          </button> */}
          <button
            type="button"
            onClick={(e) => handleDeleteUser(user.id, e)}
            className="rounded-lg p-1.5 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 shadow-2xs transition-all cursor-pointer"
            title="Remove User"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )
    }
  ], [navigate]);

  return (
    <div className="space-y-4">
      {/* 1. Customers Top Banner Card */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-[22px] font-semibold tracking-tight text-slate-900">
              Customers
            </h1>
            <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              Directory
            </span>
          </div>
          <p className="text-[13px] font-normal text-slate-500 mt-0.5 max-w-2xl">
            Manage customer accounts, bookings, driver verifications, and activity across all services.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddUserModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* 2. Global Metric Cards (4 KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Customers"
          value={totalUsersCount.toLocaleString()}
          subtext="Across all services"
          icon={Users}
          accentColor="indigo"
        />

        <MetricCard
          label="Verified Fleet Drivers"
          value={verifiedDriversCount}
          subtext="4.92 Avg Driver Rating"
          icon={Car}
          accentColor="emerald"
        />

        <MetricCard
          label="Active Passengers & Travelers"
          value={activePassengersAndAttendees}
          subtext="96% Identity Verified"
          icon={UserCheck}
          accentColor="purple"
        />

        <div
          onClick={() => setSelectedKyc(selectedKyc === 'pending' ? 'all' : 'pending')}
          className="cursor-pointer transition-transform hover:scale-[1.01]"
        >
          <MetricCard
            label="KYC Review Queue"
            value={`${pendingKycCount} Pending`}
            subtext={selectedKyc === 'pending' ? 'Active Filter: Showing Pending' : 'Click to filter pending'}
            icon={AlertCircle}
            accentColor="amber"
          />
        </div>
      </div>

      {/* 3. Unified Attached Card: Header, Controls & Table / Grid */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
        {/* Card Header: Search & Filter Controls */}
        <div className="px-4 py-4 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white">
          {/* Search Input Bar (Left Side) */}
          <div className="relative w-full xl:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by customer name, email, phone, city..."
              className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/70 pl-9.5 pr-9 py-2 text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                title="Clear Search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Right Controls: Module, Role & Status Filter Dropdowns + View Mode Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Module Filter Dropdown */}
            <div className="relative inline-flex items-center">
              <Compass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <select
                value={selectedModule}
                onChange={(e) => {
                  setSelectedModule(e.target.value as ModuleFilter);
                  setCurrentPage(1);
                }}
                className="appearance-none h-10 rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-9 py-2 text-xs sm:text-[13px] font-medium text-slate-700 outline-none transition-all hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 cursor-pointer shadow-2xs"
              >
                <option value="all">All Modules ({users.length})</option>
                <option value="carpooling">Carpooling</option>
                <option value="concerts">Concerts</option>
                <option value="trips">Trips</option>
                <option value="stranger-meets">Stranger Meets</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Role Filter Dropdown */}
            {/* <div className="relative inline-flex items-center">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value as RoleFilter);
                  setCurrentPage(1);
                }}
                className="appearance-none h-10 rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-9 py-2 text-xs sm:text-[13px] font-medium text-slate-700 outline-none transition-all hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 cursor-pointer shadow-2xs"
              >
                <option value="all">All Roles</option>
                <option value="driver">Drivers</option>
                <option value="passenger">Passengers</option>
                <option value="traveler">Travelers</option>
                <option value="concert_goer">Concert Attendees</option>
                <option value="host">Community Hosts</option>
                <option value="multi_role">Multi-Role</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div> */}

            {/* Status / KYC Filter Dropdown */}
            {/* <div className="relative inline-flex items-center">
              <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <select
                value={selectedKyc}
                onChange={(e) => {
                  setSelectedKyc(e.target.value as KycFilter);
                  setCurrentPage(1);
                }}
                className="appearance-none h-10 rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-9 py-2 text-xs sm:text-[13px] font-medium text-slate-700 outline-none transition-all hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 cursor-pointer shadow-2xs"
              >
                <option value="all">All KYC Statuses</option>
                <option value="verified">KYC Verified</option>
                <option value="pending">KYC Pending Review ({pendingKycCount})</option>
                <option value="unverified">KYC Unverified</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div> */}

            {/* View Mode Toggle */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50/80 p-0.5 h-10 items-center">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`h-8.5 px-2.5 rounded-md transition-all cursor-pointer flex items-center gap-1 text-xs font-medium ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
                  }`}
                title="Table View"
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`h-8.5 px-2.5 rounded-md transition-all cursor-pointer flex items-center gap-1 text-xs font-medium ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
                  }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Card Body: Directly Attached Table or Grid */}
        {viewMode === 'table' ? (
          <Table
            data={filteredUsers}
            columns={columns}
            keyExtractor={(user) => user.id}
            emptyMessage="No users match your criteria"
            emptySubtext="Try adjusting your search query, module filter, or KYC review status."
            emptyIcon={Users}
            // onRowClick={(user) => navigate(`/users/${user.id}`)}
            containerClassName="border-0 rounded-none shadow-none"
            hoverClassName="hover:bg-slate-50/80"
            pagination={{
              currentPage,
              pageSize,
              totalItems: filteredUsers.length,
              onPageChange: setCurrentPage,
              onPageSizeChange: (newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              },
              pageSizeOptions: [5, 10, 20, 50],
              itemName: 'users'
            }}
          />
        ) : (
          <div className="p-4 space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="rounded-lg border border-slate-200/90 bg-white p-12 text-center shadow-2xs space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">No users match your criteria</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Try adjusting your search query, module filter, or KYC review status.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedModule('all');
                    setSelectedRole('all');
                    setSelectedKyc('all');
                    setCurrentPage(1);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 border border-indigo-200 cursor-pointer transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedGridUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => navigate(`/users/${user.id}`)}
                      className="rounded-lg border border-slate-200/90 bg-white p-4 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        {/* Header: Avatar, Name & Status */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="h-11 w-11 rounded-full object-cover ring-1 ring-slate-200"
                            />
                            <div>
                              <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                {user.name}
                              </h4>
                              <p className="text-[11px] text-slate-400">{user.email}</p>
                              <p className="text-[10px] text-slate-400">{user.city}, {user.country}</p>
                            </div>
                          </div>

                          {user.kycStatus === 'verified' ? (
                            <span className="p-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100" title="KYC Verified">
                              <ShieldCheck className="h-4 w-4" />
                            </span>
                          ) : user.kycStatus === 'pending' ? (
                            <span className="p-1 rounded-md bg-amber-50 text-amber-600 border border-amber-200" title="KYC Pending">
                              <AlertCircle className="h-4 w-4" />
                            </span>
                          ) : (
                            <span className="p-1 rounded-md bg-rose-50 text-rose-600 border border-rose-200" title="Restricted">
                              <ShieldAlert className="h-4 w-4" />
                            </span>
                          )}
                        </div>

                        {/* Modules Tags */}
                        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                          {user.modules.map((m) => getModuleBadge(m))}
                        </div>

                        {/* Vehicle Pill if driver */}
                        {user.vehicleDetails && (
                          <div className="mt-2.5 rounded-lg bg-slate-50 border border-slate-100 p-2 text-[11px] text-slate-600 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 truncate">
                              <Car className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span className="font-medium truncate">{user.vehicleDetails.model}</span>
                            </div>
                            <span className="font-mono text-[10px] text-slate-400 font-semibold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {user.vehicleDetails.plate}
                            </span>
                          </div>
                        )}

                        {/* Bio */}
                        {user.bio && (
                          <p className="mt-2.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {user.bio}
                          </p>
                        )}
                      </div>

                      {/* Card Footer: Rating, Trust & Action */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-slate-900">{user.rating.toFixed(2)}</span>
                          <span className="text-[10px] text-slate-400">• {user.trustScore}% Trust</span>
                        </div>

                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Details</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredUsers.length > 0 && (
                  <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
                    <Pagination
                      currentPage={currentPage}
                      totalItems={filteredUsers.length}
                      pageSize={pageSize}
                      onPageChange={setCurrentPage}
                      onPageSizeChange={(newSize) => {
                        setPageSize(newSize);
                        setCurrentPage(1);
                      }}
                      pageSizeOptions={[6, 12, 24, 48]}
                      itemName="users"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* 5. Add New User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Add New Customer</h3>
                  <p className="text-[11px] text-slate-400">Register a new customer, driver, or host account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Nair"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="priya@example.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98200 12345"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Primary Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as GlobalUser['role'] })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="passenger">Passenger</option>
                    <option value="driver">Fleet Driver</option>
                    <option value="traveler">Trip Explorer</option>
                    <option value="concert_goer">Concert VIP</option>
                    <option value="host">Community Host</option>
                    <option value="multi_role">Multi-Role</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Mumbai"
                    value={newUser.city}
                    onChange={(e) => setNewUser({ ...newUser, city: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Driver vehicle inputs if role is driver */}
              {(newUser.role === 'driver' || newUser.role === 'multi_role') && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div className="font-semibold text-slate-800 text-[11px] flex items-center gap-1">
                    <Car className="h-3 w-3 text-emerald-600" />
                    <span>Driver Vehicle Information</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Vehicle (e.g. Honda City)"
                      value={newUser.vehicleModel}
                      onChange={(e) => setNewUser({ ...newUser, vehicleModel: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="License Plate"
                      value={newUser.vehiclePlate}
                      onChange={(e) => setNewUser({ ...newUser, vehiclePlate: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-900 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bio / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Short user bio or admin notes..."
                  value={newUser.bio}
                  onChange={(e) => setNewUser({ ...newUser, bio: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 font-semibold shadow-xs cursor-pointer"
                >
                  Register User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
