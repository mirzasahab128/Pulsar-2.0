import React, { useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  PieChart as PieChartIcon, 
  Filter, 
  X, 
  Sparkles, 
  TrendingUp, 
  PhoneCall, 
  ShieldCheck, 
  Activity,
  CheckCircle2,
  PhoneForwarded,
  Clock,
  Voicemail,
  XCircle,
  BarChart2
} from 'lucide-react';
import { RCMLead } from '../types';

interface LeadStatusPieChartProps {
  leads: RCMLead[];
  activeStatusFilter: string;
  onSelectStatusFilter: (status: string) => void;
}

// Color palette specifically matched to Pulsar green, blue, and white design system
export const STATUS_CHART_COLORS: Record<string, { fill: string; border: string; text: string; bg: string; icon: string }> = {
  'Ready for Call': { fill: '#64748b', border: '#94a3b8', text: 'text-slate-300', bg: 'bg-slate-800/80', icon: 'phone' },
  'Calling': { fill: '#059669', border: '#10b981', text: 'text-emerald-300', bg: 'bg-emerald-500/20', icon: 'radio' },
  'Transferred to Manager': { fill: '#10b981', border: '#34d399', text: 'text-emerald-300', bg: 'bg-emerald-500/20', icon: 'phone-forwarded' },
  'Audit Scheduled': { fill: '#2563eb', border: '#60a5fa', text: 'text-blue-300', bg: 'bg-blue-500/20', icon: 'check-circle' },
  'Follow-up': { fill: '#0284c7', border: '#38bdf8', text: 'text-sky-300', bg: 'bg-sky-500/20', icon: 'clock' },
  'Voicemail': { fill: '#0d9488', border: '#14b8a6', text: 'text-teal-300', bg: 'bg-teal-500/20', icon: 'voicemail' },
  'Not Interested': { fill: '#475569', border: '#64748b', text: 'text-slate-400', bg: 'bg-slate-700/30', icon: 'x-circle' },
  'Contacted': { fill: '#06b6d4', border: '#22d3ee', text: 'text-cyan-300', bg: 'bg-cyan-500/20', icon: 'activity' }
};

export const LeadStatusPieChart: React.FC<LeadStatusPieChartProps> = ({
  leads,
  activeStatusFilter,
  onSelectStatusFilter
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Group leads by status
  const totalCount = leads.length;

  const statusCounts: Record<string, { count: number; volumeSum: number }> = {};
  leads.forEach(l => {
    const st = l.status || 'Ready for Call';
    if (!statusCounts[st]) {
      statusCounts[st] = { count: 0, volumeSum: 0 };
    }
    statusCounts[st].count += 1;

    // Parse claim volume
    const match = l.monthlyClaimVolume?.replace(/,/g, '').match(/\$(\d+)/);
    if (match) {
      statusCounts[st].volumeSum += parseInt(match[1], 10);
    } else {
      statusCounts[st].volumeSum += 350000;
    }
  });

  // Prepare data array for Recharts
  const chartData = Object.entries(statusCounts)
    .map(([statusName, data]) => {
      const colorMeta = STATUS_CHART_COLORS[statusName] || { 
        fill: '#8b5cf6', 
        border: '#a78bfa', 
        text: 'text-purple-300', 
        bg: 'bg-purple-500/20',
        icon: 'activity'
      };
      const percentage = totalCount > 0 ? Math.round((data.count / totalCount) * 100) : 0;
      return {
        name: statusName,
        value: data.count,
        volumeSum: data.volumeSum,
        percentage,
        color: colorMeta.fill,
        borderColor: colorMeta.border,
        colorMeta
      };
    })
    .sort((a, b) => b.value - a.value);

  // Metrics: High-priority leads (Audit Scheduled + Transferred)
  const auditsCount = statusCounts['Audit Scheduled']?.count || 0;
  const transferredCount = statusCounts['Transferred to Manager']?.count || 0;
  const followUpCount = statusCounts['Follow-up']?.count || 0;
  const highIntentTotal = auditsCount + transferredCount;
  const conversionRate = totalCount > 0 ? Math.round((highIntentTotal / totalCount) * 100) : 0;

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 rounded-xl bg-slate-950/95 border border-white/20 shadow-2xl backdrop-blur-md text-xs space-y-1 z-50">
          <div className="flex items-center gap-2 border-b border-white/10 pb-1">
            <span 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ backgroundColor: data.color }} 
            />
            <span className="font-bold text-white text-sm">{data.name}</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-300 pt-1">
            <span>Accounts:</span>
            <strong className="text-white font-mono">{data.value} leads ({data.percentage}%)</strong>
          </div>
          <div className="flex justify-between gap-4 text-slate-300">
            <span>Billing Pipeline:</span>
            <span className="text-emerald-400 font-mono font-semibold">
              ${((data.volumeSum || 0) / 1000).toLocaleString()}k / mo
            </span>
          </div>
          <div className="text-[10px] text-teal-300 pt-1 italic font-mono">
            Click slice to filter directory
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl glass-card border border-white/10 bg-slate-950/70 shadow-2xl relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold uppercase tracking-wider mb-1">
            <PieChartIcon className="w-3 h-3 text-emerald-400" />
            Lead Status Distribution & Funnel Velocity
          </div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Sales Pipeline Status Distribution</span>
            {activeStatusFilter !== 'All' && (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                Filtered: {activeStatusFilter}
              </span>
            )}
          </h3>
        </div>

        {/* Status filter clear button */}
        {activeStatusFilter !== 'All' && (
          <button
            type="button"
            onClick={() => onSelectStatusFilter('All')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-semibold transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Status Filter ({activeStatusFilter})</span>
          </button>
        )}
      </div>

      {/* Main Chart & Funnel Breakdown Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 pt-4 items-center">
        
        {/* Left Column: Recharts Interactive Donut / Pie (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-full h-56 sm:h-64 flex items-center justify-center">
            
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  cursor="pointer"
                  onClick={(entry) => {
                    if (entry && entry.name) {
                      onSelectStatusFilter(activeStatusFilter === entry.name ? 'All' : entry.name);
                    }
                  }}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {chartData.map((entry, index) => {
                    const isSelected = activeStatusFilter.toLowerCase() === entry.name.toLowerCase();
                    const isHovered = activeIndex === index;
                    return (
                      <Cell
                        key={`cell-${entry.name}-${index}`}
                        fill={entry.color}
                        stroke={isSelected ? '#ffffff' : entry.borderColor}
                        strokeWidth={isSelected || isHovered ? 2.5 : 1}
                        style={{
                          filter: isSelected || isHovered ? `drop-shadow(0 0 8px ${entry.color})` : 'none',
                          transition: 'all 0.2s ease',
                          opacity: activeStatusFilter === 'All' || isSelected ? 1 : 0.4
                        }}
                      />
                    );
                  })}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-2xl font-black text-white font-mono tracking-tight">
                {totalCount}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Total Leads
              </span>
              <span className="text-[11px] text-emerald-400 font-bold font-mono mt-0.5">
                {conversionRate}% Hot Intent
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center italic mt-1">
            Click any segment or status card below to filter the directory table
          </div>
        </div>

        {/* Right Column: Status Cards & Metrics Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-blue-500/20">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Audits Booked:</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-lg font-black text-blue-300 font-mono">{auditsCount}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {totalCount > 0 ? Math.round((auditsCount / totalCount) * 100) : 0}% of list
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/20">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <PhoneForwarded className="w-3.5 h-3.5 text-emerald-400" />
                <span>Transferred:</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-lg font-black text-emerald-300 font-mono">{transferredCount}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {totalCount > 0 ? Math.round((transferredCount / totalCount) * 100) : 0}% of list
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/20">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Follow-ups:</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-lg font-black text-cyan-300 font-mono">{followUpCount}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {totalCount > 0 ? Math.round((followUpCount / totalCount) * 100) : 0}% of list
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Status Distribution Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[170px] overflow-y-auto pr-1">
            {chartData.map((item) => {
              const isSelected = activeStatusFilter.toLowerCase() === item.name.toLowerCase();
              return (
                <div
                  key={item.name}
                  onClick={() => onSelectStatusFilter(isSelected ? 'All' : item.name)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected 
                      ? 'border-white/40 ring-2 ring-white/20 bg-slate-800' 
                      : 'border-white/10 bg-slate-900/60 hover:bg-slate-800/80'
                  }`}
                  style={{
                    borderLeftColor: item.color,
                    borderLeftWidth: '4px'
                  }}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{item.name}</span>
                      {isSelected && (
                        <span className="text-[10px] px-1 rounded bg-teal-500 text-slate-950 font-bold">
                          Filtered
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      ${((item.volumeSum || 0) / 1000).toFixed(0)}k volume
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black font-mono text-white block">
                      {item.value} <span className="text-[10px] text-slate-400 font-normal">({item.percentage}%)</span>
                    </span>
                    {/* Small progress bar */}
                    <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${item.percentage}%`,
                          backgroundColor: item.color
                        }} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
};
