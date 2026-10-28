import React from 'react';
import { TrainingRecord } from '../types/agentflow';
import { X, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

interface ScoreBreakdownModalProps {
  record: TrainingRecord | null;
  onClose: () => void;
}

export const ScoreBreakdownModal: React.FC<ScoreBreakdownModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  const { score_breakdown, quality_score, status, rejection_reason } = record;

  const getBarColor = (score: number) => {
    if (score >= 4.0) return 'bg-emerald-600';
    if (score >= 3.0) return 'bg-amber-500';
    return 'bg-rose-600';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Automated Quality Evaluation
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Record ID: {record.id}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Status banner */}
          <div
            className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
              status === 'accepted'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {status === 'accepted' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold">
                Status: {status === 'accepted' ? 'Accepted for Dataset' : 'Rejected'}
              </div>
              {rejection_reason && (
                <div className="mt-0.5 text-[11px] opacity-90">{rejection_reason}</div>
              )}
            </div>
          </div>

          {/* Overall score */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <div className="text-xs font-semibold text-slate-700">Composite Quality Score</div>
              <div className="text-[11px] text-slate-500">Weighted heuristic combination</div>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {quality_score.toFixed(1)} <span className="text-sm font-normal text-slate-400">/ 5.0</span>
            </div>
          </div>

          {/* Sub-scores */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Evaluation Dimensions
            </h4>

            {/* Relevance */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">Topical Relevance</span>
                <span className="font-mono font-semibold text-slate-900">{score_breakdown.relevance.toFixed(1)} / 5.0</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getBarColor(score_breakdown.relevance)}`}
                  style={{ width: `${(score_breakdown.relevance / 5.0) * 100}%` }}
                />
              </div>
            </div>

            {/* Completeness */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">Answer Completeness & Structure</span>
                <span className="font-mono font-semibold text-slate-900">{score_breakdown.completeness.toFixed(1)} / 5.0</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getBarColor(score_breakdown.completeness)}`}
                  style={{ width: `${(score_breakdown.completeness / 5.0) * 100}%` }}
                />
              </div>
            </div>

            {/* Consistency */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">Consistency with Source Material</span>
                <span className="font-mono font-semibold text-slate-900">{score_breakdown.consistency.toFixed(1)} / 5.0</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getBarColor(score_breakdown.consistency)}`}
                  style={{ width: `${(score_breakdown.consistency / 5.0) * 100}%` }}
                />
              </div>
            </div>

            {/* Clarity */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">Linguistic Clarity & Punctuation</span>
                <span className="font-mono font-semibold text-slate-900">{score_breakdown.clarity.toFixed(1)} / 5.0</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getBarColor(score_breakdown.clarity)}`}
                  style={{ width: `${(score_breakdown.clarity / 5.0) * 100}%` }}
                />
              </div>
            </div>

            {/* Duplicate check */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-700">
              <span>Duplicate / Near-Match Status:</span>
              <span className={`font-mono font-semibold ${score_breakdown.isDuplicate ? 'text-rose-600' : 'text-emerald-700'}`}>
                {score_breakdown.isDuplicate
                  ? `Duplicate (${Math.round(score_breakdown.duplicateScore * 100)}% match)`
                  : 'Unique (Passed Deduplication)'}
              </span>
            </div>
          </div>

          {/* Explanation rationale */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <span className="font-semibold text-slate-800">Automated Reasoning:</span>
            <p className="text-slate-600">{score_breakdown.explanation}</p>
          </div>

          {/* Verification boundary notice */}
          <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-amber-50/60 p-2.5 rounded border border-amber-200/60">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Notice:</strong> This automated score is generated via algorithmic heuristics. It does not constitute human subject-matter verification. All critical training sets should undergo human-in-the-loop audit before fine-tuning.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
