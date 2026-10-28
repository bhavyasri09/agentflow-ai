import React from 'react';
import { DifficultyLevel, GenerationSettings, PipelineStep } from '../types/agentflow';
import { Settings, Sparkles } from 'lucide-react';

interface SidebarProps {
  settings: GenerationSettings;
  onUpdateSettings: (newSettings: Partial<GenerationSettings>) => void;
  onGenerate: () => void;
  pipelineStep: PipelineStep;
  onOpenSettings: () => void;
}

const TOPIC_PRESETS = [
  'Agentic AI Architectures & Tool Use',
  'Post-Quantum Cryptography in FinTech',
  'Retrieval-Augmented Generation (RAG) Evaluation',
  'Autonomous Drone Navigation in GPS-Denied Environments',
  'Distributed Consensus in Raft vs Paxos',
];

const LANGUAGES = [
  { code: 'English', label: 'English (US/UK)' },
  { code: 'Spanish', label: 'Spanish (Español)' },
  { code: 'French', label: 'French (Français)' },
  { code: 'German', label: 'German (Deutsch)' },
  { code: 'Japanese', label: 'Japanese (日本語)' },
  { code: 'Chinese', label: 'Chinese (Simplified)' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  settings,
  onUpdateSettings,
  onGenerate,
  pipelineStep,
  onOpenSettings,
}) => {
  const isRunning =
    pipelineStep === 'researching' ||
    pipelineStep === 'generating' ||
    pipelineStep === 'evaluating' ||
    pipelineStep === 'cleaning';

  return (
    <aside className="w-full lg:w-80 shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col h-auto lg:h-[calc(100vh-65px)] overflow-y-auto">
      <div className="p-5 space-y-6">
        {/* Research Topic */}
        <div>
          <label htmlFor="topic-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Research Topic
          </label>
          <textarea
            id="topic-input"
            rows={3}
            value={settings.topic}
            onChange={(e) => onUpdateSettings({ topic: e.target.value })}
            placeholder="e.g., Evaluation metrics for multi-hop RAG pipelines"
            className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors bg-white resize-none"
            disabled={isRunning}
          />
          
          {/* Quick presets */}
          <div className="mt-2.5">
            <span className="text-[11px] font-medium text-slate-500 block mb-1.5">Suggested Curated Topics:</span>
            <div className="flex flex-wrap gap-1.5">
              {TOPIC_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onUpdateSettings({ topic: preset })}
                  disabled={isRunning}
                  className="text-[11px] text-left px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors disabled:opacity-50"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dataset Size (Count) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="qa-count" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Target Q&A Pairs
            </label>
            <span className="text-xs font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
              {settings.count} pairs
            </span>
          </div>
          <input
            id="qa-count"
            type="range"
            min={4}
            max={20}
            step={2}
            value={settings.count}
            onChange={(e) => onUpdateSettings({ count: parseInt(e.target.value, 10) })}
            disabled={isRunning}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900 disabled:opacity-50"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
            <span>4 min</span>
            <span>12 typical</span>
            <span>20 max</span>
          </div>
        </div>

        {/* Difficulty Level */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
            {(['Beginner', 'Intermediate', 'Advanced'] as DifficultyLevel[]).map((level) => {
              const active = settings.difficulty === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => onUpdateSettings({ difficulty: level })}
                  disabled={isRunning}
                  className={`py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  } disabled:opacity-50`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* Output Language */}
        <div>
          <label htmlFor="language-select" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Output Language
          </label>
          <select
            id="language-select"
            value={settings.language}
            onChange={(e) => onUpdateSettings({ language: e.target.value })}
            disabled={isRunning}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-50"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Number of Web Sources */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="num-sources" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Web Sources to Retrieve
            </label>
            <span className="text-xs font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
              {settings.numSources} sources
            </span>
          </div>
          <input
            id="num-sources"
            type="range"
            min={2}
            max={6}
            step={1}
            value={settings.numSources}
            onChange={(e) => onUpdateSettings({ numSources: parseInt(e.target.value, 10) })}
            disabled={isRunning}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900 disabled:opacity-50"
          />
        </div>

        {/* Quality Threshold */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="quality-threshold" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Quality Acceptance Threshold
            </label>
            <span className="text-xs font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
              ≥ {settings.qualityThreshold.toFixed(1)} / 5.0
            </span>
          </div>
          <input
            id="quality-threshold"
            type="range"
            min={2.0}
            max={4.5}
            step={0.1}
            value={settings.qualityThreshold}
            onChange={(e) => onUpdateSettings({ qualityThreshold: parseFloat(e.target.value) })}
            disabled={isRunning}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900 disabled:opacity-50"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Pairs scoring below this threshold are automatically routed to the Rejected tab.
          </p>
        </div>

        {/* Main Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onGenerate}
            disabled={isRunning || !settings.topic.trim()}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isRunning ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Processing Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate Dataset</span>
              </>
            )}
          </button>
        </div>

        {/* Secondary Utility Actions */}
        <div className="pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-full text-xs font-medium py-2 px-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>API Keys & Model Settings</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {settings.nebiusApiKey ? 'Nebius Active' : 'Demo Active'}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};
