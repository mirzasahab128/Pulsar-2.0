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
  PinOff,
  LogOut
} from 'lucide-react';
import { PulsarSpatialModule } from '../types';
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
  // Phase 2: signed-in identity for the footer account block + Sign out,
  // and for showing the Admin entry to signed-in non-masters (who land on
  // the honest unavailable panel, never the real center).
  signedInEmail?: string | null;
  accountRoleLabel?: string;
  onSignOut?: () => void;
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
  onLockedSelect,
  signedInEmail = null,
  accountRoleLabel = 'Customer',
  onSignOut
}) => {

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

  // Phases 1–3 (§3) + Phase 2: the Admin Command Center item is visible to
  // any signed-in user so the center is discoverable instead of silently
  // absent. It is separate from IntegrationsAdminWorkspace — do not merge.
  // Non-masters land on the honest unavailable panel (App.tsx); this menu
  // entry grants nothing — the real center still requires server-verified
  // master admin. A lock mark shows on the entry until then.
  const adminLocked = !!signedInEmail && !access?.isMasterAdmin;
  if (signedInEmail) {
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

      {/* Spatial Sidebar Shell — Phase 1 theme: floating rail (rounded card,
          inset on desktop). Pin/collapse/brand behaviors unchanged. */}
      <aside 
        className={`pv-rail ${isCollapsed ? 'is-collapsed' : ''} fixed top-0 bottom-0 left-0 lg:top-3 lg:bottom-3 lg:left-3 z-40 flex flex-col transition-all duration-300 select-none ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--pv-border)] shrink-0">
          {/* Brand button: loads the Dashboard (command_center) */}
          <button
            type="button"
            onClick={() => {
              onSelectModule('command_center');
              if (onCloseMobile) onCloseMobile();
            }}
            className="flex items-center gap-3 overflow-hidden cursor-pointer group text-left"
            title="Pulsar — go to Dashboard"
            aria-label="Pulsar — go to Dashboard"
          >
            <div className="shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <PulsarGalaxy size="sm" state="active" glow={true} />
            </div>

            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight font-display text-[var(--pv-ink)] group-hover:underline decoration-[var(--pv-accent)] underline-offset-4">
                    Pulsar
                  </span>
                  <span className="text-[10px] font-mono font-medium text-[var(--pv-accent)]">
                    Growth OS
                  </span>
                </div>
                <div className="text-[10px] text-[var(--pv-muted)] truncate">Revenue Intelligence</div>
              </div>
            )}
          </button>

          {/* Pin + Collapse Controls — Phase 2: visible in EVERY state.
              Previously the pin toggle rendered only in the wide state, so
              from the collapsed rail there was no way to pin, and on mobile
              (hidden lg:flex) there was no expand/pin control at all.
              Pinning from the rail also expands it (pinned ⇒ wide). */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Pin toggle — always offered; while pinned the sidebar is
                locked open, so this is also where you unpin. */}
            {onTogglePin && (
              <button
                onClick={onTogglePin}
                className={`flex items-center justify-center w-7 h-7 rounded-lg border transition cursor-pointer ${
                  isPinned
                    ? 'bg-[var(--pv-mint)] border-[var(--pv-mint-2)] text-[var(--pv-green)] shadow-sm'
                    : 'bg-[var(--pv-card-soft)] hover:bg-[var(--pv-mint)] border-[var(--pv-border)] text-[var(--pv-muted)] hover:text-[var(--pv-ink)]'
                }`}
                title={isPinned ? 'Unpin sidebar (collapse allowed again)' : 'Pin sidebar open'}
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
                className="flex items-center justify-center w-7 h-7 rounded-lg border transition cursor-pointer bg-[var(--pv-card-soft)] hover:bg-[var(--pv-mint)] border-[var(--pv-border)] text-[var(--pv-muted)] hover:text-[var(--pv-ink)]"
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
                <div className="px-3 pb-1 pv-group-label">
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
                      className={`pv-nav-btn group ${isActive ? 'active' : ''} ${locked ? 'locked' : ''}`}
                    >
                      <div className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        isActive
                          ? 'text-white'
                          : 'text-[var(--pv-muted)] group-hover:text-[var(--pv-green)]'
                      }`}>
                        <Icon className="w-[18px] h-[18px]" />
                      </div>

                      {/* Collapsed rail: red count badge on the icon button */}
                      {isCollapsed && item.count !== undefined && item.count > 0 && (
                        <span className="pv-count on-rail">{item.count > 99 ? '99+' : item.count}</span>
                      )}

                      {!isCollapsed && (
                        <div className="flex-1 flex items-center justify-between text-left truncate min-w-0">
                          <span className={`truncate ${locked ? 'opacity-70' : ''}`}>{item.label}</span>

                          {/* Plan lock (locked-not-hidden, §3e) */}
                          {locked && (
                            <Lock className="w-3.5 h-3.5 text-[var(--pv-amber)] shrink-0 ml-2" />
                          )}

                          {/* Admin entry lock (Phase 2): visible but not
                              granted until the server verifies master admin */}
                          {item.id === 'admin_access' && adminLocked && (
                            <Lock className="w-3.5 h-3.5 text-[var(--pv-amber)] shrink-0 ml-2" />
                          )}

                          {/* Theme count badge (red pill, as in the approved theme) */}
                          {item.count !== undefined && item.count > 0 && (
                            <span className="pv-count ml-2 shrink-0">{item.count > 99 ? '99+' : item.count}</span>
                          )}

                          {/* Live Indicator Dot for Active AI or Campaigns */}
                          {item.badgeVariant && !item.count && (
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              item.badgeVariant === 'violet'
                                ? 'bg-[var(--pv-violet)]'
                                : item.badgeVariant === 'cyan'
                                  ? 'bg-[var(--pv-sky)]'
                                  : item.badgeVariant === 'amber'
                                    ? 'bg-[var(--pv-amber-strong)]'
                                    : 'bg-[var(--pv-bright)]'
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
        <div className="p-3 border-t border-[var(--pv-border)] shrink-0 space-y-2">
          <div className="pv-soft p-2.5 flex items-center gap-2.5 transition">
            <span className="w-2 h-2 rounded-full bg-[var(--pv-bright)] animate-pulse shadow-[0_0_8px_var(--pv-bright)] shrink-0" />
            {!isCollapsed && (
              <div className="truncate text-left flex-1">
                <div className="text-[11px] font-bold text-[var(--pv-ink)] truncate">Autonomous Hub</div>
                <div className="text-[10px] text-[var(--pv-muted)] font-mono">PST Ready · v2.5</div>
              </div>
            )}
          </div>

          {/* Phase 2: signed-in account + Sign out. Previously signOut
              lived only in Header.tsx, which is never rendered, so the
              app had no visible logout at all. */}
          {signedInEmail && (
            <div className="pv-soft p-2.5 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-[var(--pv-mint)] text-[var(--pv-green)] flex items-center justify-center font-bold text-[11px] shrink-0">
                {signedInEmail.charAt(0).toUpperCase()}
              </span>
              {!isCollapsed && (
                <div className="truncate text-left flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-[var(--pv-ink)] truncate" title={signedInEmail}>
                    {signedInEmail}
                  </div>
                  <div className="text-[10px] text-[var(--pv-muted)] font-mono truncate">{accountRoleLabel}</div>
                </div>
              )}
              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="flex items-center justify-center w-7 h-7 rounded-lg border border-[var(--pv-border)] bg-[var(--pv-card-soft)] hover:bg-[var(--pv-red-tint)] text-[var(--pv-muted)] hover:text-[var(--pv-red)] transition cursor-pointer shrink-0"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
