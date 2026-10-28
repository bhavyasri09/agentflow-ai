import React, { useState, useMemo } from 'react';
import { DifficultyLevel, TrainingRecord } from '../types/agentflow';
import {
  Search,
  Edit2,
  Trash2,
  Save,
  X,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface DatasetTableProps {
  acceptedRecords: TrainingRecord[];
  rejectedRecords: TrainingRecord[];
  onUpdateRecord: (updated: TrainingRecord) => void;
  onDeleteRecord: (id: string) => void;
  onAddRecord: (newRecord: TrainingRecord) => void;
  onRegenerate: () => void;
  onInspectScore: (record: TrainingRecord) => void;
  isProcessing: boolean;
}

export const DatasetTable: React.FC<DatasetTableProps> = ({
  acceptedRecords,
  rejectedRecords,
  onUpdateRecord,
  onDeleteRecord,
  onAddRecord,
  onRegenerate,
  onInspectScore,
  isProcessing,
}) => {
  const [activeTab, setActiveTab] = useState<'accepted' | 'rejected' | 'all'>('accepted');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');

  // New Record state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<DifficultyLevel>('Intermediate');
  const [newSourceUrl, setNewSourceUrl] = useState('');

  // Combined pool based on activeTab
  const currentPool = useMemo(() => {
    if (activeTab === 'accepted') return acceptedRecords;
    if (activeTab === 'rejected') return rejectedRecords;
    return [...acceptedRecords, ...rejectedRecords];
  }, [activeTab, acceptedRecords, rejectedRecords]);

  // Filtered pool
  const filteredRecords = useMemo(() => {
    return currentPool.filter((rec) => {
      // Difficulty match
      if (difficultyFilter !== 'all' && rec.difficulty !== difficultyFilter) {
        return false;
      }
      // Query match
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesQ = rec.question.toLowerCase().includes(q);
        const matchesA = rec.answer.toLowerCase().includes(q);
        const matchesId = rec.id.toLowerCase().includes(q);
        return matchesQ || matchesA || matchesId;
      }
      return true;
    });
  }, [currentPool, difficultyFilter, searchQuery]);

  const startEdit = (record: TrainingRecord) => {
    setEditingId(record.id);
    setEditQuestion(record.question);
    setEditAnswer(record.answer);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditQuestion('');
    setEditAnswer('');
  };

  const saveEdit = (original: TrainingRecord) => {
    if (!editQuestion.trim() || !editAnswer.trim()) return;
    onUpdateRecord({
      ...original,
      question: editQuestion.trim(),
      answer: editAnswer.trim(),
      is_edited: true,
    });
    setEditingId(null);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const customRecord: TrainingRecord = {
      id: `custom-${Date.now().toString().slice(-4)}`,
      topic: acceptedRecords[0]?.topic || 'Manual Entry',
      difficulty: newDifficulty,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      source_url: newSourceUrl.trim() || 'https://en.wikipedia.org/wiki/Custom_Dataset_Entry',
      quality_score: 5.0,
      score_breakdown: {
        relevance: 5.0,
        completeness: 5.0,
        consistency: 5.0,
        clarity: 5.0,
        isDuplicate: false,
        duplicateScore: 0,
        explanation: 'User verified custom entry.',
      },
      status: 'accepted',
      is_edited: true,
      created_at: new Date().toISOString(),
    };

    onAddRecord(customRecord);
    setIsAddingNew(false);
    setNewQuestion('');
    setNewAnswer('');
    setNewSourceUrl('');
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('accepted')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'accepted'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Accepted ({acceptedRecords.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rejected')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'rejected'
                ? 'bg-white text-rose-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rejected ({rejectedRecords.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Pairs ({acceptedRecords.length + rejectedRecords.length})
          </button>
        </div>

        {/* Right: Search, Filter, Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions or answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 w-48 sm:w-56"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Difficulty Dropdown */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="all">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          {/* Add custom pair */}
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Custom Pair</span>
          </button>

          {/* Regenerate */}
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isProcessing}
            title="Regenerate Dataset"
            className="p-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Add Custom Pair Form (Collapsible) */}
      {isAddingNew && (
        <form onSubmit={handleCreateNew} className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Add Verified Custom Pair
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Question
              </label>
              <textarea
                rows={2}
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Enter prompt or query..."
                className="w-full text-xs p-2 border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Answer
              </label>
              <textarea
                rows={2}
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Enter grounded response..."
                className="w-full text-xs p-2 border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                required
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-3">
              <select
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value as DifficultyLevel)}
                className="text-xs px-2 py-1 border border-slate-300 rounded bg-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              <input
                type="url"
                value={newSourceUrl}
                onChange={(e) => setNewSourceUrl(e.target.value)}
                placeholder="Source Reference URL (optional)"
                className="text-xs px-2 py-1 border border-slate-300 rounded bg-white w-64"
              />
            </div>

            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
            >
              Save Record to Dataset
            </button>
          </div>
        </form>
      )}

      {/* Main Table Content */}
      <div className="flex-1 overflow-auto">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-sm font-medium">No training records found.</p>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery
                ? `No records matching "${searchQuery}". Try clearing search.`
                : 'Click "Generate Dataset" in the sidebar to create records.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredRecords.map((record, index) => {
              const isEditing = editingId === record.id;
              const isRejected = record.status === 'rejected';

              return (
                <div
                  key={record.id}
                  className={`p-4 transition-colors ${
                    isRejected ? 'bg-rose-50/25 hover:bg-rose-50/40' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    {/* Metadata line (NO PILLS per guidelines) */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono font-semibold text-slate-800">{record.id}</span>
                      <span aria-hidden="true">·</span>
                      <span>{record.difficulty}</span>
                      <span aria-hidden="true">·</span>
                      <button
                        type="button"
                        onClick={() => onInspectScore(record)}
                        className="font-mono font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                        title="Click to view 5-point quality breakdown"
                      >
                        <span
                          className={
                            record.quality_score >= 4.0
                              ? 'text-emerald-700'
                              : record.quality_score >= 3.0
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }
                        >
                          ★ {record.quality_score.toFixed(1)} / 5.0
                        </span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </button>

                      {record.is_edited && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-600 italic">User Edited</span>
                        </>
                      )}

                      {isRejected && record.rejection_reason && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-rose-700 font-medium">
                            {record.rejection_reason}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => saveEdit(record)}
                            className="p-1 text-emerald-700 hover:bg-emerald-100 rounded transition-colors"
                            title="Save edits"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="p-1 text-slate-400 hover:bg-slate-200 rounded transition-colors"
                            title="Cancel edits"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(record)}
                            className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                            title="Edit question & answer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteRecord(record.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete pair"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Question and Answer */}
                  {isEditing ? (
                    <div className="space-y-2 mt-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                          Question:
                        </label>
                        <textarea
                          rows={2}
                          value={editQuestion}
                          onChange={(e) => setEditQuestion(e.target.value)}
                          className="w-full text-xs p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                          Answer:
                        </label>
                        <textarea
                          rows={3}
                          value={editAnswer}
                          onChange={(e) => setEditAnswer(e.target.value)}
                          className="w-full text-xs p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="text-sm font-semibold text-slate-900 leading-snug">
                        <span className="text-slate-400 font-mono mr-1.5">Q:</span>
                        {record.question}
                      </div>
                      <div className="text-xs text-slate-600 leading-relaxed pl-5 border-l border-slate-200">
                        <span className="text-slate-400 font-mono mr-1">A:</span>
                        {record.answer}
                      </div>
                    </div>
                  )}

                  {/* Source reference footer */}
                  <div className="mt-2 pt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5 truncate max-w-lg">
                      <span>Source:</span>
                      <a
                        href={record.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-slate-800 hover:underline flex items-center gap-1 truncate"
                      >
                        <span className="truncate">{record.source_title || record.source_url}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      Index #{index + 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
