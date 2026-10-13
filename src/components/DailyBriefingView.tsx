import React, { useState } from 'react';
import {
  Sparkles,
  Target,
  Clock,
  ShieldAlert,
  Inbox,
  Calendar,
  Check,
  RefreshCw,
  Sun,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { DailyBriefing, CalendarEvent } from '../types/agent';
import { sound } from '../utils/audio';

interface DailyBriefingViewProps {
  briefing: DailyBriefing | null;
  isLoading: boolean;
  onGenerateBriefing: (params: {
    goals: string;
    scheduleInput: string;
    energyLevel: string;
  }) => Promise<void>;
  onSyncTimeblocksToSchedule: (events: CalendarEvent[]) => void;
}

export const DailyBriefingView: React.FC<DailyBriefingViewProps> = ({
  briefing,
  isLoading,
  onGenerateBriefing,
  onSyncTimeblocksToSchedule,
}) => {
  const [goals, setGoals] = useState('Deliver executive sprint roadmap and clear priority communications');
  const [scheduleInput, setScheduleInput] = useState('09:00 Standup, 11:30 Leadership alignment, 14:00 Client demo');
  const [energyLevel, setEnergyLevel] = useState('Morning Peak Focus (08:30 - 12:00)');
  const [synced, setSynced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSynced(false);
    onGenerateBriefing({ goals, scheduleInput, energyLevel });
  };

  const handleSyncToSchedule = () => {
    if (!briefing || !briefing.timeblocks) return;
    sound.playAgentComplete();

    const events: CalendarEvent[] = briefing.timeblocks.map((block, idx) => {
      const [start, end] = block.time.split('-').map((s) => s.trim());
      const catMap: Record<string, CalendarEvent['category']> = {
        deep_work: 'Deep Work',
        comms: 'Meeting',
        prep: 'Triage',
        break: 'Personal',
        admin: 'Review',
      };

      return {
        id: `brief-cal-${Date.now()}-${idx}`,
        title: block.activity,
        startTime: start || '09:00',
        endTime: end || '10:00',
        category: catMap[block.type] || 'Deep Work',
        description: `Generated via Daily Executive Briefing (${block.type})`,
      };
    });

    onSyncTimeblocksToSchedule(events);
    setSynced(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
      {/* Top Banner & Generation Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 lg:p-7 shadow-xl shadow-black/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <h2 className="text-lg lg:text-xl font-bold text-slate-100 flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-400" />
              <span>Executive Daily Briefing & Rhythm Engine</span>
            </h2>
            <p className="text-xs text-slate-400">
              Align your mental model, protect deep work slots, and conquer complex daily priorities with AI precision.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Date:</span>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-indigo-300">
              {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Input Parameters */}
        <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              <span>Today's Top 1-2 Goals</span>
            </label>
            <input
              type="text"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="e.g. Ship enterprise proposal, review Q3 finances"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Existing Fixed Meetings</span>
            </label>
            <input
              type="text"
              value={scheduleInput}
              onChange={(e) => setScheduleInput(e.target.value)}
              placeholder="e.g. 9 AM Standup, 2 PM Design review"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Energy Profile</span>
            </label>
            <div className="flex gap-2">
              <select
                value={energyLevel}
                onChange={(e) => setEnergyLevel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Morning Peak Focus (08:30 - 12:00)">Morning Peak Focus (08:30 - 12:00)</option>
                <option value="Afternoon Flow (13:00 - 17:00)">Afternoon Flow (13:00 - 17:00)</option>
                <option value="Even Distribution (Balanced Rhythm)">Even Distribution (Balanced Rhythm)</option>
                <option value="High Urgency Sprint Mode">High Urgency Sprint Mode</option>
              </select>

              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-md shadow-indigo-600/30"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Generate</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Briefing Results */}
      {briefing && (
        <div className="space-y-6">
          {/* Executive Greeting & Motto Card */}
          <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-800/40 rounded-3xl p-6 shadow-xl space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono uppercase text-indigo-400 font-semibold tracking-wider">
                Daily Focus Blueprint
              </span>
              <span className="text-xs font-mono text-slate-400">
                Agent Synthesized
              </span>
            </div>
            <h3 className="text-lg lg:text-xl font-bold text-slate-100">
              {briefing.greeting || 'Good morning, Commander.'}
            </h3>
            <p className="text-sm font-medium text-indigo-300 italic">
              "{briefing.focusMotto || 'Guard deep work blocks, eliminate context switching, and execute with precision.'}"
            </p>
          </div>

          {/* Top 3 Needle-Movers & Pitfalls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top 3 Priorities (2 cols) */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Target className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-semibold text-slate-100">Top 3 Needle Movers</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-auto">
                  High Leverage
                </span>
              </div>

              <div className="space-y-3">
                {briefing.top3Priorities?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3 hover:border-slate-700 transition-all"
                  >
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      0{idx + 1}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-100">{item.priority}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {item.targetTime}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pitfalls & Inbox Strategy (1 col) */}
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 border-b border-slate-800 pb-3">
                  <ShieldAlert className="w-4 h-4" />
                  <h4 className="text-sm font-semibold text-slate-100">Pitfalls & Friction Points</h4>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {briefing.pitfallsToAvoid?.map((pit, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{pit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 border-b border-slate-800 pb-3">
                  <Inbox className="w-4 h-4" />
                  <h4 className="text-sm font-semibold text-slate-100">Inbox & Comms Protocol</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                  {briefing.inboxStrategy || 'Batch process emails at 11:30 and 16:30. Resist reactive checking during deep-work slots.'}
                </p>
              </div>
            </div>
          </div>

          {/* Chronological Time-Blocks & Schedule Sync */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-semibold text-slate-100">Optimized Daily Timeline</h4>
              </div>

              <button
                onClick={handleSyncToSchedule}
                disabled={synced}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  synced
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                }`}
              >
                {synced ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Timeblocks Synced to Schedule Studio</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Sync All Timeblocks to Schedule Studio</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {briefing.timeblocks?.map((block, idx) => {
                const typeStyles: Record<string, { bg: string; border: string; text: string; badge: string }> = {
                  deep_work: { bg: 'bg-indigo-950/40', border: 'border-indigo-800/50', text: 'text-indigo-300', badge: 'DEEP WORK' },
                  comms: { bg: 'bg-sky-950/40', border: 'border-sky-800/50', text: 'text-sky-300', badge: 'MEETING' },
                  prep: { bg: 'bg-amber-950/40', border: 'border-amber-800/50', text: 'text-amber-300', badge: 'TRIAGE' },
                  break: { bg: 'bg-emerald-950/40', border: 'border-emerald-800/50', text: 'text-emerald-300', badge: 'RECHARGE' },
                  admin: { bg: 'bg-slate-950/80', border: 'border-slate-800', text: 'text-slate-300', badge: 'EXECUTION' },
                };
                const style = typeStyles[block.type] || typeStyles.admin;

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border ${style.bg} ${style.border} space-y-2 flex flex-col justify-between`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-slate-200">{block.time}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${style.text} bg-slate-950 border border-slate-800 font-semibold`}>
                        {style.badge}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-200 leading-relaxed">
                      {block.activity}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
