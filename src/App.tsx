/**
 * AgentFlow AI - Automated AI Training Data Generator
 * Web Application Entry Point
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  GenerationSettings,
  PipelineMetrics,
  PipelineStep,
  ResearchSource,
  TrainingRecord,
} from './types/agentflow';
import { fetchWebResearch } from './services/research';
import { generateTrainingPairs } from './services/generator';
import { evaluateDataset } from './services/evaluator';
import { cleanDataset } from './services/dataCleaner';

import { Sidebar } from './components/Sidebar';
import { PipelineProgress } from './components/PipelineProgress';
import { MetricsBar } from './components/MetricsBar';
import { SourcesPanel } from './components/SourcesPanel';
import { DatasetTable } from './components/DatasetTable';
import { ScoreBreakdownModal } from './components/ScoreBreakdownModal';
import { ExportModal } from './components/ExportModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { Download } from 'lucide-react';

const INITIAL_SETTINGS: GenerationSettings = {
  topic: 'Retrieval-Augmented Generation (RAG) Evaluation',
  count: 8,
  difficulty: 'Intermediate',
  language: 'English',
  numSources: 4,
  qualityThreshold: 3.5,
  nebiusApiKey: '',
  nebiusModel: 'nvidia/Llama-3.1-Nemotron-70B-Instruct',
  nebiusBaseUrl: 'https://api.tokenfactory.us-central1.nebius.com/v1/',
  tavilyApiKey: '',
  useDemoMode: true,
};

export default function App() {
  const [settings, setSettings] = useState<GenerationSettings>(() => {
    // Restore saved settings or keys from localStorage if available
    try {
      const saved = localStorage.getItem('agentflow_settings');
      if (saved) {
        return { ...INITIAL_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return INITIAL_SETTINGS;
  });

  const [pipelineStep, setPipelineStep] = useState<PipelineStep>('idle');
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [isLiveSearch, setIsLiveSearch] = useState(false);

  const [acceptedRecords, setAcceptedRecords] = useState<TrainingRecord[]>([]);
  const [rejectedRecords, setRejectedRecords] = useState<TrainingRecord[]>([]);
  const [metrics, setMetrics] = useState<PipelineMetrics>({
    totalGenerated: 0,
    accepted: 0,
    rejected: 0,
    duplicatesRemoved: 0,
    malformedRemoved: 0,
    avgQualityScore: 0,
  });

  // Modals & Panels
  const [inspectedRecord, setInspectedRecord] = useState<TrainingRecord | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Save settings updates
  const handleUpdateSettings = useCallback((updated: Partial<GenerationSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem(
          'agentflow_settings',
          JSON.stringify({
            tavilyApiKey: next.tavilyApiKey,
            nebiusApiKey: next.nebiusApiKey,
            nebiusModel: next.nebiusModel,
            topic: next.topic,
            count: next.count,
            difficulty: next.difficulty,
            language: next.language,
            numSources: next.numSources,
            qualityThreshold: next.qualityThreshold,
          })
        );
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Main Pipeline Execution
  const executePipeline = useCallback(async () => {
    if (!settings.topic.trim()) return;

    setErrorMsg(undefined);

    try {
      // 1. Web Research
      setPipelineStep('researching');
      const researchResult = await fetchWebResearch(
        settings.topic,
        settings.numSources,
        settings.tavilyApiKey
      );
      setSources(researchResult.sources);
      setIsLiveSearch(researchResult.isLive);
      if (researchResult.error) {
        setErrorMsg(researchResult.error);
      }

      // Small pacing delay for visual clarity
      await new Promise((r) => setTimeout(r, 400));

      // 2. AI Data Generation
      setPipelineStep('generating');
      const genResult = await generateTrainingPairs(
        settings.topic,
        settings.count,
        settings.difficulty,
        settings.language,
        researchResult.sources,
        settings.nebiusApiKey,
        settings.nebiusModel,
        settings.nebiusBaseUrl
      );

      if (genResult.error && !errorMsg) {
        setErrorMsg(genResult.error);
      }

      await new Promise((r) => setTimeout(r, 400));

      // 3. Quality Evaluation (5-dimensional metrics)
      setPipelineStep('evaluating');
      const evalResult = evaluateDataset(
        genResult.records,
        settings.topic,
        researchResult.sources,
        settings.qualityThreshold
      );

      await new Promise((r) => setTimeout(r, 300));

      // 4. Data Cleaning (Deduplication, whitespace normalization, schema validation)
      setPipelineStep('cleaning');
      const cleanResult = cleanDataset(evalResult.evaluatedRecords, settings.qualityThreshold);

      setAcceptedRecords(cleanResult.cleanedRecords);
      setRejectedRecords(cleanResult.rejectedList);
      setMetrics(cleanResult.metrics);

      setPipelineStep('complete');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Pipeline error: ${msg}`);
      setPipelineStep('error');
    }
  }, [settings, errorMsg]);

  // Pre-populate initial dataset on first mount so user lands on an active, populated workspace
  useEffect(() => {
    executePipeline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Record CRUD Handlers
  const handleUpdateRecord = useCallback((updated: TrainingRecord) => {
    setAcceptedRecords((prev) =>
      prev.map((rec) => (rec.id === updated.id ? updated : rec))
    );
    setRejectedRecords((prev) =>
      prev.map((rec) => (rec.id === updated.id ? updated : rec))
    );
  }, []);

  const handleDeleteRecord = useCallback((id: string) => {
    setAcceptedRecords((prev) => prev.filter((r) => r.id !== id));
    setRejectedRecords((prev) => prev.filter((r) => r.id !== id));
    setMetrics((prev) => ({
      ...prev,
      accepted: prev.accepted > 0 ? prev.accepted - 1 : 0,
    }));
  }, []);

  const handleAddRecord = useCallback((newRecord: TrainingRecord) => {
    setAcceptedRecords((prev) => [newRecord, ...prev]);
    setMetrics((prev) => ({
      ...prev,
      accepted: prev.accepted + 1,
      totalGenerated: prev.totalGenerated + 1,
    }));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* Top Bar Contract: Zone 1 (Wordmark) — Zone 2 (4-5 Nav Links) — Zone 3 (1 Action) */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200 shrink-0">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="/"
          className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-slate-800 transition-colors"
        >
          AgentFlow AI
        </a>

        {/* Zone 2: 4 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <a
            href="#workspace"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Pipeline
          </a>
          <a
            href="#sources"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Sources ({sources.length})
          </a>
          <a
            href="#dataset"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Dataset ({acceptedRecords.length})
          </a>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            API Settings
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            disabled={acceptedRecords.length === 0}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Dataset ({acceptedRecords.length})</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div id="workspace" className="flex-1 flex flex-col lg:flex-row min-w-0">
        {/* Sidebar Configuration Panel */}
        <Sidebar
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onGenerate={executePipeline}
          pipelineStep={pipelineStep}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
          {/* Pipeline Progress Stages */}
          <PipelineProgress currentStep={pipelineStep} error={errorMsg} />

          {/* Quantitative Metrics Bar */}
          <MetricsBar metrics={metrics} qualityThreshold={settings.qualityThreshold} />

          {/* Retrieved Web Sources Accordion */}
          <SourcesPanel sources={sources} isLive={isLiveSearch} />

          {/* Interactive Dataset Table Explorer */}
          <DatasetTable
            acceptedRecords={acceptedRecords}
            rejectedRecords={rejectedRecords}
            onUpdateRecord={handleUpdateRecord}
            onDeleteRecord={handleDeleteRecord}
            onAddRecord={handleAddRecord}
            onRegenerate={executePipeline}
            onInspectScore={(rec) => setInspectedRecord(rec)}
            isProcessing={
              pipelineStep === 'researching' ||
              pipelineStep === 'generating' ||
              pipelineStep === 'evaluating' ||
              pipelineStep === 'cleaning'
            }
          />
        </main>
      </div>

      {/* Modals */}
      {inspectedRecord && (
        <ScoreBreakdownModal
          record={inspectedRecord}
          onClose={() => setInspectedRecord(null)}
        />
      )}

      {isExportOpen && (
        <ExportModal
          records={acceptedRecords}
          topic={settings.topic}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      {isSettingsOpen && (
        <ApiSettingsModal
          settings={settings}
          onSave={handleUpdateSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}
