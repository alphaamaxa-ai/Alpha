import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  Coffee,
  Brain,
  Zap,
} from 'lucide-react';
import { CalendarEvent } from '../types/agent';
import { sound } from '../utils/audio';

interface ScheduleFocusStudioProps {
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
  onRemoveEvent: (id: string) => void;
  onClearEvents: () => void;
  pomodoroActive: boolean;
  pomodoroTimeLeft: number;
  setPomodoroActive: (active: boolean) => void;
  setPomodoroTimeLeft: (time: number | ((prev: number) => number)) => void;
  pomodoroDuration: number;
  setPomodoroDuration: (duration: number) => void;
}

export const ScheduleFocusStudio: React.FC<ScheduleFocusStudioProps> = ({
  events,
  onAddEvent,
  onRemoveEvent,
  onClearEvents,
  pomodoroActive,
  pomodoroTimeLeft,
  setPomodoroActive,
  setPomodoroTimeLeft,
  pomodoroDuration,
  setPomodoroDuration,
}) => {
  const [timerMode, setTimerMode] = useState<'deep' | 'short_break' | 'long_break'>('deep');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Event Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventStart, setEventStart] = useState('10:00');
  const [eventEnd, setEventEnd] = useState('11:00');
  const [eventCategory, setEventCategory] = useState<CalendarEvent['category']>('Deep Work');
  const [eventDesc, setEventDesc] = useState('');

  // Timer interval handling
  useEffect(() => {
    let interval: any = null;
    if (pomodoroActive && pomodoroTimeLeft > 0) {
      interval = setInterval(() => {
        setPomodoroTimeLeft((prev) => {
          if (prev <= 1) {
            sound.playTimerAlert();
            setPomodoroActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [pomodoroActive, pomodoroTimeLeft, setPomodoroActive, setPomodoroTimeLeft]);

  const switchTimerMode = (mode: 'deep' | 'short_break' | 'long_break') => {
    setTimerMode(mode);
    setPomodoroActive(false);
    let seconds = 25 * 60;
    if (mode === 'deep') seconds = 25 * 60;
    if (mode === 'short_break') seconds = 5 * 60;
    if (mode === 'long_break') seconds = 15 * 60;
    setPomodoroDuration(seconds);
    setPomodoroTimeLeft(seconds);
  };

  const handleResetTimer = () => {
    setPomodoroActive(false);
    setPomodoroTimeLeft(pomodoroDuration);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const timerProgress = pomodoroDuration > 0 ? ((pomodoroDuration - pomodoroTimeLeft) / pomodoroDuration) * 100 : 0;

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const newEvt: CalendarEvent = {
      id: `manual-evt-${Date.now()}`,
      title: eventTitle.trim(),
      startTime: eventStart,
      endTime: eventEnd,
      category: eventCategory,
      description: eventDesc.trim(),
    };

    onAddEvent(newEvt);
    setShowAddModal(false);
    setEventTitle('');
    setEventDesc('');
  };

  // Sort events chronologically
  const sortedEvents = [...events].sort((a, b) => a.startTime.localeCompare(b.startTime));

  const deepWorkCount = sortedEvents.filter((e) => e.category === 'Deep Work').length;
  const meetingsCount = sortedEvents.filter((e) => e.category === 'Meeting').length;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Deep Work Focus Engine (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-indigo-400 font-semibold tracking-wider flex items-center gap-1.5">
                <Brain className="w-4 h-4" />
                Deep Work Focus Engine
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                Anti-Distraction
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100">
              {timerMode === 'deep' ? 'Unbroken Focus Sprint' : 'Cognitive Recharge Block'}
            </h3>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => switchTimerMode('deep')}
              className={`py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-all ${
                timerMode === 'deep' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              25m Focus
            </button>
            <button
              onClick={() => switchTimerMode('short_break')}
              className={`py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-all ${
                timerMode === 'short_break' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              5m Recharge
            </button>
            <button
              onClick={() => switchTimerMode('long_break')}
              className={`py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-all ${
                timerMode === 'long_break' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              15m Rest
            </button>
          </div>

          {/* Big Timer Circle Display */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="text-slate-800 stroke-current"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="text-indigo-500 stroke-current transition-all duration-1000 ease-linear"
                  strokeWidth="6"
                  strokeDasharray="276.46"
                  strokeDashoffset={276.46 - (276.46 * timerProgress) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl lg:text-4xl font-extrabold font-mono text-slate-100 tracking-tight">
                  {formatTimer(pomodoroTimeLeft)}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-1">
                  {pomodoroActive ? 'In Flow State' : 'Paused'}
                </span>
              </div>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setPomodoroActive(!pomodoroActive)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-lg cursor-pointer ${
                pomodoroActive
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {pomodoroActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Session</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Deep Work</span>
                </>
              )}
            </button>

            <button
              onClick={handleResetTimer}
              className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Daily Schedule Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Today's Chronological Schedule</span>
              </h3>
              <p className="text-xs text-slate-400">
                Synced from Agent Executions, Briefings, or custom entries.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Timeblock</span>
              </button>

              {sortedEvents.length > 0 && (
                <button
                  onClick={onClearEvents}
                  className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 rounded-xl text-xs cursor-pointer transition-colors"
                  title="Clear all events"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Total Blocks</div>
              <div className="text-sm font-bold text-slate-100 mt-0.5">{sortedEvents.length}</div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-indigo-400 uppercase">Deep Work</div>
              <div className="text-sm font-bold text-indigo-300 mt-0.5">{deepWorkCount} blocks</div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-sky-400 uppercase">Sync / Meetings</div>
              <div className="text-sm font-bold text-sky-300 mt-0.5">{meetingsCount} blocks</div>
            </div>
          </div>

          {/* Timeline List */}
          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[380px] pr-1">
            {sortedEvents.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No events scheduled for today yet.</p>
                <p className="text-[11px] text-slate-500">
                  Run an agent task in Commander or generate a Daily Briefing to auto-populate.
                </p>
              </div>
            ) : (
              sortedEvents.map((evt, idx) => {
                const catStyles: Record<string, string> = {
                  'Deep Work': 'border-l-4 border-l-indigo-500 bg-indigo-950/20 text-indigo-300',
                  Meeting: 'border-l-4 border-l-sky-500 bg-sky-950/20 text-sky-300',
                  Triage: 'border-l-4 border-l-amber-500 bg-amber-950/20 text-amber-300',
                  Review: 'border-l-4 border-l-purple-500 bg-purple-950/20 text-purple-300',
                  Personal: 'border-l-4 border-l-emerald-500 bg-emerald-950/20 text-emerald-300',
                };
                const style = catStyles[evt.category] || 'border-l-4 border-l-slate-600 bg-slate-950';

                return (
                  <div
                    key={evt.id || idx}
                    className={`p-3 rounded-xl border border-slate-800/80 ${style} flex items-start justify-between gap-3 hover:border-slate-700 transition-all`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-200">
                          {evt.startTime} – {evt.endTime}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          {evt.category}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-100">{evt.title}</div>
                      {evt.description && (
                        <div className="text-[11px] text-slate-400 leading-relaxed">
                          {evt.description}
                        </div>
                      )}
                    </div>

                    {evt.id && (
                      <button
                        onClick={() => onRemoveEvent(evt.id!)}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                        title="Remove event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Manual Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Add Schedule Block</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Activity Title</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Deep Work: System Architecture"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Start Time</label>
                  <input
                    type="time"
                    value={eventStart}
                    onChange={(e) => setEventStart(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">End Time</label>
                  <input
                    type="time"
                    value={eventEnd}
                    onChange={(e) => setEventEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Category</label>
                <select
                  value={eventCategory}
                  onChange={(e) => setEventCategory(e.target.value as CalendarEvent['category'])}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Deep Work">Deep Work</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Triage">Triage</option>
                  <option value="Review">Review</option>
                  <option value="Personal">Personal / Break</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Notes / Objectives (Optional)</label>
                <input
                  type="text"
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="e.g. Mute notifications, focus on core DB queries"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Save Timeblock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
