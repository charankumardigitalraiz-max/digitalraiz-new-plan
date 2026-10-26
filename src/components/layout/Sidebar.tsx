import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  Car,
  Music,
  MapPin,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Settings,
  HelpCircle,
  MoreVertical,
  PanelLeftClose,
  Globe2,
  ChevronsUpDown,
  LogOut,
  Users
} from 'lucide-react';
import type { NavigationTab } from '../../types';
import type { AdminUser } from '../auth/Login';

export interface NavSubItem {
  id: string;
  label: string;
  badge?: number | string;
  isPendingBadge?: boolean;
}

export interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  subItems?: NavSubItem[];
}

interface SidebarProps {
  activeTab?: NavigationTab;
  activeSubTab?: string;
  onTabChange?: (tab: NavigationTab, subTab?: string) => void;
  pendingDriverCount: number;
  activeCarpoolCount: number;
  concertCount: number;
  tripCount: number;
  strangerMeetsCount?: number;
  currentUser?: AdminUser | null;
  onLogout?: () => void;
}
interface ModuleColorStyle {
  activeBg: string;
  activeText: string;
  activeIcon: string;
  activeSubBg: string;
  activeBadgeBg: string;
  activeBadgeText: string;
}

const MODULE_STYLES: Record<string, ModuleColorStyle> = {
  carpooling: {
    activeBg: 'bg-indigo-50 text-indigo-700',
    activeText: 'text-indigo-700',
    activeIcon: 'text-indigo-600',
    activeSubBg: 'bg-indigo-50/90 text-indigo-700',
    activeBadgeBg: 'bg-indigo-100',
    activeBadgeText: 'text-indigo-700'
  },
  concerts: {
    activeBg: 'bg-purple-50 text-purple-700',
    activeText: 'text-purple-700',
    activeIcon: 'text-purple-600',
    activeSubBg: 'bg-purple-50/90 text-purple-700',
    activeBadgeBg: 'bg-purple-100',
    activeBadgeText: 'text-purple-700'
  },
  trips: {
    activeBg: 'bg-amber-50 text-amber-700',
    activeText: 'text-amber-700',
    activeIcon: 'text-amber-600',
    activeSubBg: 'bg-amber-50/90 text-amber-700',
    activeBadgeBg: 'bg-amber-100',
    activeBadgeText: 'text-amber-700'
  },
  'stranger-meets': {
    activeBg: 'bg-teal-50 text-teal-700',
    activeText: 'text-teal-700',
    activeIcon: 'text-teal-600',
    activeSubBg: 'bg-teal-50/90 text-teal-700',
    activeBadgeBg: 'bg-teal-100',
    activeBadgeText: 'text-teal-700'
  },
  users: {
    activeBg: 'bg-blue-50 text-blue-700',
    activeText: 'text-blue-700',
    activeIcon: 'text-blue-600',
    activeSubBg: 'bg-blue-50/90 text-blue-700',
    activeBadgeBg: 'bg-blue-100',
    activeBadgeText: 'text-blue-700'
  }
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab = 'carpooling',
  activeSubTab = 'rides',
  onTabChange,
  pendingDriverCount,
  activeCarpoolCount,
  concertCount,
  tripCount,
  strangerMeetsCount = 0,
  currentUser,
  onLogout
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [expandedTabs, setExpandedTabs] = useState<Record<string, boolean>>({
    carpooling: true,
    concerts: false,
    trips: false,
    'stranger-meets': false
  });

  // Ensure active tab is expanded based on URL pathname
  useEffect(() => {
    if (location.pathname.startsWith('/carpooling')) {
      setExpandedTabs(prev => ({ ...prev, carpooling: true }));
    } else if (location.pathname.startsWith('/concerts')) {
      setExpandedTabs(prev => ({ ...prev, concerts: true }));
    } else if (location.pathname.startsWith('/trips')) {
      setExpandedTabs(prev => ({ ...prev, trips: true }));
    } else if (location.pathname.startsWith('/stranger-meets') || location.pathname.startsWith('/stranger-meet')) {
      setExpandedTabs(prev => ({ ...prev, 'stranger-meets': true }));
    }
  }, [location.pathname]);

  const toggleTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTabs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleParentClick = (item: NavItem) => {
    if (item.subItems && item.subItems.length > 0) {
      setExpandedTabs(prev => ({ ...prev, [item.id]: true }));
      const defaultSub = item.subItems[0].id;
      navigate(`/${item.id}/${defaultSub}`);
      onTabChange?.(item.id, defaultSub);
    } else {
      navigate(`/${item.id}`);
      onTabChange?.(item.id);
    }
  };

  const operationsItems: NavItem[] = [
    {
      id: 'carpooling',
      label: 'Carpooling',
      icon: Car,
      badge: activeCarpoolCount,
      subItems: [
        { id: 'overview', label: 'Overview' },
        { id: 'rides', label: 'All Rides', badge: activeCarpoolCount },
        {
          id: 'verifications',
          label: 'Driver KYC',
          // badge: pendingDriverCount > 0 ? `${pendingDriverCount} pending` : undefined,
          isPendingBadge: pendingDriverCount > 0
        },
        { id: 'settings', label: 'Carpool Settings' }
      ]
    },
    {
      id: 'concerts',
      label: 'Concerts & Events',
      icon: Music,
      badge: concertCount,
      subItems: [
        { id: 'overview', label: 'Overview' },
        { id: 'all-concerts', label: 'All Concerts', badge: concertCount },
        { id: 'venues', label: 'Venues & Stages' },
        { id: 'artists', label: 'Artists & Headliners' }
      ]
    },
    {
      id: 'trips',
      label: 'Trip Planner',
      icon: MapPin,
      badge: tripCount,
      subItems: [
        { id: 'all-trips', label: 'Trip Itineraries', badge: tripCount },
        { id: 'companions', label: 'Travel Buddies' }
      ]
    },
    {
      id: 'stranger-meets',
      label: 'Stranger Meets',
      icon: Sparkles,
      badge: strangerMeetsCount,
      subItems: [
        { id: 'all-meets', label: 'Community Meets', badge: strangerMeetsCount },
        { id: 'buddies', label: 'Travel Buddies' }
      ]
    }
  ];

  return (
    <aside className="w-65 shrink-0 border-r border-slate-200/80 bg-white flex flex-col h-screen sticky top-0 z-20 font-sans">
      {/* Brand Identity */}
      <div className="shrink-0 p-6 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white mb-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400 p-[1.5px] shadow-sm group cursor-pointer transition-transform hover:scale-105">
            <div className="h-full w-full rounded-[10px] bg-white flex items-center justify-center">
              <Globe2 className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-semibold tracking-tight text-slate-900 font-sans">
                DigitalRaiz
              </span>
              {/* <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 border border-indigo-200/70 shadow-2xs">
                GLOBAL
              </span> */}
            </div>
            <p className="text-[11px] font-normal text-slate-400">
              Mobility • Concerts • Trips
            </p>
          </div>
        </div>
      </div>


      {/* Navigation Scroll Area */}
      <div className="flex-1 min-h-0 px-3 space-y-0.5 overflow-y-auto">
        {/* Top-Level Overview */}
        <button
          type="button"
          onClick={() => {
            navigate('/overview');
            onTabChange?.('overview', 'overview-pulse');
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors text-left cursor-pointer ${location.pathname === '/overview' || location.pathname === '/' || activeTab === 'overview'
              ? 'bg-slate-100 text-slate-900 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
            }`}
        >
          <Compass
            className={`h-4 w-4 shrink-0 transition-colors ${location.pathname === '/overview' || location.pathname === '/' || activeTab === 'overview'
                ? 'text-indigo-600'
                : 'text-slate-400'
              }`}
          />
          <span>Overview</span>
        </button>

        {/* Global Users Directory */}
        <button
          type="button"
          onClick={() => {
            navigate('/users');
            onTabChange?.('users');
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-[13px] transition-colors text-left cursor-pointer ${location.pathname.startsWith('/users') || activeTab === 'users'
              ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
            }`}
        >
          <div className="flex items-center gap-2.5">
            <Users
              className={`h-4 w-4 shrink-0 transition-colors ${location.pathname.startsWith('/users') || activeTab === 'users'
                  ? 'text-blue-600'
                  : 'text-slate-400'
                }`}
            />
            <span>Customers</span>
          </div>
        </button>

        {/* OPERATIONS Header */}
        <div className="pt-5 pb-1 px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Operations
        </div>

        {operationsItems.map((item) => {
          const Icon = item.icon;
          const isItemActive =
            location.pathname.startsWith(`/${item.id}`) ||
            activeTab === item.id ||
            (item.id === 'carpooling' && location.pathname.startsWith('/drivers'));
          const isExpanded = !!expandedTabs[item.id];
          const style = MODULE_STYLES[item.id] || MODULE_STYLES.carpooling;

          return (
            <div key={item.id} className="space-y-1">
              {/* Parent Nav Item */}
              <button
                type="button"
                onClick={() => handleParentClick(item)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-[13px] transition-colors text-left cursor-pointer ${isItemActive
                    ? `${style.activeBg} font-semibold shadow-2xs`
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                  }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-1">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${isItemActive ? style.activeIcon : 'text-slate-400'
                      }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                  {item.subItems && item.subItems.length > 0 && (
                    <span
                      onClick={(e) => toggleTab(item.id, e)}
                      className={`p-0.5 transition-colors ${isItemActive ? style.activeText : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </div>
              </button>

              {/* Sub-Tabs: Clean Tree with Module-Colored Active Pill */}
              {isExpanded && item.subItems && item.subItems.length > 0 && (
                <div className="ml-6 pl-3 border-l border-slate-200/80 my-1 space-y-0.5">
                  {item.subItems.map((sub) => {
                    const subPath = `/${item.id}/${sub.id}`;
                    const isSubActive =
                      location.pathname === subPath ||
                      (location.pathname === `/${item.id}` && sub.id === item.subItems?.[0].id) ||
                      (sub.id === 'verifications' && location.pathname === '/drivers') ||
                      (item.id === 'concerts' &&
                        sub.id === 'all-concerts' &&
                        (location.pathname === '/concerts/all-concerts' ||
                          (location.pathname.startsWith('/concerts/') &&
                            !['overview', 'venues', 'artists'].some((segment) =>
                              location.pathname.startsWith(`/concerts/${segment}`)
                            ))));

                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          navigate(subPath);
                          onTabChange?.(item.id, sub.id);
                        }}
                        className={`w-full flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors text-left cursor-pointer ${isSubActive
                            ? `${style.activeSubBg} font-semibold shadow-2xs`
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                          }`}
                      >
                        <span className="truncate">{sub.label}</span>

                        {sub.badge !== undefined && (
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium shrink-0 ml-1.5 ${sub.isPendingBadge
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : isSubActive
                                  ? `${style.activeBadgeBg} ${style.activeBadgeText}`
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                          >
                            {sub.isPendingBadge && (
                              <span className="relative flex h-1.5 w-1.5 mr-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                              </span>
                            )}
                            {sub.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* SYSTEM Header */}
        <div className="pt-5 pb-1 px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          System
        </div>

        <button
          type="button"
          onClick={() => {
            navigate('/settings');
            onTabChange?.('settings');
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors text-left cursor-pointer ${location.pathname === '/settings' || activeTab === 'settings'
              ? 'bg-slate-100 text-slate-900 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
            }`}
        >
          <Settings className={`h-4 w-4 shrink-0 transition-colors ${location.pathname === '/settings' || activeTab === 'settings' ? 'text-slate-700' : 'text-slate-400'
            }`} />
          <span>Settings</span>
        </button>

        <button
          type="button"
          onClick={() => {
            navigate('/help');
            onTabChange?.('help');
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors text-left cursor-pointer ${location.pathname === '/help' || activeTab === 'help'
              ? 'bg-slate-100 text-slate-900 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
            }`}
        >
          <HelpCircle className={`h-4 w-4 shrink-0 transition-colors ${location.pathname === '/help' || activeTab === 'help' ? 'text-slate-700' : 'text-slate-400'
            }`} />
          <span>Help & Support</span>
        </button>
      </div>

      {/* Footer User Profile & Collapse */}
      <div className="shrink-0 p-4 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
              alt={currentUser?.name || 'Sarah Chen'}
              className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
            />
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-800 truncate">
                {currentUser?.name || 'Sarah Chen'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {currentUser?.role || 'sarah@acme.co'}
              </div>
            </div>
          </div>
          {onLogout ? (
            <button
              type="button"
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 rounded-md text-rose-600 bg-rose-50 transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* <button
          type="button"
          className="w-full flex items-center gap-2 px-1 py-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <PanelLeftClose className="h-4 w-4 shrink-0" />
          <span>Collapse sidebar</span>
        </button> */}
      </div>
    </aside>
  );
};
