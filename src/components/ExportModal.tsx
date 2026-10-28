import React, { useState, useMemo } from 'react';
import { TrainingRecord } from '../types/agentflow';
import {
  formatToJsonl,
  formatToCsv,
  triggerFileDownload,
  copyToClipboard,
} from '../services/exporter';
import { X, Download, Copy, Check, FileText, Database } from 'lucide-react';

interface ExportModalProps {
  records: TrainingRecord[];
  topic: string;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ records, topic, onClose }) => {
  const [activeFormat, setActiveFormat] = useState<'jsonl' | 'csv'>('jsonl');
  const [copied, setCopied] = useState(false);

  // Formatted exports based on current (potentially edited) records
  const jsonlOutput = useMemo(() => formatToJsonl(records), [records]);
  const csvOutput = useMemo(() => formatToCsv(records), [records]);

  // Breakdown statistics
  const stats = useMemo(() => {
    const beginner = records.filter((r) => r.difficulty === 'Beginner').length;
    const intermediate = records.filter((r) => r.difficulty === 'Intermediate').length;
    const advanced = records.filter((r) => r.difficulty === 'Advanced').length;
    const editedCount = records.filter((r) => r.is_edited).length;

    return {
      total: records.length,
      beginner,
      intermediate,
      advanced,
      editedCount,
      jsonlBytes: new Blob([jsonlOutput]).size,
      csvBytes: new Blob([csvOutput]).size,
    };
  }, [records, jsonlOutput, csvOutput]);

  const sanitizedTopic = (topic || 'dataset').toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const timestamp = new Date().toISOString().slice(0, 10);

  const handleDownload = () => {
    if (activeFormat === 'jsonl') {
      triggerFileDownload(
        jsonlOutput,
        `agentflow_${sanitizedTopic}_${timestamp}.jsonl`,
        'application/x-ndjson'
      );
    } else {
      triggerFileDownload(
        csvOutput,
        `agentflow_${sanitizedTopic}_${timestamp}.csv`,
        'text/csv'
      );
    }
  };

  const handleCopy = async () => {
    const text = activeFormat === 'jsonl' ? jsonlOutput : csvOutput;
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const previewSnippet = useMemo(() => {
    const text = activeFormat === 'jsonl' ? jsonlOutput : csvOutput;
    const lines = text.split('\n');
    return lines.slice(0, 6).join('\n') + (lines.length > 6 ? `\n... (+${lines.length - 6} more rows)` : '');
  }, [activeFormat, jsonlOutput, csvOutput]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Export AI Training Dataset
            </h3>
            <span className="text-xs text-slate-500">
              {stats.total} verified, accepted records ready for training
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

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 uppercase font-medium block">Total Pairs</span>
              <span className="text-lg font-bold font-mono tabular-nums text-slate-900">{stats.total}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 uppercase font-medium block">Difficulty</span>
              <span className="text-xs text-slate-700 font-medium">
                {stats.beginner} Beg · {stats.intermediate} Int · {stats.advanced} Adv
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 uppercase font-medium block">User Edits</span>
              <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                {stats.editedCount}
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 uppercase font-medium block">Payload Size</span>
              <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                {activeFormat === 'jsonl'
                  ? `${(stats.jsonlBytes / 1024).toFixed(1)} KB`
                  : `${(stats.csvBytes / 1024).toFixed(1)} KB`}
              </span>
            </div>
          </div>

          {/* Format selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Output Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActiveFormat('jsonl')}
                className={`p-3 text-left border rounded-lg transition-colors cursor-pointer ${
                  activeFormat === 'jsonl'
                    ? 'border-slate-900 bg-slate-50/70 ring-1 ring-slate-900'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 mb-1">
                  <Database className="w-3.5 h-3.5" />
                  <span>JSONL (JSON Lines)</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Standard format for OpenAI, Hugging Face, Anthropic, and SFT fine-tuning pipelines. One JSON object per line.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setActiveFormat('csv')}
                className={`p-3 text-left border rounded-lg transition-colors cursor-pointer ${
                  activeFormat === 'csv'
                    ? 'border-slate-900 bg-slate-50/70 ring-1 ring-slate-900'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 mb-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>CSV (Comma Separated)</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Ideal for spreadsheets, Pandas, and tabular model loaders. Clean RFC 4180 escaping with header row.
                </p>
              </button>
            </div>
          </div>

          {/* Syntax preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                {activeFormat.toUpperCase()} Payload Preview
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                UTF-8 Encoded
              </span>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg text-[11px] font-mono overflow-x-auto max-h-48 whitespace-pre-wrap leading-relaxed">
              {previewSnippet}
            </pre>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy {activeFormat.toUpperCase()} to Clipboard</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Done
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {activeFormat.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
