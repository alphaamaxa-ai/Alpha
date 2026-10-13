import React from 'react';
import {
  History,
  X,
  Play,
  Calendar,
  Clock,
  Sparkles,
  Trash2,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { AgentRunResult } from '../types/agent';

interface HistoryModalProps {
  history: AgentRunResult[];
  onSelectRun: (run: AgentRunResult) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  history,
  onSelectRun,
  onClearHistory,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Agent Task Run History ({history.length})
              </h3>
              <p className="text-[11px] text-slate-400">
                Review and restore previous autonomous agent deliverables
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-slate-400 hover:text-rose-400 bg-slate-950 border border-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
          {history.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <History className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No previous tasks recorded yet.</p>
              <p className="text-[11px] text-slate-500">
                Execute a task in the Commander to build up your run history.
              </p>
            </div>
          ) : (
            history.map((run) => (
              <div
                key={run.id}
                onClick={() => {
                  onSelectRun(run);
                  onClose();
                }}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 transition-all cursor-pointer group space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {run.mode}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(run.timestamp).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    · {new Date(run.timestamp).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-100 group-hover:text-indigo-200 transition-colors">
                    {run.title || run.taskPrompt.slice(0, 60)}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                    {run.summary || run.taskPrompt}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-900">
                  <div className="flex items-center gap-3">
                    <span>Steps: {run.executionTrace?.length || 0}</span>
                    <span>Actions: {run.deliverables?.suggestedActions?.length || 0}</span>
                    <span>Emails: {run.deliverables?.emailDrafts?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Load Deliverables</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
