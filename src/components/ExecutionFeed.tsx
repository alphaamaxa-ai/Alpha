import React from 'react';
import {
  Calendar,
  Mail,
  Search,
  Table,
  FileCode,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  BrainCircuit,
  Sparkles,
} from 'lucide-react';
import { ExecutionStep, PlanPhase } from '../types/agent';

interface ExecutionFeedProps {
  plan: PlanPhase[];
  executionTrace: ExecutionStep[];
  isExecuting: boolean;
  category?: string;
  summary?: string;
}

const toolConfig: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  CalendarEngine: { label: 'Calendar Engine', icon: Calendar, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  EmailComposer: { label: 'Email Composer', icon: Mail, color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  WebResearch: { label: 'Web Research', icon: Search, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  DataMatrix: { label: 'Data Matrix', icon: Table, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  DocArchitect: { label: 'Doc Architect', icon: FileCode, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  WorkflowTrigger: { label: 'Workflow Engine', icon: Zap, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
};

export const ExecutionFeed: React.FC<ExecutionFeedProps> = ({
  plan,
  executionTrace,
  isExecuting,
  summary,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 lg:p-5 shadow-xl shadow-black/40 space-y-4">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Agent Reasoning & Tool Execution
              {isExecuting && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  Decomposing & Synthesizing
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">
              Autonomous multi-step decomposition using Gemini 3.8 Flash
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Steps: {executionTrace.length}</span>
          <span>•</span>
          <span>Phases: {plan.length}</span>
        </div>
      </div>

      {/* Plan Phases Decomposition */}
      {plan.length > 0 && (
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
          <div className="text-[11px] font-mono font-medium text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            Execution Roadmap
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {plan.map((p, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 text-xs"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div>
                  <div className="font-semibold text-slate-200 text-xs">{p.phase}</div>
                  <div className="text-slate-400 text-[11px] leading-relaxed">{p.objective}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live / Completed Steps */}
      <div className="space-y-2.5">
        <div className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">
          Action Trace & Tool Invocations
        </div>

        <div className="space-y-2">
          {executionTrace.map((step) => {
            const tool = toolConfig[step.toolUsed] || {
              label: step.toolUsed,
              icon: Zap,
              color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
            };
            const ToolIcon = tool.icon;

            return (
              <div
                key={step.step}
                className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 hover:border-slate-700/80 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-mono flex items-center justify-center">
                      #{step.step}
                    </span>
                    <span className="font-medium text-xs text-slate-200">{step.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Tool Badge */}
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium font-mono ${tool.color}`}
                    >
                      <ToolIcon className="w-3 h-3" />
                      <span>{tool.label}</span>
                    </div>

                    {/* Status */}
                    {step.status === 'completed' ? (
                      <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Done
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1 text-[11px] font-mono animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        Running
                      </span>
                    )}
                  </div>
                </div>

                {/* Reasoning Thought */}
                <div className="text-xs text-slate-400 font-sans italic bg-slate-900/80 rounded-lg p-2 border-l-2 border-indigo-500">
                  <span className="font-semibold not-italic text-slate-300 font-mono text-[10px] uppercase block mb-0.5">
                    Agent Reflection:
                  </span>
                  "{step.thought}"
                </div>

                {/* Step Output */}
                <div className="text-xs text-slate-300 flex items-start gap-1.5 pl-1 pt-0.5">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                  <span className="text-[12px]">{step.outputSummary}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary callout */}
      {summary && (
        <div className="bg-gradient-to-r from-indigo-950/40 to-slate-950 p-3 rounded-xl border border-indigo-800/40 text-xs text-slate-200 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold text-indigo-200 mb-0.5">Executive Conclusion:</div>
            <div className="leading-relaxed text-slate-300">{summary}</div>
          </div>
        </div>
      )}
    </div>
  );
};
