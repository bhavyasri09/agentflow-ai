/**
 * Exporter Module - JSONL and CSV Serialization and Download Utilities
 */
import { TrainingRecord } from '../types/agentflow';

/**
 * Format training records into standard JSONL format (1 valid JSON object per line)
 */
export function formatToJsonl(records: TrainingRecord[]): string {
  return records
    .map((record) => {
      const payload = {
        id: record.id,
        topic: record.topic,
        difficulty: record.difficulty,
        question: record.question,
        answer: record.answer,
        source_url: record.source_url,
        quality_score: record.quality_score,
      };
      return JSON.stringify(payload);
    })
    .join('\n');
}

/**
 * Escape CSV field per RFC 4180
 */
function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // Always wrap in quotes and escape internal quotes
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Format training records into RFC 4180 compliant CSV string
 */
export function formatToCsv(records: TrainingRecord[]): string {
  const headers = ['id', 'topic', 'difficulty', 'question', 'answer', 'quality_score', 'source_url'];
  const headerRow = headers.join(',');

  const rows = records.map((record) => {
    return [
      escapeCsvField(record.id),
      escapeCsvField(record.topic),
      escapeCsvField(record.difficulty),
      escapeCsvField(record.question),
      escapeCsvField(record.answer),
      escapeCsvField(record.quality_score),
      escapeCsvField(record.source_url),
    ].join(',');
  });

  return [headerRow, ...rows].join('\n');
}

/**
 * Trigger browser file download via Blob and hidden anchor
 */
export function triggerFileDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy text string directly to user clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}
