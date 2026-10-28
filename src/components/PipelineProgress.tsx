import React from 'react';
import { PipelineStep } from '../types/agentflow';
import { Search, Brain, CheckSquare, Sparkles, Download, Check } from 'lucide-react';

interface PipelineProgressProps {
  currentStep: PipelineStep;
  error?: string;
}

interface StepDef {
  key: PipelineStep;
  name: string;
  desc: string;
  icon: React.ElementType;
}

const STEPS: StepDef[] = [
  { key: 'researching', name: 'Web Research', desc: 'Tavily Search API', icon: Search },
  { key: 'generating', name: 'AI Generation', desc: 'Nebius Model Synthesis', icon: Brain },
  { key: 'evaluating', name: 'Quality Evaluation', desc: '5-Dimensional Scoring', icon: CheckSquare },
  { key: 'cleaning', name: 'Data Cleaning', desc: 'Deduplication & Normalization', icon: Sparkles },
  { key: 'complete', name: 'Dataset Ready', desc: 'JSONL / CSV Export', icon: Download },
];

export const PipelineProgress: React.FC<PipelineProgressProps> = ({ currentStep, error }) => {
  const getStepIndex = (step: PipelineStep): number => {
    switch (step) {
      case 'researching':
        return 0;
      case 'generating':
        return 1;
      case 'evaluating':
        return 2;
      case 'cleaning':
        return 3;
      case 'complete':
        return 4;
      default:
        return -1;
    }
  };

  const activeIdx = getStepIndex(currentStep);

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-3.5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Step indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 w-full">
          {STEPS.map((step, idx) => {
            const isCompleted = activeIdx > idx || currentStep === 'complete';
            const isCurrent = activeIdx === idx;
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-colors ${
                  isCurrent
                    ? 'border-slate-900 bg-slate-50'
                    : isCompleted
                    ? 'border-slate-200 bg-white text-slate-800'
                    : 'border-transparent bg-slate-50/50 text-slate-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center shrink-0 text-xs font-semibold ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <div className="min-w-0">
                  <div className={`text-xs font-semibold truncate ${isCurrent ? 'text-slate-900' : isCompleted ? 'text-slate-800' : 'text-slate-500'}`}>
                    {step.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate font-mono">
                    {step.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mt-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5 flex items-center justify-between">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
