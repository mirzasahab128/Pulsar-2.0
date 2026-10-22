import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, PhoneCall } from 'lucide-react';
import { RCMLead, WarmTransferRecord, ActionItem } from '../types';
import { useTheme } from '../context/ThemeContext';
import { apiService, DashboardStatsResponse } from '../services/api';

interface DashboardProgressProps {
  leads: RCMLead[];
  tasks: ActionItem[];
  warmTransfers: WarmTransferRecord[];
}

type RangeKey = '7d' | '30d' | '90d';

const OUTCOME_COLORS: Record<string, string> = {
  answered: '#10B981',
  voicemail: '#F59E0B',
  no_answer: '#64748B',
  callback_booked: '#06B6D4'
};

function toIsoOrNull(v?: string | null): string | null {
  if (!v) return null;
  const t = Date.parse(v);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

/**
 * Phases 1–3 (Part 2) — one-screen progress layer for the Dashboard.
 *
 * All figures come from GET /api/dashboard/stats, which aggregates the
 * workspace's real records server-side. This component first syncs the
 * records the app actually holds (leads, tasks, and Call Studio sessions
 * derived from warm transfers + lead outcomes) to POST /api/dashboard/
 * snapshot, then renders the aggregated result. Nothing is fabricated:
 * an empty workspace renders zeros and empty states.
 */
export const DashboardProgress: React.FC<DashboardProgressProps> = ({ leads, tasks, warmTransfers }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [range, setRange] = useState<RangeKey>('30d');
  const [data, setData] = useState<DashboardStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const snapshotPayload = useMemo(() => {
    const callSessions: Array<{ at: string; outcome: string }> = [];
    for (const wt of warmTransfers) {
      const at = toIsoOrNull(wt.bridgedAt);
      if (at) callSessions.push({ at, outcome: 'answered' });
    }
    for (const lead of leads) {
      const at = toIsoOrNull(lead.lastContacted || undefined);
      if (!at) continue;
      if (lead.status === 'Voicemail') callSessions.push({ at, outcome: 'voicemail' });
      if (lead.status === 'Audit Scheduled') callSessions.push({ at, outcome: 'callback_booked' });
    }
    return {
      leads: leads.map(l => ({
        id: l.id,
        status: l.status,
        createdAt: (l as any).createdAt ?? null,
        lastContacted: toIsoOrNull(l.lastContacted || undefined)
      })),
      tasks: tasks.map(t => ({
        id: t.id,
        dueAt: toIsoOrNull(t.scheduledDateTime || t.due),
        completed: t.completed,
        completedAt: t.completedAt ?? null
      })),
      callSessions
    };
  }, [leads, tasks, warmTransfers]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        await apiService.syncDashboardSnapshot(snapshotPayload);
        const stats = await apiService.getDashboardStats(range);
        if (!cancelled) setData(stats);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Could not load dashboard stats');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [snapshotPayload, range]);

  const cardCls = `rounded-2xl border backdrop-blur-xl p-4 ${
    isDark ? 'bg-[#111C2E]/90 border-slate-700/40 text-[#F1F5F9]' : 'bg-white/95 border-[#DCE5EC] text-[#172338] shadow-sm'
  }`;
  const axisColor = isDark ? '#94A3B8' : '#64748B';
  const gridColor = isDark ? 'rgba(148,163,184,0.15)' : 'rgba(100,116,139,0.15)';

  const kpiDefs: Array<{ key: string; label: string }> = [
    { key: 'totalLeads', label: 'Total Leads' },
    { key: 'qualifiedLeads', label: 'Qualified Leads' },
    { key: 'activeCampaigns', label: 'Active Campaigns' },
    { key: 'outreachSent', label: 'Outreach Sent' },
    { key: 'outreachReplies', label: 'Outreach Replies' },
    { key: 'callsMade', label: 'Calls (Call Studio)' },
    { key: 'meetingsBooked', label: 'Meetings Booked' },
    { key: 'tasksDueToday', label: 'Tasks Due Today' },
    { key: 'tasksOverdue', label: 'Tasks Overdue' }
  ];

  const stats = data?.stats;
  const hasAnyData = !!stats && (
    stats.kpis.totalLeads.value > 0 ||
    stats.campaignPerformance.length > 0 ||
    stats.callActivity.perDay.some(d => d.count > 0)
  );

  const renderDelta = (delta: number | null) => {
    if (delta === null || delta === undefined) {
      return <span className="flex items-center gap-1 text-slate-500"><Minus className="w-3 h-3" /> —</span>;
    }
    if (delta > 0) {
      return <span className="flex items-center gap-1 text-emerald-500"><TrendingUp className="w-3 h-3" /> +{delta}</span>;
    }
    if (delta < 0) {
      return <span className="flex items-center gap-1 text-rose-500"><TrendingDown className="w-3 h-3" /> {delta}</span>;
    }
    return <span className="flex items-center gap-1 text-slate-500"><Minus className="w-3 h-3" /> 0</span>;
  };

  return (
    <section className="space-y-4">
      {/* Header + range switch */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-teal-500" /> Progress — all in one screen
        </h3>
        <div className={`inline-flex items-center gap-1 p-1 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-700/40' : 'bg-slate-100/80 border-slate-200'}`}>
          {(['7d', '30d', '90d'] as RangeKey[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                range === r ? 'bg-[#0D9488] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className={`${cardCls} text-xs text-rose-500`}>
          Dashboard stats could not be loaded: {error}
        </div>
      )}

      {loading && !stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`${cardCls} animate-pulse h-20`} />
          ))}
        </div>
      )}

      {stats && (
        <>
          {!hasAnyData && (
            <div className={`${cardCls} text-xs text-slate-500`}>
              No activity recorded for this workspace yet. Panels below show real zeros — as leads, campaigns,
              Call Studio sessions, and tasks are recorded, they will appear here.
            </div>
          )}

          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            {kpiDefs.map(def => {
              const kpi = stats.kpis[def.key];
              return (
                <div key={def.key} className={cardCls}>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{def.label}</div>
                  <div className="flex items-end justify-between mt-1">
                    <span className="text-2xl font-extrabold tabular-nums">{kpi?.value ?? 0}</span>
                    <span className="text-[11px] font-semibold">{renderDelta(kpi?.delta ?? null)}</span>
                  </div>
                  {kpi?.newInRange !== null && kpi?.newInRange !== undefined && (
                    <div className="text-[10px] text-slate-500 mt-0.5">+{kpi.newInRange} in range</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Charts grid */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className={cardCls}>
              <div className="text-xs font-bold mb-2">Lead Pipeline Funnel</div>
              {stats.funnel.every(f => f.count === 0) ? (
                <div className="h-[220px] flex items-center justify-center text-xs text-slate-500">No leads yet — the funnel is empty.</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.funnel} layout="vertical" margin={{ left: 24, right: 12 }}>
                    <CartesianGrid stroke={gridColor} horizontal={false} />
                    <XAxis type="number" tick={{ fill: axisColor, fontSize: 11 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="stage" width={130} tick={{ fill: axisColor, fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0D9488" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className={cardCls}>
              <div className="text-xs font-bold mb-2">Leads Over Time</div>
              {stats.leadsOverTime.every(d => d.count === 0) ? (
                <div className="h-[220px] flex items-center justify-center text-xs text-slate-500">No dated leads in this range yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={stats.leadsOverTime} margin={{ left: 0, right: 12 }}>
                    <CartesianGrid stroke={gridColor} />
                    <XAxis dataKey="date" tick={{ fill: axisColor, fontSize: 10 }} minTickGap={24} />
                    <YAxis tick={{ fill: axisColor, fontSize: 11 }} allowDecimals={false} width={32} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.25} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className={cardCls}>
              <div className="text-xs font-bold mb-2">Campaign Performance</div>
              {stats.campaignPerformance.length === 0 ? (
                <div className="h-[220px] flex items-center justify-center text-xs text-slate-500">No campaigns recorded yet. Open Campaigns once to sync its real counters.</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.campaignPerformance} margin={{ left: 0, right: 12 }}>
                    <CartesianGrid stroke={gridColor} />
                    <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 10 }} interval={0} angle={-12} textAnchor="end" height={48} />
                    <YAxis tick={{ fill: axisColor, fontSize: 11 }} allowDecimals={false} width={32} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="sent" fill="#0D9488" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="opened" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="replied" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className={cardCls}>
              <div className="text-xs font-bold mb-1 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-cyan-500" /> Call Activity &amp; Outcomes
              </div>
              {/* Honest caption: Call Studio sessions are simulated in-browser,
                  not carrier/PSTN calls (prompt Part 2 §5). */}
              <div className="text-[10px] text-slate-500 mb-2">
                {stats.callActivity.caption} — sessions recorded in the app (simulated in-browser; not carrier calls).
              </div>
              {stats.callActivity.perDay.every(d => d.count === 0) ? (
                <div className="h-[196px] flex items-center justify-center text-xs text-slate-500">No Call Studio sessions in this range.</div>
              ) : (
                <div className="grid grid-cols-[1fr_140px] gap-2 items-center">
                  <ResponsiveContainer width="100%" height={196}>
                    <BarChart data={stats.callActivity.perDay} margin={{ left: 0, right: 8 }}>
                      <CartesianGrid stroke={gridColor} />
                      <XAxis dataKey="date" tick={{ fill: axisColor, fontSize: 10 }} minTickGap={24} />
                      <YAxis tick={{ fill: axisColor, fontSize: 11 }} allowDecimals={false} width={28} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <ResponsiveContainer width="100%" height={196}>
                    <PieChart>
                      <Pie
                        data={stats.callActivity.outcomes.filter(o => o.count > 0)}
                        dataKey="count"
                        nameKey="outcome"
                        innerRadius={34}
                        outerRadius={56}
                        paddingAngle={2}
                      >
                        {stats.callActivity.outcomes.filter(o => o.count > 0).map(o => (
                          <Cell key={o.outcome} fill={OUTCOME_COLORS[o.outcome] || '#94A3B8'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="flex flex-wrap gap-3 mt-1">
                {stats.callActivity.outcomes.map(o => (
                  <span key={o.outcome} className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span className="w-2 h-2 rounded-full" style={{ background: OUTCOME_COLORS[o.outcome] || '#94A3B8' }} />
                    {o.outcome.replace('_', ' ')}: <strong className="tabular-nums">{o.count}</strong>
                  </span>
                ))}
              </div>
            </div>

            <div className={`${cardCls} lg:col-span-2`}>
              <div className="text-xs font-bold mb-2">Follow-up Health</div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Due today</div>
                  <div className="text-xl font-extrabold tabular-nums">{stats.followUpHealth.dueToday}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Overdue</div>
                  <div className="text-xl font-extrabold tabular-nums text-rose-500">{stats.followUpHealth.overdue}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Completed in range</div>
                  <div className="text-xl font-extrabold tabular-nums text-emerald-500">{stats.followUpHealth.completedInRange}</div>
                </div>
              </div>
              {stats.followUpHealth.completedSeries.every(d => d.completed === 0) ? (
                <div className="h-[120px] flex items-center justify-center text-xs text-slate-500">No completed tasks with completion dates in this range.</div>
              ) : (
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={stats.followUpHealth.completedSeries} margin={{ left: 0, right: 12 }}>
                    <CartesianGrid stroke={gridColor} />
                    <XAxis dataKey="date" tick={{ fill: axisColor, fontSize: 10 }} minTickGap={24} />
                    <YAxis tick={{ fill: axisColor, fontSize: 11 }} allowDecimals={false} width={28} />
                    <Tooltip />
                    <Bar dataKey="completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {stats.snapshotUpdatedAt && (
            <div className="text-[10px] text-slate-500">
              Aggregated server-side from workspace records synced {new Date(stats.snapshotUpdatedAt).toLocaleString()}.
            </div>
          )}
        </>
      )}
    </section>
  );
};
