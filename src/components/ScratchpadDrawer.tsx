import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Bot,
  Zap,
  ArrowRight,
  ListTodo,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface ScratchpadDrawerProps {
  content: string;
  onChange: (val: string) => void;
  onRunTransform: (prompt: string) => void;
}

export const ScratchpadDrawer: React.FC<ScratchpadDrawerProps> = ({
  content,
  onChange,
  onRunTransform,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lineCount = content ? content.split('\n').length : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <h2 className="text-base lg:text-lg font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>Agent Working Memory & Scratchpad</span>
            </h2>
            <p className="text-xs text-slate-400">
              Paste meeting transcripts, rough ideas, or project bullets. AI agents inject this context directly during execution.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">
              {wordCount} words · {lineCount} lines
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs cursor-pointer transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 1-Click Transformation Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-indigo-400 mr-1 flex items-center gap-1">
            <Bot className="w-3.5 h-3.5" />
            <span>Agent Memory Actions:</span>
          </span>

          <button
            onClick={() =>
              onRunTransform(
                'Parse all unstructured notes in my Scratchpad. Extract every actionable task, map owners, assign deadlines, and format them as an execution plan.'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Extract & Queue Action Items</span>
          </button>

          <button
            onClick={() =>
              onRunTransform(
                'Review the Scratchpad notes. Produce a polished, executive-ready summary document with clear bullet points, key takeaways, and risks.'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Synthesize Executive Brief</span>
          </button>

          <button
            onClick={() =>
              onRunTransform(
                'Analyze the dates, meetings, and deadlines mentioned in my Scratchpad. Formulate optimal time-blocks and schedule entries for tomorrow.'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600 hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Convert to Calendar Blocks</span>
          </button>
        </div>

        {/* Editor Area */}
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            rows={16}
            placeholder="Type or paste unstructured notes, meeting logs, customer feedback, or thoughts here..."
            className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-200 text-sm font-mono leading-relaxed placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-y"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>✓ Changes auto-saved to local memory</span>
          <span>Tip: Toggle "Inject Scratchpad Memory" in Agent Commander to include this context</span>
        </div>
      </div>
    </div>
  );
};
