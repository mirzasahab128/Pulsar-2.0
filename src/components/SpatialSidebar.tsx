import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  Activity, 
  Building2, 
  Users, 
  Search, 
  ShieldCheck, 
  Flame, 
  Mail, 
  PhoneCall, 
  Linkedin, 
  MessagesSquare, 
  Bell, 
  MapPin, 
  Bot, 
  GitBranch, 
  CheckSquare, 
  ClipboardList,
  TrendingUp, 
  BarChart3, 
  Cpu, 
  Clock, 
  Globe2, 
  Network, 
  Lock, 
  Layers, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Pin,
  PinOff
} from 'lucide-react';
import { PulsarSpatialModule } from '../types';
import { useTheme } from '../context/ThemeContext';
import { PulsarGalaxy } from './PulsarGalaxy';
import { AccessInfo } from '../services/api';

interface SpatialSidebarProps {
  activeModule: PulsarSpatialModule;
  onSelectModule: (module: PulsarSpatialModule) => void;
  leadsCount: number;
  unreadTasksCount: number;
  meetingNotesCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  // Pin: locks the sidebar in its wide (w-64) state on all pages. While
  // pinned, App passes isCollapsed=false and ignores collapse toggles.
  isPinned?: boolean;
  onTogglePin?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  // Phases 1–3: platform access drives the owner-only Admin item and the
  // locked-not-hidden rendering of features outside the user's plan (§3e).
  access?: AccessInfo | null;
  onLockedSelect?: (featureKey: string, label: string) => void;
}

interface NavGroup {
  label: string;
  items: Array<{
    id: PulsarSpatialModule;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    badgeVariant?: 'violet' | 'cyan' | 'amber' | 'emerald';
    feature?: string;
  }>;
}

export const SpatialSidebar: React.FC<SpatialSidebarProps> = ({
  activeModule,
  onSelectModule,
  leadsCount,
  unreadTasksCount,
  meetingNotesCount,
  isCollapsed,
  onToggleCollapse,
  isPinned = false,
  onTogglePin,
  isMobileOpen = false,
  onCloseMobile,
  access,
  onLockedSelect
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Navigation Groupings matching Spatial Operating System specification
  const navGroups: NavGroup[] = [
    {
      label: 'Workspace',
      items: [
        { id: 'command_center', label: 'Dashboard', icon: Compass },
        { id: 'ai_assistant', label: 'AI Assistant', icon: Sparkles, badgeVariant: 'violet', feature: 'ai_assistant' },
        { id: 'activity_feed', label: 'Activity Feed', icon: Activity }
      ]
    },
    {
      label: 'Sales Intelligence',
      items: [
        { id: 'leads', label: 'Lead Discovery & Radar', icon: Building2, count: leadsCount, badgeVariant: 'emerald', feature: 'lead_discovery' },
        { id: 'prospects', label: 'Prospect Database', icon: Users, feature: 'lead_discovery' },
        { id: 'research', label: 'Company Research', icon: Search, feature: 'lead_discovery' },
        { id: 'qualification', label: 'Lead Qualification', icon: ShieldCheck, feature: 'npi_search' },
        { id: 'territory_maps', label: 'Territory & Field Maps', icon: MapPin, badgeVariant: 'cyan', feature: 'territory_maps' }
      ]
    },
    {
      label: 'Outreach',
      items: [
        { id: 'campaigns', label: 'Campaigns', icon: Flame, badgeVariant: 'cyan', feature: 'campaigns' },
        { id: 'pipeline_ops', label: 'Pipeline Ops', icon: GitBranch, badgeVariant: 'cyan', feature: 'campaigns' },
        { id: 'email_outreach', label: 'Email Outreach', icon: Mail, feature: 'email_outreach' },
        { id: 'call_studio', label: 'Calling & Voice Studio', icon: PhoneCall, feature: 'call_studio' },
        { id: 'linkedin', label: 'LinkedIn Workflows', icon: Linkedin, feature: 'linkedin_workflows' },
        { id: 'conversations', label: 'Unified Conversations', icon: MessagesSquare, count: meetingNotesCount },
        { id: 'reminders', label: 'Follow-ups & Tasks', icon: Bell, count: unreadTasksCount, badgeVariant: 'amber' },
        { id: 'google_tasks', label: 'Google Tasks Sync', icon: CheckSquare, badgeVariant: 'cyan', feature: 'google_sync' },
        { id: 'google_forms', label: 'Google Forms & Audits', icon: ClipboardList, badgeVariant: 'cyan', feature: 'google_sync' }
      ]
    },
    {
      label: 'Automation',
      items: [
        { id: 'ai_agents', label: 'AI Agent Fleet', icon: Bot, badgeVariant: 'violet' },
        { id: 'workflows', label: 'Workflow Builder', icon: GitBranch },
        { id: 'tasks_approvals', label: 'Tasks & Approvals', icon: CheckSquare }
      ]
    },
    {
      label: 'Intelligence',
      items: [
        { id: 'pipeline', label: 'Pipeline & Velocity', icon: TrendingUp },
        { id: 'conversion_reports', label: 'Conversion Reports', icon: BarChart3 },
        { id: 'agent_performance', label: 'Agent Performance', icon: Cpu },
        { id: 'briefing', label: 'Daily PST Briefing', icon: Clock, feature: 'daily_briefing' }
      ]
    },
    {
      label: 'Administration',
      items: [
        { id: 'integrations', label: 'Integrations Matrix', icon: Network },
        { id: 'permissions', label: 'Team & Permissions', icon: Lock },
        { id: 'workspaces', label: 'Customer Workspaces', icon: Layers },
        { id: 'settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  // Phases 1–3 (§3): the Admin Command Center item exists only for master
  // admins. It is separate from IntegrationsAdminWorkspace — do not merge.
  if (access?.isMasterAdmin) {
    const adminGroup = navGroups.find(g => g.label === 'Administration');
    if (adminGroup && !adminGroup.items.some(i => i.id === 'admin_access')) {
      adminGroup.items.unshift({ id: 'admin_access', label: 'Admin Command Center', icon: ShieldCheck, badgeVariant: 'violet' });
    }
  }

  // Locked-not-hidden (§3e): a feature outside the plan still renders, with
  // a lock and an upgrade path. Master admins bypass plan gates. While
  // access is still loading (null) nothing locks — the server enforces.
  const isLocked = (item: NavGroup['items'][number]): boolean => {
    if (!item.feature || !access || access.isMasterAdmin) return false;
    return access.features[item.feature] !== true;
  };

  const handleItemClick = (item: NavGroup['items'][number]) => {
    if (isLocked(item)) {
      if (onLockedSelect && item.feature) onLockedSelect(item.feature, item.label);
      return;
    }
    onSelectModule(item.id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Spatial Sidebar Shell */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col transition-all duration-300 select-none ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          isDark 
            ? 'bg-[#111C2E]/95 backdrop-blur-2xl border-r border-slate-700/40 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' 
            : 'bg-white/95 backdrop-blur-2xl border-r border-[#DCE5EC] text-[#172338] shadow-[0_12px_36px_rgba(23,35,56,0.06)]'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="shrink-0 flex items-center justify-center">
              <PulsarGalaxy size="sm" state="active" glow={true} />
            </div>

            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight font-display text-slate-900 dark:text-white">
                    Pulsar
                  </span>
                  <span className="text-[10px] font-mono font-medium text-teal-600 dark:text-teal-400">
                    Growth OS
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Revenue Intelligence</div>
              </div>
            )}
          </div>

          {/* Desktop Pin + Collapse Controls */}
          <div className="hidden lg:flex items-center gap-1 shrink-0">
            {/* Pin toggle — shown in the wide state; while pinned the
                sidebar is locked open, so this is also where you unpin. */}
            {onTogglePin && !isCollapsed && (
              <button
                onClick={onTogglePin}
                className={`flex items-center justify-center w-7 h-7 rounded-lg border transition cursor-pointer ${
                  isPinned
                    ? isDark
                      ? 'bg-teal-500/20 border-teal-500/50 text-teal-300 shadow-[0_0_10px_rgba(20,184,166,0.25)]'
                      : 'bg-teal-100 border-teal-400 text-teal-700'
                    : isDark 
                      ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-white' 
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600 hover:text-slate-900'
                }`}
                title={isPinned ? 'Unpin sidebar' : 'Pin sidebar open'}
                aria-label={isPinned ? 'Unpin sidebar' : 'Pin sidebar open'}
                aria-pressed={isPinned}
              >
                {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
              </button>
            )}

            {/* Collapse toggle — unavailable while pinned (locked wide) */}
            {!isPinned && (
              <button
                onClick={onToggleCollapse}
                className={`flex items-center justify-center w-7 h-7 rounded-lg border transition cursor-pointer ${
                  isDark 
                    ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-white' 
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600 hover:text-slate-900'
                }`}
                title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Navigation Groups List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-6 scrollbar-thin">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 pb-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
                  {group.label}
                </div>
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activeModule === item.id;
                  const Icon = item.icon;
                  const locked = isLocked(item);

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      title={locked ? 'Not in your plan' : (isCollapsed ? item.label : undefined)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer relative group ${
                        isActive
                          ? isDark
                            ? 'glass-active bg-violet-600/20 text-white border border-violet-500/40 shadow-[0_0_20px_rgba(139,92,246,0.25)]'
                            : 'bg-violet-100 text-violet-950 font-semibold border border-violet-300 shadow-sm'
                          : isDark
                            ? 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {/* Active Left Indicator Bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-violet-400 shadow-[0_0_8px_#8b5cf6]" />
                      )}

                      <div className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        isActive 
                          ? 'text-violet-400' 
                          : isDark ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-500 group-hover:text-slate-800'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      {!isCollapsed && (
                        <div className="flex-1 flex items-center justify-between text-left truncate">
                          <span className={`truncate ${locked ? 'opacity-70' : ''}`}>{item.label}</span>

                          {/* Plan lock (locked-not-hidden, §3e) */}
                          {locked && (
                            <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-2" />
                          )}

                          {/* Unboxed Zero-Pill Tabular Counter */}
                          {item.count !== undefined && item.count > 0 && (
                            <span className="font-mono tabular-nums text-[11px] font-semibold text-slate-400 pl-2">
                              {item.count}
                            </span>
                          )}

                          {/* Live Indicator Dot for Active AI or Campaigns */}
                          {item.badgeVariant && !item.count && (
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              item.badgeVariant === 'violet' 
                                ? 'bg-violet-400 shadow-[0_0_6px_#8b5cf6]' 
                                : item.badgeVariant === 'cyan'
                                  ? 'bg-cyan-400 shadow-[0_0_6px_#06b6d4]'
                                  : item.badgeVariant === 'amber'
                                    ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'
                                    : 'bg-emerald-400 shadow-[0_0_6px_#10b981]'
                            }`} />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Operating State & Tenant Badge */}
        <div className="p-3 border-t border-white/[0.06] shrink-0">
          <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition ${
            isDark 
              ? 'bg-white/[0.03] border-white/[0.06]' 
              : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981] shrink-0" />
            {!isCollapsed && (
              <div className="truncate text-left flex-1">
                <div className="text-[11px] font-bold text-slate-200 truncate">Autonomous Hub</div>
                <div className="text-[10px] text-slate-500 font-mono">PST Ready · v2.5</div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
