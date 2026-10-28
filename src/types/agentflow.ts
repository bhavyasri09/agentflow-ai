/**
 * AgentFlow AI - Type Definitions
 * Data structures for web research, training pair generation, quality evaluation, cleaning, and export.
 */

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface ResearchSource {
  id: string;
  title: string;
  url: string;
  snippet: string;
  score?: number;
  isDemo?: boolean;
}

export interface QualityBreakdown {
  relevance: number;       // 1 - 5
  completeness: number;    // 1 - 5
  consistency: number;     // 1 - 5
  clarity: number;         // 1 - 5
  isDuplicate: boolean;
  duplicateScore: number;  // 0.0 - 1.0 (similarity)
  explanation: string;
}

export interface TrainingRecord {
  id: string;
  topic: string;
  difficulty: DifficultyLevel;
  question: string;
  answer: string;
  source_url: string;
  source_title?: string;
  quality_score: number;   // 1.0 - 5.0 composite
  score_breakdown: QualityBreakdown;
  status: 'accepted' | 'rejected';
  rejection_reason?: string;
  is_edited?: boolean;
  created_at: string;
}

export type PipelineStep =
  | 'idle'
  | 'researching'
  | 'generating'
  | 'evaluating'
  | 'cleaning'
  | 'complete'
  | 'error';

export interface PipelineMetrics {
  totalGenerated: number;
  accepted: number;
  rejected: number;
  duplicatesRemoved: number;
  malformedRemoved: number;
  avgQualityScore: number;
}

export interface GenerationSettings {
  topic: string;
  count: number;
  difficulty: DifficultyLevel;
  language: string;
  numSources: number;
  qualityThreshold: number; // 1.0 to 5.0
  nebiusApiKey: string;
  nebiusModel: string;
  nebiusBaseUrl?: string;
  tavilyApiKey: string;
  useDemoMode: boolean;
}
