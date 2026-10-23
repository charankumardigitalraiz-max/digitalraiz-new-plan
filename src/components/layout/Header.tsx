import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  LogOut,
  User,
  Users,
  Shield,
  Check,
  Calendar,
  Clock,
  LayoutDashboard,
  Car,
  Music,
  MapPin,
  Sparkles,
  ShieldCheck,
  Settings,
  HelpCircle,
  Route as RouteIcon,
  Layers,
  ArrowRight,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import type { NavigationTab } from '../../types';
import type { AdminUser } from '../auth/Login';
import { EmergencySosModal } from '../common/EmergencySosModal';

interface HeaderProps {
  activeTab: NavigationTab;
  activeSubTab?: string;
  onOpenCreateModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentUser?: AdminUser | null;
  onLogout?: () => void;
}

interface ModuleOption {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
  description: string;
  accent: string;
}

const MODULE_OPTIONS: ModuleOption[] = [
  {
    id: 'overview',
    label: 'Overview',
    path: '/overview',
    icon: LayoutDashboard,
    description: 'Global ecosystem overview & analytics',
    accent: 'text-indigo-600 bg-indigo-50 border-indigo-200/80'
  },
  {
    id: 'users',
    label: 'Customers',
    path: '/users',
    icon: Users,
    description: 'Customer profiles, KYC verification & activity across services',
    accent: 'text-blue-600 bg-blue-50 border-blue-200/80'
  },
  {
    id: 'carpooling',
    label: 'Carpooling',
    path: '/carpooling/overview',
    icon: Car,
    description: 'Carpooling intelligence & fleet overview',
    accent: 'text-emerald-600 bg-emerald-50 border-emerald-200/80'
  },
  {
    id: 'concerts',
    label: 'Concerts & Events',
    path: '/concerts/all-concerts',
    icon: Music,
    description: 'Stadium live shows & tours overview',
    accent: 'text-purple-600 bg-purple-50 border-purple-200/80'
  },
  {
    id: 'trips',
    label: 'Trip Planner',
    path: '/trips/all-trips',
    icon: MapPin,
    description: 'Travel itineraries & buddy expeditions',
    accent: 'text-amber-600 bg-amber-50 border-amber-200/80'
  },
  {
    id: 'stranger-meets',
    label: 'Stranger Meets',
    path: '/stranger-meets/all-meets',
    icon: Sparkles,
    description: 'Community icebreakers & meetups overview',
    accent: 'text-sky-600 bg-sky-50 border-sky-200/80'
  }
];

export const Header: React.FC<HeaderProps> = ({
  activeTab: _activeTab,
  activeSubTab: _activeSubTab,
  onOpenCreateModal: _onOpenCreateModal,
  searchQuery: _searchQuery,
  onSearchChange: _onSearchChange,
  currentUser,
  onLogout
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isModuleMenuOpen, setIsModuleMenuOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const moduleMenuRef = useRef<HTMLDivElement>(null);

  // Live Date and Time State
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentDateTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = currentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (moduleMenuRef.current && !moduleMenuRef.current.contains(event.target as Node)) {
        setIsModuleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Detect currently active module from pathname
  const currentPath = location.pathname;
  const activeModule = MODULE_OPTIONS.find(m => {
    if (m.id === 'overview') return currentPath === '/overview' || currentPath === '/';
    if (m.id === 'carpooling') return currentPath.startsWith('/carpooling') || currentPath.startsWith('/drivers');
    return currentPath.startsWith(`/${m.id}`);
  }) || MODULE_OPTIONS[0];

  const handleSelectModule = (path: string) => {
    setIsModuleMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Left: Executive Date & Live Clock */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100/90 border border-slate-200/70 text-indigo-600 shadow-2xs">
            <Calendar className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-slate-800 tracking-tight">
              {formattedDate}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="font-medium text-slate-600">{formattedTime}</span>
            </div>
          </div>
        </div>

        {/* Right: Module Selector, Notifications & User */}
        <div className="flex items-center gap-3.5">
          {/* Module Selector Dropdown */}
          <div className="relative" ref={moduleMenuRef}>
            <button
              type="button"
              onClick={() => setIsModuleMenuOpen(!isModuleMenuOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all cursor-pointer shadow-2xs group focus:outline-none"
              aria-label="Select Platform Module"
            >
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg border ${activeModule.accent} shadow-2xs shrink-0`}>
                <activeModule.icon className="h-3.5 w-3.5" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider leading-none">
                  Active Module
                </div>
                <div className="text-xs font-semibold text-slate-800 leading-tight mt-0.5 group-hover:text-indigo-600 transition-colors">
                  {activeModule.label}
                </div>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isModuleMenuOpen ? 'rotate-180 text-slate-700' : ''}`} />
            </button>

            {/* Dropdown Menu Modal */}
            {isModuleMenuOpen && (
              <div className="absolute right-0 mt-2 w-76 sm:w-80 rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/10 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    Platform Modules
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {MODULE_OPTIONS.length} modules
                  </span>
                </div>

                <div className="p-1.5 max-h-[420px] overflow-y-auto space-y-1">
                  {MODULE_OPTIONS.map((mod) => {
                    const isSelected = activeModule.id === mod.id;
                    const IconComp = mod.icon;

                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => handleSelectModule(mod.path)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer group ${isSelected
                          ? 'bg-indigo-50/80 border border-indigo-200/80 shadow-2xs'
                          : 'hover:bg-slate-50 border border-transparent'
                          }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${mod.accent} shadow-2xs shrink-0`}>
                            <IconComp className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 truncate">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xs font-semibold truncate ${isSelected ? 'text-indigo-900' : 'text-slate-800 group-hover:text-slate-900'
                                }`}>
                                {mod.label}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">
                              {mod.description}
                            </div>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white shrink-0 ml-2">
                            <Check className="h-3 w-3" />
                          </div>
                        ) : (
                          <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Emergency SOS Incidents Button */}
          {/* <button
            type="button"
            onClick={() => setIsSosModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition-all font-semibold text-xs shadow-2xs cursor-pointer group shrink-0"
            aria-label="Emergency SOS Incidents"
            title="Emergency SOS Incident Response"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
            </span>
            <ShieldAlert className="h-4 w-4 text-rose-600 group-hover:scale-110 transition-transform" />
            <span className="font-bold tracking-wider">SOS</span>
            <span className="ml-0.5 rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none shadow-2xs">
              2
            </span>
          </button> */}

          {/* Notifications */}
          <div className="relative">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white"></span>
            </button>
          </div>

          {/* Admin User Profile with Interactive Dropdown */}
          <div className="relative pl-2 border-l border-slate-200" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-left focus:outline-none"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
            >
              <img
                src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                alt={currentUser?.name || "Admin User"}
                className="h-9 w-9 rounded-xl object-cover ring-1 ring-slate-200"
              />
              <div className="hidden lg:block text-left">
                <div className="text-xs font-medium text-slate-800 leading-tight">
                  {currentUser?.name || "Elena Rostova"}
                </div>
                <div className="text-[11px] font-normal text-slate-400 leading-tight">
                  {currentUser?.role || "Operations Lead"}
                </div>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 hidden lg:block transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-900/10 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-900">{currentUser?.name || "Elena Rostova"}</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-medium">
                      {currentUser?.role || "Operations Lead"}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{currentUser?.email || "elena@digitalraiz.internal"}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{currentUser?.department || "Fleet & KYC Safety"}</div>
                </div>

                <div className="p-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout?.();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out from Panel</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Emergency SOS Incident Response Modal */}
      <EmergencySosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
      />
    </header>
  );
};
