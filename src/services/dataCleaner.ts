/**
 * Data Cleaner Module - Deduplication, Whitespace Normalization, and Schema Validation
 */
import { PipelineMetrics, TrainingRecord } from '../types/agentflow';

export interface CleanedDatasetResult {
  cleanedRecords: TrainingRecord[];
  metrics: PipelineMetrics;
  rejectedList: TrainingRecord[];
}

/**
 * Normalize whitespace: collapse multiple spaces/newlines, trim ends
 */
export function normalizeWhitespace(str: string): string {
  if (!str) return '';
  return str
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();
}

/**
 * Validate that a record contains all required fields with non-empty content
 */
export function validateRecordSchema(record: Partial<TrainingRecord>): { isValid: boolean; reason?: string } {
  if (!record) return { isValid: false, reason: 'Record is null or undefined' };

  if (!record.question || typeof record.question !== 'string' || record.question.trim().length === 0) {
    return { isValid: false, reason: 'Missing or empty question' };
  }

  if (!record.answer || typeof record.answer !== 'string' || record.answer.trim().length === 0) {
    return { isValid: false, reason: 'Missing or empty answer' };
  }

  if (!record.topic || typeof record.topic !== 'string' || record.topic.trim().length === 0) {
    return { isValid: false, reason: 'Missing topic' };
  }

  if (!record.source_url || typeof record.source_url !== 'string' || record.source_url.trim().length === 0) {
    return { isValid: false, reason: 'Missing source_url' };
  }

  return { isValid: true };
}

/**
 * Clean, deduplicate, and normalize raw training records
 */
export function cleanDataset(
  rawRecords: TrainingRecord[],
  qualityThreshold: number = 3.5
): CleanedDatasetResult {
  const totalGenerated = rawRecords.length;
  const cleanedRecords: TrainingRecord[] = [];
  const rejectedList: TrainingRecord[] = [];

  const seenQuestions = new Set<string>();
  let duplicatesRemoved = 0;
  let malformedRemoved = 0;
  let totalScoreSum = 0;

  for (const record of rawRecords) {
    // 1. Schema Validation
    const validation = validateRecordSchema(record);
    if (!validation.isValid) {
      malformedRemoved++;
      rejectedList.push({
        ...record,
        id: record.id || `malformed-${Date.now()}`,
        question: record.question || '[Missing Question]',
        answer: record.answer || '[Missing Answer]',
        topic: record.topic || 'Unknown',
        difficulty: record.difficulty || 'Intermediate',
        source_url: record.source_url || '',
        quality_score: 1.0,
        score_breakdown: {
          relevance: 1,
          completeness: 1,
          consistency: 1,
          clarity: 1,
          isDuplicate: false,
          duplicateScore: 0,
          explanation: validation.reason || 'Schema validation failure',
        },
        status: 'rejected',
        rejection_reason: `Malformed Record: ${validation.reason}`,
        created_at: record.created_at || new Date().toISOString(),
      });
      continue;
    }

    // 2. Whitespace Normalization
    const cleanQuestion = normalizeWhitespace(record.question);
    const cleanAnswer = normalizeWhitespace(record.answer);
    const cleanTopic = normalizeWhitespace(record.topic);
    const cleanUrl = record.source_url.trim();

    // 3. Exact Duplicate Question Detection
    const normalizedKey = cleanQuestion.toLowerCase().replace(/[^\w]/g, '');
    if (seenQuestions.has(normalizedKey)) {
      duplicatesRemoved++;
      rejectedList.push({
        ...record,
        question: cleanQuestion,
        answer: cleanAnswer,
        status: 'rejected',
        rejection_reason: 'Exact duplicate question removed during cleaning',
      });
      continue;
    }
    seenQuestions.add(normalizedKey);

    // 4. Quality Threshold Check
    const score = typeof record.quality_score === 'number' ? record.quality_score : 4.0;
    totalScoreSum += score;

    const normalizedRecord: TrainingRecord = {
      ...record,
      question: cleanQuestion,
      answer: cleanAnswer,
      topic: cleanTopic,
      source_url: cleanUrl,
      quality_score: score,
    };

    if (score < qualityThreshold || record.status === 'rejected') {
      rejectedList.push({
        ...normalizedRecord,
        status: 'rejected',
        rejection_reason:
          record.rejection_reason ||
          `Quality score (${score.toFixed(1)}) falls below threshold (${qualityThreshold.toFixed(1)})`,
      });
    } else {
      cleanedRecords.push({
        ...normalizedRecord,
        status: 'accepted',
      });
    }
  }

  const accepted = cleanedRecords.length;
  const rejected = rejectedList.length;
  const avgQualityScore =
    cleanedRecords.length > 0 ? Math.round((totalScoreSum / (accepted + rejected || 1)) * 10) / 10 : 0;

  return {
    cleanedRecords,
    rejectedList,
    metrics: {
      totalGenerated,
      accepted,
      rejected,
      duplicatesRemoved,
      malformedRemoved,
      avgQualityScore,
    },
  };
}
