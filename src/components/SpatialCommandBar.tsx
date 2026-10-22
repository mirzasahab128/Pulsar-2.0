import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Menu, 
  Sparkles, 
  Bot, 
  Clock, 
  Bell, 
  Plus, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Crown, 
  Lock, 
  Layers, 
  PhoneCall, 
  UserPlus, 
  Download, 
  FileText,
  ChevronDown,
  X,
  ExternalLink
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { formatPSTTime } from '../utils/pstTime';
import { ManagerSettings, ActionItem } from '../types';

interface SpatialCommandBarProps {
  onOpenCommandPalette: () => void;
  onOpenMobileSidebar: () => void;
  activeNicheName: string;
  onOpenNicheLibrary: () => void;
  unreadTasksCount: number;
  tasks: ActionItem[];
  onOpenTasks: () => void;
  onOpenCallStudio: () => void;
  onOpenNewLeadModal: () => void;
  onOpenAI: () => void;
  onExportCSV: () => void;
  settings: ManagerSettings;
  activeAgentsCount?: number;
}

export const SpatialCommandBar: React.FC<SpatialCommandBarProps> = ({
  onOpenCommandPalette,
  onOpenMobileSidebar,
  activeNicheName,
  onOpenNicheLibrary,
  unreadTasksCount,
  tasks,
  onOpenTasks,
  onOpenCallStudio,
  onOpenNewLeadModal,
  onOpenAI,
  onExportCSV,
  settings,
  activeAgentsCount = 4
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const { role, isReadOnly, isMasterAdmin, workspaceId, setQuickProfile, openAuthModal } = useAuth();

  const [pstTime, setPstTime] = useState<string>(() => formatPSTTime(new Date()));
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const actionsRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Live PST clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setPstTime(formatPSTTime(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setIsActionsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tenantId = workspaceId || (isMasterAdmin ? 'ws_pulsar_master' : 'ws_pulsar_customer');

  return (
    <header className={`sticky top-0 z-30 h-16 w-full border-b backdrop-blur-2xl transition-all duration-300 select-none ${
      isDark 
        ? 'glass-elevated bg-[#080a12]/85 border-white/[0.08] text-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' 
        : 'bg-white/90 border-slate-200 text-slate-900 shadow-sm'
    }`}>
      <div className="h-full px-4 flex items-center justify-between gap-3">
        
        {/* Left Section: Mobile Menu, Command Palette Search & Workspace Badge */}
        <div className="flex items-center gap-2.5">
          {/* Mobile Sidebar Hamburger */}
          <button
            onClick={onOpenMobileSidebar}
            className={`lg:hidden p-2 rounded-xl border transition cursor-pointer ${
              isDark 
                ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10' 
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-200'
            }`}
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Command Palette Launcher */}
          <button
            onClick={onOpenCommandPalette}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer group ${
              isDark 
                ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-400 hover:text-slate-200' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="Press Cmd+K or Ctrl+K to search anything"
          >
            <Search className="w-3.5 h-3.5 text-violet-400 group-hover:text-violet-300 transition-colors" />
            <span className="hidden sm:inline">Search prospects or jump to module...</span>
            <span className="sm:hidden">Search...</span>
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono rounded bg-white/10 text-slate-400 border border-white/10">
              ⌘K
            </kbd>
          </button>

          {/* Workspace Tenant Pill (Quiet Enterprise Metadata) */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-400 font-mono px-2 py-1">
            <span className="text-slate-500">Tenant:</span>
            <span className="text-slate-200 font-bold">{tenantId}</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400 text-[11px]">Isolated DB</span>
          </div>

          {/* Active Business Niche Switcher Button */}
          <button
            onClick={onOpenNicheLibrary}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-medium transition cursor-pointer ${
              isDark 
                ? 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30 text-cyan-300' 
                : 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200 text-cyan-900'
            }`}
            title="Click to switch business industry / niche"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate max-w-[140px] lg:max-w-[200px] font-semibold">
              {activeNicheName.split('&')[0].trim()}
            </span>
          </button>
        </div>

        {/* Right Section: AI Fleet Status, PST Clock, Notifications, Quick Actions, Theme, User */}
        <div className="flex items-center gap-2">
          
          {/* AI Agent Fleet Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-violet-500/10 border border-violet-500/25 text-violet-300 text-xs font-mono font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400" />
            </span>
            <span className="hidden md:inline">{activeAgentsCount} Agents Operational</span>
            <span className="md:hidden">AI Active</span>
          </div>

          {/* Live PST Operations Clock */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{pstTime} <span className="text-slate-500 text-[10px]">PST</span></span>
          </div>

          {/* Notifications Drawer Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`relative p-2 rounded-xl border transition cursor-pointer ${
                isDark 
                  ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
              title="Notifications & Pending Tasks"
            >
              <Bell className="w-4 h-4" />
              {unreadTasksCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full flex items-center justify-center font-mono">
                  {unreadTasksCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className={`absolute right-0 mt-2 w-80 rounded-2xl border shadow-2xl glass-modal p-3 space-y-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${
                isDark ? 'bg-[#0a0e1a]/95 border-white/[0.12] text-slate-200' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                  <span className="font-bold text-xs">Action Items & Reminders</span>
                  <span className="text-[10px] font-mono text-slate-400">{unreadTasksCount} pending</span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1.5 py-1">
                  {tasks.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      No pending tasks or action items.
                    </div>
                  ) : (
                    tasks.slice(0, 5).map(task => (
                      <div 
                        key={task.id} 
                        className={`p-2 rounded-xl border text-xs flex items-start justify-between gap-2 ${
                          task.completed 
                            ? 'opacity-50 border-white/5' 
                            : isDark ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div>
                          <div className={`font-semibold ${task.completed ? 'line-through' : ''}`}>
                            {task.task}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Due: {task.due} · {task.priority}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    onOpenTasks();
                  }}
                  className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition cursor-pointer text-center"
                >
                  View All Action Items
                </button>
              </div>
            )}
          </div>

          {/* Quick Action Button */}
          <div className="relative" ref={actionsRef}>
            <button
              onClick={() => setIsActionsOpen(!isActionsOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-violet-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Quick Action</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {isActionsOpen && (
              <div className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-2xl glass-modal p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${
                isDark ? 'bg-[#0a0e1a]/95 border-white/[0.12] text-slate-200' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <button
                  onClick={() => {
                    setIsActionsOpen(false);
                    onOpenNewLeadModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium hover:bg-white/10 transition cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  <span>Add New Prospect</span>
                </button>

                <button
                  onClick={() => {
                    setIsActionsOpen(false);
                    onOpenCallStudio();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium hover:bg-white/10 transition cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 text-cyan-400" />
                  <span>Start AI Voice Call</span>
                </button>

                <button
                  onClick={() => {
                    setIsActionsOpen(false);
                    onOpenAI();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium hover:bg-white/10 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span>Launch Gemini Copilot</span>
                </button>

                <button
                  onClick={() => {
                    setIsActionsOpen(false);
                    onExportCSV();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium hover:bg-white/10 transition cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Export Leads (CSV)</span>
                </button>
              </div>
            )}
          </div>

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isDark 
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-amber-400 hover:text-amber-300' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-indigo-600 hover:text-indigo-800'
            }`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile & RBAC Indicator */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 transition cursor-pointer"
            >
              <div className="flex flex-col text-right hidden sm:block">
                <span className="text-xs font-bold leading-none text-slate-200">
                  {settings.managerName.split(' ')[0]}
                </span>
                <span className={`text-[10px] font-mono leading-none mt-0.5 ${
                  isMasterAdmin ? 'text-amber-400' : 'text-sky-400'
                }`}>
                  {isMasterAdmin ? 'Master' : 'Customer'}
                </span>
              </div>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                isMasterAdmin ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              }`}>
                {isMasterAdmin ? <Crown className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              </div>
            </button>

            {isProfileMenuOpen && (
              <div className={`absolute right-0 mt-2 w-60 rounded-2xl border shadow-2xl glass-modal p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${
                isDark ? 'bg-[#0a0e1a]/95 border-white/[0.12] text-slate-200' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="p-2 border-b border-white/[0.08] mb-1">
                  <div className="font-bold text-xs text-white">{settings.managerName}</div>
                  <div className="text-[10px] text-slate-400 truncate">{settings.managerEmail}</div>
                  <div className="mt-1 text-[10px] font-mono text-cyan-400">
                    Role: {isMasterAdmin ? 'Master Controller' : 'Customer Read-Only'}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setQuickProfile(isReadOnly ? 'admin' : 'customer');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-medium hover:bg-white/10 transition cursor-pointer text-amber-300"
                >
                  <span>Switch to {isReadOnly ? 'Admin' : 'Customer'}</span>
                  <Crown className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    openAuthModal('signin');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-medium hover:bg-white/10 transition cursor-pointer text-slate-300"
                >
                  <span>Account & Authentication</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
