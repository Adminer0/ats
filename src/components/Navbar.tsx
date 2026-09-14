import React from 'react';
import { Briefcase, LayoutDashboard, Globe, Bell, PlusCircle } from 'lucide-react';
import { NeonStatusBadge } from './NeonStatusBadge';

interface NavbarProps {
  currentView: 'career' | 'ats';
  setCurrentView: (view: 'career' | 'ats') => void;
  activeJobsCount: number;
  totalApplicationsCount: number;
  onOpenCreateJob: () => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  activeJobsCount,
  totalApplicationsCount,
  onOpenCreateJob,
  unreadNotificationsCount = 0,
  onOpenNotifications
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-base font-display">
                  HYPERION
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  Global HR
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Worldwide ATS & Career Portal</p>
            </div>
          </div>

          {/* View Mode Toggle (Public Careers vs ATS Dashboard) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              id="view-career-btn"
              onClick={() => setCurrentView('career')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'career'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Careers Page</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-mono">
                {activeJobsCount}
              </span>
            </button>

            <button
              id="view-ats-btn"
              onClick={() => setCurrentView('ats')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'ats'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>ATS Dashboard</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 font-mono">
                {totalApplicationsCount}
              </span>
            </button>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-3">
            <NeonStatusBadge />

            {currentView === 'ats' && (
              <button
                id="post-job-nav-btn"
                onClick={onOpenCreateJob}
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Post Job
              </button>
            )}

            {onOpenNotifications && (
              <button
                id="nav-notifications-btn"
                onClick={onOpenNotifications}
                className="relative p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
                title="Automated Status Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600"></span>
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
