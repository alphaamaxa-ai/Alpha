import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Send,
  Loader2,
  SlidersHorizontal,
  Compass,
  Mail,
  Calendar,
  Table,
  FileText,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { AgentMode, AgentRunResult, CalendarEvent } from '../types/agent';
import { ExecutionFeed } from './ExecutionFeed';
import { DeliverablesViewer } from './DeliverablesViewer';

interface CommanderViewProps {
  currentRun: AgentRunResult | null;
  isRunning: boolean;
  onExecuteTask: (task: string, mode: AgentMode, includeScratchpad: boolean) => Promise<void>;
  onAddCalendarEvent: (event: CalendarEvent) => void;
  onRefine: (instruction: string, field: string) => Promise<void>;
  isRefining: boolean;
  scratchpadHasContent: boolean;
}

const PRESET_PROMPTS = [
  {
    title: 'Daily Morning Executive Triage',
    category: 'Daily Standup',
    mode: 'autonomous' as AgentMode,
    prompt:
      'Perform a comprehensive executive morning triage. Audit my schedule for high-leverage focus blocks, identify critical deadlines, draft a morning status note for the executive team, and build a high-impact action checklist.',
  },
  {
    title: 'Draft Client Proposal & FAQ Matrix',
    category: 'Communications',
    mode: 'email_outreach' as AgentMode,
    prompt:
      'Draft an executive proposal email to a potential enterprise client offering our autonomous AI automation suite. Include pricing tiers, implementation timeline, risk mitigations, and an anticipated FAQ section.',
  },
  {
    title: 'Competitive Market Synthesis Dossier',
    category: 'Deep Research',
    mode: 'deep_research' as AgentMode,
    prompt:
      'Synthesize the state of autonomous AI productivity agents in 2026. Provide an executive market overview, a feature comparison table across leading tools, emerging architectural patterns, and 3 strategic recommendations.',
  },
  {
    title: 'Convert Meeting Notes into Action Engine',
    category: 'Workflow Automation',
    mode: 'workflow' as AgentMode,
    prompt:
      'Process the raw meeting notes from my working memory scratchpad. Extract core decisions, identify owners with estimated completion dates, format follow-up emails, and generate schedule blocks for tomorrow.',
  },
];

export const CommanderView: React.FC<CommanderViewProps> = ({
  currentRun,
  isRunning,
  onExecuteTask,
  onAddCalendarEvent,
  onRefine,
  isRefining,
  scratchpadHasContent,
}) => {
  const [taskInput, setTaskInput] = useState('');
  const [selectedMode, setSelectedMode] = useState<AgentMode>('autonomous');
  const [includeScratchpad, setIncludeScratchpad] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim() || isRunning) return;
    onExecuteTask(taskInput.trim(), selectedMode, includeScratchpad);
  };

  const handleSelectPreset = (presetPrompt: string, mode: AgentMode) => {
    setTaskInput(presetPrompt);
    setSelectedMode(mode);
  };

  const modeOptions: { id: AgentMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'autonomous', label: 'Autonomous Agent', icon: Zap },
    { id: 'deep_research', label: 'Deep Research', icon: Compass },
    { id: 'scheduling', label: 'Schedule Optimizer', icon: Calendar },
    { id: 'email_outreach', label: 'Email Cadence', icon: Mail },
    { id: 'data_analysis', label: 'Data & Metrics', icon: Table },
    { id: 'workflow', label: 'Multi-Step Pipeline', icon: SlidersHorizontal },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-6 py-6">
      {/* Hero Input Command Center */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 lg:p-7 shadow-2xl shadow-indigo-950/20 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-600/10 via-violet-600/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-slate-100 flex items-center gap-2">
                <span>Autonomous Task Dispatcher</span>
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  Full Autopilot
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Describe any goal, workflow, schedule conflict, or document. OmniTask decomposes, executes, and delivers.
              </p>
            </div>

            {/* Scratchpad Context toggle */}
            <div className="flex items-center gap-2">
              <label
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs border cursor-pointer transition-all ${
                  includeScratchpad
                    ? 'bg-indigo-950/50 border-indigo-800/80 text-indigo-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={includeScratchpad}
                  onChange={(e) => setIncludeScratchpad(e.target.checked)}
                  className="rounded text-indigo-600 bg-slate-900 border-slate-700 w-3.5 h-3.5"
                />
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Inject Scratchpad Memory</span>
                {scratchpadHasContent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                )}
              </label>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <textarea
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="What complex task or workflow should the agent execute today? (e.g., 'Audit my morning meetings, resolve overlaps, draft 2 high-priority partner emails, and build a 90-min deep work plan')"
                rows={3}
                disabled={isRunning}
                className="w-full p-4 pr-12 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 resize-y transition-all"
              />
              <button
                type="submit"
                disabled={!taskInput.trim() || isRunning}
                className="absolute right-3 bottom-3 p-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center"
                title="Execute Task"
              >
                {isRunning ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
              </button>
            </div>

            {/* Mode selection pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-mono text-slate-500 mr-1">Execution Mode:</span>
                {modeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedMode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedMode(opt.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="submit"
                disabled={!taskInput.trim() || isRunning}
                className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-indigo-600/20 transition-all"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Task...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run OmniTask Autopilot</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Preset Buttons */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 mb-2">
              <Lightbulb className="w-3 h-3 text-amber-400" />
              <span>Recommended Quick Workflows:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {PRESET_PROMPTS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset.prompt, preset.mode)}
                  className="text-left p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-indigo-400 mb-1">
                    <span>{preset.category}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-xs font-medium text-slate-200 line-clamp-1 group-hover:text-white">
                    {preset.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Execution Status / Loading State */}
      {isRunning && (
        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 text-center space-y-3 shadow-xl">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Agent Autopilot In Progress
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Decomposing task, auditing constraints, invoking reasoning tools, and generating executable deliverables via Gemini 3.8 Flash...
            </p>
          </div>
        </div>
      )}

      {/* Results View: Live Trace + Deliverables Workstation */}
      {currentRun && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Plan & Execution Trace (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <ExecutionFeed
              plan={currentRun.plan}
              executionTrace={currentRun.executionTrace}
              isExecuting={isRunning}
              category={currentRun.category}
              summary={currentRun.summary}
            />
          </div>

          {/* Right Column: Deliverables Studio (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <DeliverablesViewer
              deliverables={currentRun.deliverables}
              taskTitle={currentRun.title}
              onAddCalendarEvent={onAddCalendarEvent}
              onRefine={onRefine}
              isRefining={isRefining}
            />
          </div>
        </div>
      )}
    </div>
  );
};
