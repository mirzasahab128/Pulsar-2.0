import React, { useState } from 'react';
import { 
  Building2, 
  TrendingUp, 
  PhoneCall, 
  PhoneForwarded, 
  CheckCircle2, 
  Bell, 
  Sparkles, 
  Bot, 
  ArrowRight, 
  Flame, 
  ShieldCheck, 
  Clock, 
  Zap, 
  AlertCircle, 
  Network, 
  Activity,
  ArrowUpRight,
  ExternalLink,
  Layers,
  MapPin,
  Filter,
  CheckSquare
} from 'lucide-react';
import { RCMLead, DailyStats, WarmTransferRecord, ActionItem, PulsarSpatialModule, ManagerSettings } from '../types';
import { useTheme } from '../context/ThemeContext';
import { NicheTemplate } from '../data/nicheTemplates';
import { PulsarBrandHero } from './PulsarBrandHero';
import { PulsarIntelligencePanel } from './PulsarIntelligencePanel';
import { TelephonyStatusCard } from './TelephonyStatusCard';
import { DashboardProgress } from './DashboardProgress';

interface DashboardProps {
  stats: DailyStats;
  leads: RCMLead[];
  warmTransfers: WarmTransferRecord[];
  tasks: ActionItem[];
  nicheTemplate: NicheTemplate;
  onNavigate: (module: PulsarSpatialModule) => void;
  onTriggerCall: (lead: RCMLead) => void;
  onToggleTask: (taskId: string) => void;
  onOpenAI: () => void;
  onOpenNicheLibrary: () => void;
  settings?: ManagerSettings;
  onOpenSettings?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  leads,
  warmTransfers,
  tasks,
  nicheTemplate,
  onNavigate,
  onTriggerCall,
  onToggleTask,
  onOpenAI,
  onOpenNicheLibrary,
  settings,
  onOpenSettings
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeFilter, setActiveFilter] = useState<'all' | 'ready' | 'transferred' | 'scheduled'>('all');

  const qualifiedLeads = leads.filter(l => 
    l.status === 'Audit Scheduled' || l.status === 'Transferred to Manager' || l.status === 'Ready for Call'
  );

  const pendingTasks = tasks.filter(t => !t.completed);

  // Filtered leads for the priority outreach queue
  const displayLeads = leads.filter(l => {
    if (activeFilter === 'ready') return l.status === 'Ready for Call';
    if (activeFilter === 'transferred') return l.status === 'Transferred to Manager';
    if (activeFilter === 'scheduled') return l.status === 'Audit Scheduled';
    return true;
  });

  return (
    <div className="space-y-5">

      {/* Phases 1–3 (Part 2): one-screen progress — KPI strip + charts fed by
          GET /api/dashboard/stats over the workspace's real records */}
      <DashboardProgress leads={leads} tasks={tasks} warmTransfers={warmTransfers} />

      {/* 1. Workspace Context & Filter Bar */}
      <div className={`p-3.5 rounded-2xl border backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs transition-colors duration-200 ${
        isDark 
          ? 'bg-[#111C2E]/90 border-slate-700/40 text-[#F1F5F9]' 
          : 'bg-white/95 border-[#DCE5EC] text-[#172338] shadow-sm'
      }`}>
        {/* Left: Active Workspace / Niche Info */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenNicheLibrary}
            className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition cursor-pointer ${
              isDark 
                ? 'bg-slate-800/80 border-slate-700 text-teal-300 hover:text-teal-200' 
                : 'bg-[#EAF5F7] border-teal-200/80 text-teal-900 hover:bg-teal-100/70'
            }`}
            title="Switch industry templates & parameters"
          >
            <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 group-hover:rotate-12 transition-transform duration-300" />
            <span>Workspace: {nicheTemplate.name.split('&')[0].trim()}</span>
            <span className="text-[10px] font-mono uppercase px-1 py-0.2 rounded bg-teal-500/20 text-teal-700 dark:text-teal-300">
              Change
            </span>
          </button>

          <span className="text-slate-400 dark:text-slate-600 hidden sm:inline">·</span>

          {/* Quick Segmented Filter Tabs */}
          <div className={`hidden sm:inline-flex items-center gap-1 p-1 rounded-xl border ${
            isDark ? 'bg-slate-900/60 border-slate-700/40' : 'bg-slate-100/80 border-slate-200'
          }`}>
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#0D9488] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({leads.length})
            </button>
            <button
              onClick={() => setActiveFilter('ready')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeFilter === 'ready'
                  ? 'bg-[#0D9488] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Ready to Call
            </button>
            <button
              onClick={() => setActiveFilter('scheduled')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeFilter === 'scheduled'
                  ? 'bg-[#0D9488] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Audits Scheduled
            </button>
          </div>
        </div>

        {/* Right: Telephony Status & Quick Action Triggers */}
        <div className="flex items-center gap-2 shrink-0">
          <TelephonyStatusCard 
            settings={settings}
            onOpenSettings={onOpenSettings}
            variant="compact"
            className="hidden lg:inline-flex"
          />

          <button
            onClick={() => onNavigate('leads')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] text-white font-bold text-xs shadow-sm transition cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Prospect Radar</span>
          </button>

          <button
            onClick={() => onNavigate('call_studio')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold text-xs transition cursor-pointer ${
              isDark 
                ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:text-white' 
                : 'bg-white border-[#DCE5EC] text-slate-700 hover:bg-slate-50'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Dialer Studio</span>
          </button>

          <button
            onClick={() => onNavigate('territory_maps')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold text-xs transition cursor-pointer ${
              isDark 
                ? 'bg-blue-950/30 border-blue-800/40 text-blue-300 hover:bg-blue-900/40' 
                : 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Field Maps</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Brand Hero — Pulsar Galaxy Mark, Live Indicators & Strategic Actions */}
      <PulsarBrandHero
        stats={stats}
        leads={leads}
        tasks={tasks}
        onNavigate={onNavigate}
        activeNicheTitle={nicheTemplate.name}
      />

      {/* 3. Horizontal Business-Growth KPI Strip (5 Scannable Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* KPI 1: Prospects Discovered */}
        <div className={`p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${
          isDark 
            ? 'bg-[#111C2E]/90 border-slate-700/40 text-slate-100' 
            : 'bg-white border-[#DCE5EC] text-[#172338] shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
            <span>Discovered</span>
            <Building2 className="w-4 h-4 text-[#0D9488] dark:text-[#2DD4BF]" />
          </div>
          <div className="text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white tabular-nums">
            {leads.length}
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>+{stats.leadsScraped} today</span>
            <span className="text-teal-700 dark:text-teal-300 font-mono text-[10px] font-semibold">Registry</span>
          </div>
        </div>

        {/* KPI 2: Qualified Leads */}
        <div className={`p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${
          isDark 
            ? 'bg-[#111C2E]/90 border-slate-700/40 text-slate-100' 
            : 'bg-white border-[#DCE5EC] text-[#172338] shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
            <span>Qualified Pipeline</span>
            <ShieldCheck className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
          </div>
          <div className="text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white tabular-nums">
            {qualifiedLeads.length}
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>{Math.round((qualifiedLeads.length / Math.max(1, leads.length)) * 100)}% match</span>
            <span className="text-blue-700 dark:text-blue-400 font-mono text-[10px] font-semibold">High Intent</span>
          </div>
        </div>

        {/* KPI 3: AI Telephony Connects */}
        <div className={`p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${
          isDark 
            ? 'bg-[#111C2E]/90 border-slate-700/40 text-slate-100' 
            : 'bg-white border-[#DCE5EC] text-[#172338] shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
            <span>Calls Placed</span>
            <PhoneCall className="w-4 h-4 text-[#0D9488] dark:text-[#2DD4BF]" />
          </div>
          <div className="text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white tabular-nums">
            {stats.callsPlaced}
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>{stats.humanConnects} connects</span>
            <span className="text-teal-700 dark:text-teal-300 font-mono text-[10px] font-semibold">
              {Math.round((stats.humanConnects / Math.max(1, stats.callsPlaced)) * 100)}% pickup
            </span>
          </div>
        </div>

        {/* KPI 4: Warm Transfers Bridged */}
        <div className={`p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${
          isDark 
            ? 'bg-[#111C2E]/90 border-slate-700/40 text-slate-100' 
            : 'bg-white border-[#DCE5EC] text-[#172338] shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
            <span>Warm Transfers</span>
            <PhoneForwarded className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white tabular-nums">
            {warmTransfers.length}
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>{stats.auditsBooked} audits booked</span>
            <span className="text-amber-700 dark:text-amber-400 font-mono text-[10px] font-semibold">Manager</span>
          </div>
        </div>

        {/* KPI 5: Pipeline Added */}
        <div className={`p-4 rounded-2xl border col-span-2 sm:col-span-1 transition-all duration-200 hover:-translate-y-0.5 ${
          isDark 
            ? 'bg-[#111C2E]/90 border-slate-700/40 text-slate-100' 
            : 'bg-white border-[#DCE5EC] text-[#172338] shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
            <span>Pipeline Value</span>
            <TrendingUp className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white tabular-nums truncate">
            {stats.pipelineAdded}
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>Contract pipeline</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-semibold">Active</span>
          </div>
        </div>

      </div>

      {/* 4. Main Spatial Workspace Grid: 2/3 Primary Zone & 1/3 Supporting Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left 2 Cols: Primary Zone (AI Intelligence Panel, Priority Outreach Queue & Stage Funnel) */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Prominent AI Business Intelligence Panel */}
          <PulsarIntelligencePanel
            leads={leads}
            tasks={tasks}
            stats={stats}
            onNavigate={onNavigate}
            onTriggerCall={onTriggerCall}
            onOpenCopilot={onOpenAI}
          />

          {/* Priority Outreach & Lead Queue */}
          <div className={`p-5 rounded-2xl border backdrop-blur-xl space-y-4 ${
            isDark 
              ? 'bg-[#111C2E]/90 border-slate-700/40 text-[#F1F5F9]' 
              : 'bg-white border-[#DCE5EC] text-[#172338] shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold tracking-tight font-display text-[var(--text-primary)]">
                  Priority Outreach & Target Accounts
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Verified decision-makers ready for autonomous telephony engagement
                </p>
              </div>

              <button
                onClick={() => onNavigate('leads')}
                className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full Prospect Database ({leads.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Leads List */}
            <div className="space-y-2.5">
              {displayLeads.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--text-secondary)]">
                  No prospects match the selected filter.
                </div>
              ) : (
                displayLeads.slice(0, 4).map((lead) => (
                  <div 
                    key={lead.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      isDark 
                        ? 'bg-slate-900/60 border-slate-700/40 hover:bg-slate-800/60' 
                        : 'bg-[#F8FAFC] border-[#DCE5EC] hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-[var(--text-primary)] truncate">
                          {lead.practiceName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/40 font-semibold shrink-0">
                          {lead.status}
                        </span>
                      </div>
                      
                      <div className="text-xs text-[var(--text-secondary)] flex flex-wrap items-center gap-2">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{lead.doctorName}</span>
                        <span>·</span>
                        <span>{lead.specialty}</span>
                        <span>·</span>
                        <span className="font-mono">{lead.monthlyClaimVolume}</span>
                        <span>·</span>
                        <span className="text-slate-500">{lead.state}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => onTriggerCall(lead)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0f766e] text-white font-bold text-xs transition cursor-pointer shadow-sm"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Dial</span>
                      </button>

                      <button
                        onClick={() => onNavigate('territory_maps')}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          isDark 
                            ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' 
                            : 'bg-white border-[#DCE5EC] text-slate-600 hover:text-slate-900'
                        }`}
                        title="Locate on Territory Map"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Revenue Stage Conversion Funnel */}
          <div className={`p-5 rounded-2xl border backdrop-blur-xl space-y-4 ${
            isDark 
              ? 'bg-[#111C2E]/90 border-slate-700/40 text-[#F1F5F9]' 
              : 'bg-white border-[#DCE5EC] text-[#172338] shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold tracking-tight font-display text-[var(--text-primary)]">
                  Sales Pipeline & Stage Conversion
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {stats.pipelineAdded} Pipeline Added across {leads.length} accounts
                </p>
              </div>

              <button
                onClick={() => onNavigate('pipeline')}
                className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Velocity Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1 font-medium">
                  <span>Stage 1: Discovery & Radar Ingestion</span>
                  <span className="font-mono tabular-nums text-[var(--text-primary)] font-bold">{leads.length} accounts</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-[#38BDF8] rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1 font-medium">
                  <span>Stage 2: AI Voice Decision-Maker Engagement</span>
                  <span className="font-mono tabular-nums text-[var(--text-primary)] font-bold">{stats.humanConnects} connects</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-[#0D9488] rounded-full" 
                    style={{ width: `${Math.round((stats.humanConnects / Math.max(1, leads.length)) * 100)}%` }} 
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1 font-medium">
                  <span>Stage 3: Manager Warm Handoff & Complimentary Audits</span>
                  <span className="font-mono tabular-nums text-[var(--text-primary)] font-bold">{warmTransfers.length} bridged</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-[#2563EB] rounded-full" 
                    style={{ width: `${Math.round((warmTransfers.length / Math.max(1, leads.length)) * 100)}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right 1 Col: Supporting Zone (Telephony Status, Warm Transfers, Approvals, Autonomous Fleet) */}
        <div className="space-y-5">
          
          {/* Dedicated Telephony Status: Current SIP Gateway & WhatsApp Link Status */}
          <TelephonyStatusCard 
            settings={settings}
            onOpenSettings={onOpenSettings}
          />

          {/* Live Warm Transfers */}
          <div className={`p-5 rounded-2xl border backdrop-blur-xl space-y-3 ${
            isDark 
              ? 'bg-[#111C2E]/90 border-slate-700/40 text-[#F1F5F9]' 
              : 'bg-white border-[#DCE5EC] text-[#172338] shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PhoneForwarded className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-sm text-[var(--text-primary)]">Live Warm Transfers</h3>
              </div>

              <button
                onClick={() => onNavigate('briefing')}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer font-medium"
              >
                Briefing →
              </button>
            </div>

            <div className="space-y-2.5">
              {warmTransfers.length === 0 ? (
                <div className="py-6 text-center text-xs text-[var(--text-secondary)]">
                  No warm transfers bridged yet today.
                </div>
              ) : (
                warmTransfers.slice(0, 3).map((record) => (
                  <div 
                    key={record.id}
                    className={`p-3 rounded-xl border text-xs space-y-1.5 transition ${
                      isDark 
                        ? 'bg-slate-900/60 border-slate-700/40' 
                        : 'bg-[#F8FAFC] border-[#DCE5EC]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--text-primary)]">{record.leadName}</span>
                      <span className="text-[10px] font-mono text-teal-700 dark:text-teal-400 font-semibold">{record.bridgedAt}</span>
                    </div>
                    <div className="text-[var(--text-secondary)] text-[11px]">{record.practiceName} · {record.phone}</div>
                    <div className="text-[11px] text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800/40 font-semibold">
                      Outcome: {record.outcome}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Tasks & Approvals Queue */}
          <div className={`p-5 rounded-2xl border backdrop-blur-xl space-y-3 ${
            isDark 
              ? 'bg-[#111C2E]/90 border-slate-700/40 text-[#F1F5F9]' 
              : 'bg-white border-[#DCE5EC] text-[#172338] shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="font-bold text-sm text-[var(--text-primary)]">Action Items & Due Tasks</h3>
              </div>

              <button
                onClick={() => onNavigate('reminders')}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer font-medium"
              >
                All Tasks →
              </button>
            </div>

            <div className="space-y-2">
              {pendingTasks.length === 0 ? (
                <div className="py-6 text-center text-xs text-[var(--text-secondary)]">
                  All action items completed. No pending approvals.
                </div>
              ) : (
                pendingTasks.slice(0, 4).map((task) => (
                  <div 
                    key={task.id}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 transition ${
                      isDark 
                        ? 'bg-slate-900/60 border-slate-700/40' 
                        : 'bg-[#F8FAFC] border-[#DCE5EC]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-[var(--text-primary)] truncate">{task.task}</div>
                      <div className="text-[10px] text-[var(--text-secondary)] font-mono mt-0.5">
                        Due: {task.due} · {task.priority} Priority
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="p-1.5 rounded-lg border border-teal-500/40 bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 transition cursor-pointer shrink-0"
                      title="Mark Completed"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Autonomous Fleet Guardrails Status */}
          <div className={`p-5 rounded-2xl border backdrop-blur-xl space-y-3 ${
            isDark 
              ? 'bg-[#111C2E]/90 border-slate-700/40 text-[#F1F5F9]' 
              : 'bg-white border-[#DCE5EC] text-[#172338] shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <h3 className="font-bold text-sm text-[var(--text-primary)]">Autonomous Fleet</h3>
              </div>

              <button
                onClick={() => onNavigate('ai_agents')}
                className="text-xs text-violet-700 dark:text-violet-400 hover:underline font-semibold cursor-pointer"
              >
                Guardrails →
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-slate-900/60 border-slate-700/40' : 'bg-[#F8FAFC] border-[#DCE5EC]'
              }`}>
                <div>
                  <div className="font-bold text-[var(--text-primary)]">Skiper Radar Scraper</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">Registry specialty discovery</div>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">ACTIVE</span>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-slate-900/60 border-slate-700/40' : 'bg-[#F8FAFC] border-[#DCE5EC]'
              }`}>
                <div>
                  <div className="font-bold text-[var(--text-primary)]">Zoey Telephony Caller</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">Inbound & outbound telephony</div>
                </div>
                <span className="text-[10px] font-mono text-teal-700 dark:text-teal-400 font-bold">READY</span>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-slate-900/60 border-slate-700/40' : 'bg-[#F8FAFC] border-[#DCE5EC]'
              }`}>
                <div>
                  <div className="font-bold text-[var(--text-primary)]">PST Executive Dispatcher</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">Automated 4:00 PM briefing</div>
                </div>
                <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-bold">4:00 PM</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
