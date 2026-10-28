import React, { useState } from 'react';
import { ResearchSource } from '../types/agentflow';
import { ExternalLink, ChevronDown, ChevronUp, Globe, BookOpen } from 'lucide-react';

interface SourcesPanelProps {
  sources: ResearchSource[];
  isLive: boolean;
}

export const SourcesPanel: React.FC<SourcesPanelProps> = ({ sources, isLive }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (sources.length === 0) return null;

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-left hover:text-slate-900 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            {isLive ? <Globe className="w-4 h-4 text-emerald-600" /> : <BookOpen className="w-4 h-4 text-slate-500" />}
            <span>Retrieved Web Sources ({sources.length})</span>
          </div>
          <span className="text-xs text-slate-500">
            · {isLive ? 'Tavily Live Web Search' : 'Verified Knowledge Corpus (Demo Mode)'}
          </span>
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        <span className="text-[11px] text-slate-500 hidden sm:inline">
          {isOpen ? 'Click to collapse' : 'Click to inspect source excerpts'}
        </span>
      </div>

      {isOpen && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          {sources.map((source, index) => (
            <div
              key={source.id || index}
              className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="font-semibold text-slate-900 line-clamp-1 text-xs">
                    {source.title}
                  </h4>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-slate-700 shrink-0"
                    title="Open external source"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-slate-600 line-clamp-3 text-[11px] leading-relaxed">
                  {source.snippet}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                <span className="truncate max-w-[180px] font-mono">{new URL(source.url).hostname}</span>
                {source.score !== undefined && (
                  <span className="font-mono">Relevance: {source.score}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
