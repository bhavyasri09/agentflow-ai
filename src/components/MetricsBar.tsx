import React from 'react';
import { PipelineMetrics } from '../types/agentflow';
import { CheckCircle2, XCircle, Copy, AlertTriangle, Star, Database } from 'lucide-react';

interface MetricsBarProps {
  metrics: PipelineMetrics;
  qualityThreshold: number;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ metrics, qualityThreshold }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 p-4 bg-white border-b border-slate-200">
      {/* Total Generated */}
      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider">Total Generated</span>
          <Database className="w-3.5 h-3.5" />
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
          {metrics.totalGenerated}
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">Raw candidate pairs</div>
      </div>

      {/* Accepted */}
      <div className="p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-lg">
        <div className="flex items-center justify-between text-emerald-800 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider">Accepted</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-emerald-700">
          {metrics.accepted}
        </div>
        <div className="text-[10px] text-emerald-600/80 mt-0.5">Passed quality & deduplication</div>
      </div>

      {/* Rejected */}
      <div className="p-3 bg-rose-50/50 border border-rose-200/80 rounded-lg">
        <div className="flex items-center justify-between text-rose-800 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider">Rejected</span>
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-rose-700">
          {metrics.rejected}
        </div>
        <div className="text-[10px] text-rose-600/80 mt-0.5">&lt; {qualityThreshold.toFixed(1)} score or flagged</div>
      </div>

      {/* Duplicates Removed */}
      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider">Duplicates</span>
          <Copy className="w-3.5 h-3.5" />
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
          {metrics.duplicatesRemoved}
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">Near & exact matches pruned</div>
      </div>

      {/* Malformed Records */}
      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider">Malformed</span>
          <AlertTriangle className="w-3.5 h-3.5" />
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
          {metrics.malformedRemoved}
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">Schema or empty faults</div>
      </div>

      {/* Average Quality Score */}
      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider">Avg Quality</span>
          <Star className="w-3.5 h-3.5 text-amber-500" />
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
          {metrics.avgQualityScore > 0 ? `${metrics.avgQualityScore.toFixed(1)} / 5.0` : '—'}
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">Automated heuristic rating</div>
      </div>
    </div>
  );
};
