import React, { useState } from 'react';
import { GenerationSettings } from '../types/agentflow';
import { X, Key, ExternalLink, ShieldCheck, Eye, EyeOff, Lock } from 'lucide-react';

interface ApiSettingsModalProps {
  settings: GenerationSettings;
  onSave: (updated: Partial<GenerationSettings>) => void;
  onClose: () => void;
}

const NEBIUS_MODELS = [
  { id: 'nvidia/Llama-3.1-Nemotron-70B-Instruct', label: 'NVIDIA Llama 3.1 Nemotron 70B Instruct (Recommended - NVIDIA Open Source)' },
  { id: 'Qwen/Qwen3.5-397B-A17B', label: 'Qwen 3.5 397B A17B (Nebius Token Factory)' },
  { id: 'Qwen/Qwen2.5-72B-Instruct', label: 'Qwen 2.5 72B Instruct' },
  { id: 'nvidia/Llama-3.1-Nemotron-70B-Reward', label: 'NVIDIA Llama 3.1 Nemotron 70B Reward' },
  { id: 'meta-llama/Llama-3.3-70B-Instruct', label: 'Meta Llama 3.3 70B Instruct' },
  { id: 'deepseek-ai/DeepSeek-V3', label: 'DeepSeek V3' },
];

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({ settings, onSave, onClose }) => {
  const [tavilyKey, setTavilyKey] = useState(settings.tavilyApiKey);
  const [nebiusKey, setNebiusKey] = useState(settings.nebiusApiKey);
  const [showNebiusKey, setShowNebiusKey] = useState(false);
  const [showTavilyKey, setShowTavilyKey] = useState(false);
  const [baseUrl, setBaseUrl] = useState(settings.nebiusBaseUrl || 'https://api.tokenfactory.us-central1.nebius.com/v1/');
  const [model, setModel] = useState(settings.nebiusModel);
  const [customModel, setCustomModel] = useState('');
  const [useCustomModel, setUseCustomModel] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveModel = useCustomModel && customModel.trim() ? customModel.trim() : model;
    onSave({
      tavilyApiKey: tavilyKey.trim(),
      nebiusApiKey: nebiusKey.trim(),
      nebiusBaseUrl: baseUrl.trim(),
      nebiusModel: effectiveModel,
    });
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setTavilyKey('');
    setNebiusKey('');
    onSave({
      tavilyApiKey: '',
      nebiusApiKey: '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">
              API Keys & Model Configuration
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Notice on safety */}
          <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg text-xs text-emerald-950 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900 mb-0.5">
                Privacy Guarantee: Your keys are never visible to others
              </p>
              <p className="text-emerald-800 leading-relaxed text-[11px]">
                API keys are stored exclusively in your local browser storage (<code>localStorage</code>) on this device. Anyone else opening your shared link or demo URL will see completely empty fields and will automatically run in <strong>Grounded Demo Mode</strong> without needing any keys.
              </p>
            </div>
          </div>

          {/* Tavily API Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="tavily-key" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Tavily Search API Key
              </label>
              <a
                href="https://tavily.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 hover:underline"
              >
                <span>Get key at tavily.com</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <div className="relative">
              <input
                id="tavily-key"
                type={showTavilyKey ? 'text' : 'password'}
                value={tavilyKey}
                onChange={(e) => setTavilyKey(e.target.value)}
                placeholder="tvly-..."
                className="w-full text-xs font-mono px-3 py-2 pr-9 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowTavilyKey(!showTavilyKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
                title={showTavilyKey ? 'Hide Tavily key' : 'Show Tavily key'}
              >
                {showTavilyKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Used for live web searching and source excerpt retrieval.
            </p>
          </div>

          {/* Nebius API Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="nebius-key" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Nebius AI API Key
              </label>
              <a
                href="https://nebius.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 hover:underline"
              >
                <span>Get key at nebius.com</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <div className="relative">
              <input
                id="nebius-key"
                type={showNebiusKey ? 'text' : 'password'}
                value={nebiusKey}
                onChange={(e) => setNebiusKey(e.target.value)}
                placeholder="v1.CmQKH... (Nebius Token Factory Key)"
                className="w-full text-xs font-mono px-3 py-2 pr-9 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowNebiusKey(!showNebiusKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
                title={showNebiusKey ? 'Hide Nebius key' : 'Show Nebius key'}
              >
                {showNebiusKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports Nebius Token Factory keys (e.g. <code>v1.CmQ...</code>). Masked by default.
            </p>
          </div>

          {/* Nebius Base URL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="nebius-base-url" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Nebius Token Factory Base URL
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setBaseUrl('https://api.tokenfactory.us-central1.nebius.com/v1/')}
                  className="text-[10px] px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors font-mono cursor-pointer"
                >
                  US-Central1
                </button>
                <button
                  type="button"
                  onClick={() => setBaseUrl('https://api.nebius.ai/v1/')}
                  className="text-[10px] px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors font-mono cursor-pointer"
                >
                  Global API
                </button>
              </div>
            </div>
            <input
              id="nebius-base-url"
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.tokenfactory.us-central1.nebius.com/v1/"
              className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
            />
          </div>

          {/* Model Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="nebius-model" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Nebius Model
              </label>
              <button
                type="button"
                onClick={() => setUseCustomModel(!useCustomModel)}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                {useCustomModel ? 'Select from catalog' : 'Enter custom model ID'}
              </button>
            </div>

            {useCustomModel ? (
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="e.g. Qwen/Qwen3.5-397B-A17B or nvidia/Llama-3.1-Nemotron-70B-Instruct"
                className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            ) : (
              <div className="relative">
                <select
                  id="nebius-model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {NEBIUS_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium"
            >
              Clear Keys (Switch to Demo)
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
              >
                {savedNotice ? 'Saved!' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
