/**
 * Evaluator Module - 5-Dimensional Quality Assessment and Threshold Filtering
 * Note: Automated quality assessments are heuristic model-based estimates and do not guarantee factual truth without human review.
 */
import { QualityBreakdown, ResearchSource, TrainingRecord } from '../types/agentflow';

export interface EvaluationResult {
  evaluatedRecords: TrainingRecord[];
  acceptedCount: number;
  rejectedCount: number;
  duplicateCount: number;
  averageScore: number;
}

/**
 * Tokenize string into normalized lowercase word set
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

/**
 * Calculate Jaccard similarity between two token arrays
 */
function calculateJaccardSimilarity(tokensA: string[], tokensB: string[]): number {
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  let intersectionCount = 0;

  for (const token of setA) {
    if (setB.has(token)) {
      intersectionCount++;
    }
  }

  const unionSize = setA.size + setB.size - intersectionCount;
  return unionSize > 0 ? intersectionCount / unionSize : 0;
}

/**
 * Measure relevance to topic (1.0 to 5.0)
 */
function evaluateRelevance(question: string, answer: string, topic: string): number {
  const topicTokens = tokenize(topic);
  const contentTokens = tokenize(`${question} ${answer}`);

  if (topicTokens.length === 0) return 3.5;

  let topicHits = 0;
  for (const t of topicTokens) {
    if (contentTokens.includes(t)) topicHits++;
  }

  const coverageRatio = topicHits / topicTokens.length;
  if (coverageRatio >= 0.8) return 5.0;
  if (coverageRatio >= 0.5) return 4.5;
  if (coverageRatio >= 0.25) return 3.8;
  if (coverageRatio > 0) return 3.0;
  return 1.8;
}

/**
 * Measure answer completeness (1.0 to 5.0)
 * Evaluates length, explanatory conjunctions, detail depth.
 */
function evaluateCompleteness(answer: string): number {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  if (wordCount < 10) return 1.5; // Far too brief / non-informative
  if (wordCount < 20) return 2.5;

  let score = 3.5;
  if (wordCount >= 35) score += 0.8;
  if (wordCount >= 60) score += 0.5;

  // Check for explanatory structure (because, specifically, for example, furthermore, whereas)
  const lower = answer.toLowerCase();
  const explanatoryMarkers = ['because', 'specifically', 'for example', 'furthermore', 'however', 'combines', 'requires', 'architectural', 'demonstrates', 'whereas'];
  let markerHits = 0;
  for (const marker of explanatoryMarkers) {
    if (lower.includes(marker)) markerHits++;
  }

  score += Math.min(markerHits * 0.2, 0.6);
  return Math.min(Math.round(score * 10) / 10, 5.0);
}

/**
 * Measure consistency with source excerpts (1.0 to 5.0)
 */
function evaluateConsistency(answer: string, sourceUrl: string, sources: ResearchSource[]): number {
  const matchedSource = sources.find((s) => s.url === sourceUrl) || sources[0];
  if (!matchedSource) return 3.0;

  const answerTokens = tokenize(answer);
  const sourceTokens = tokenize(`${matchedSource.title} ${matchedSource.snippet}`);

  const similarity = calculateJaccardSimilarity(answerTokens, sourceTokens);
  if (similarity >= 0.3) return 5.0;
  if (similarity >= 0.18) return 4.5;
  if (similarity >= 0.08) return 4.0;
  if (similarity > 0.02) return 3.2;
  return 2.4;
}

/**
 * Measure clarity (1.0 to 5.0)
 * Checks capitalization, punctuation, run-on sentences, grammatical coherence.
 */
function evaluateClarity(question: string, answer: string): number {
  let score = 4.2;

  // Question ends with punctuation
  if (!question.trim().endsWith('?') && !question.trim().endsWith('.')) {
    score -= 0.5;
  }

  // Answer starts with capital letter
  if (answer.trim().length > 0 && answer.trim()[0] === answer.trim()[0].toLowerCase()) {
    score -= 0.3;
  }

  // Sentence count and average sentence length
  const sentences = answer.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length > 0) {
    const avgLen = answer.split(/\s+/).length / sentences.length;
    if (avgLen > 45) {
      score -= 0.6; // Run-on sentence
    } else if (avgLen >= 12 && avgLen <= 30) {
      score += 0.4; // Ideal cadence
    }
  }

  return Math.max(1.0, Math.min(5.0, Math.round(score * 10) / 10));
}

/**
 * Run comprehensive quality evaluation across all records
 */
export function evaluateDataset(
  records: TrainingRecord[],
  topic: string,
  sources: ResearchSource[],
  qualityThreshold: number = 3.5
): EvaluationResult {
  const evaluatedRecords: TrainingRecord[] = [];
  const seenQuestionsTokens: { id: string; tokens: string[] }[] = [];
  let acceptedCount = 0;
  let rejectedCount = 0;
  let duplicateCount = 0;
  let totalScoreSum = 0;

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const qTokens = tokenize(record.question);

    // Duplicate Check against preceding records
    let isDuplicate = false;
    let maxDupScore = 0;
    let duplicateOfId = '';

    for (const prev of seenQuestionsTokens) {
      const sim = calculateJaccardSimilarity(qTokens, prev.tokens);
      if (sim > maxDupScore) {
        maxDupScore = sim;
        duplicateOfId = prev.id;
      }
      if (sim >= 0.85) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      seenQuestionsTokens.push({ id: record.id, tokens: qTokens });
    } else {
      duplicateCount++;
    }

    // Calculate component scores
    const relevance = evaluateRelevance(record.question, record.answer, topic);
    const completeness = evaluateCompleteness(record.answer);
    const consistency = evaluateConsistency(record.answer, record.source_url, sources);
    const clarity = evaluateClarity(record.question, record.answer);

    // Composite weighted score (1.0 to 5.0)
    // If duplicate, heavily penalize composite score
    let composite = 0.25 * relevance + 0.3 * completeness + 0.25 * consistency + 0.2 * clarity;
    if (isDuplicate) {
      composite = Math.min(composite, 2.0);
    }
    composite = Math.round(composite * 10) / 10;
    totalScoreSum += composite;

    // Build explanatory breakdown
    const explanationParts: string[] = [];
    if (isDuplicate) {
      explanationParts.push(`Near-duplicate of ${duplicateOfId} (${Math.round(maxDupScore * 100)}% token similarity).`);
    }
    if (relevance < 3.0) {
      explanationParts.push('Low topical specificity.');
    } else if (relevance >= 4.5) {
      explanationParts.push('Highly relevant to research subject.');
    }
    if (completeness < 3.0) {
      explanationParts.push('Answer lacks sufficient explanatory depth.');
    }
    if (consistency < 3.0) {
      explanationParts.push('Weak alignment with cited source context.');
    }
    if (explanationParts.length === 0) {
      explanationParts.push('Well-structured pair with strong source alignment and clarity.');
    }

    const breakdown: QualityBreakdown = {
      relevance,
      completeness,
      consistency,
      clarity,
      isDuplicate,
      duplicateScore: Math.round(maxDupScore * 100) / 100,
      explanation: explanationParts.join(' '),
    };

    // Determine acceptance based on threshold & duplicates
    let status: 'accepted' | 'rejected' = 'accepted';
    let rejectionReason = undefined;

    if (isDuplicate) {
      status = 'rejected';
      rejectionReason = `Duplicate question detected (${Math.round(maxDupScore * 100)}% match with ${duplicateOfId})`;
      rejectedCount++;
    } else if (composite < qualityThreshold) {
      status = 'rejected';
      rejectionReason = `Quality score (${composite.toFixed(1)}) is below threshold (${qualityThreshold.toFixed(1)}). ${breakdown.explanation}`;
      rejectedCount++;
    } else {
      acceptedCount++;
    }

    evaluatedRecords.push({
      ...record,
      quality_score: composite,
      score_breakdown: breakdown,
      status,
      rejection_reason: rejectionReason,
    });
  }

  const averageScore = records.length > 0 ? Math.round((totalScoreSum / records.length) * 10) / 10 : 0;

  return {
    evaluatedRecords,
    acceptedCount,
    rejectedCount,
    duplicateCount,
    averageScore,
  };
}
