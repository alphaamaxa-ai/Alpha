import React from 'react';
import {
  Sparkles,
  Bot,
  Calendar,
  Layers,
  FileText,
  Clock,
  History,
  CheckCircle2,
  Cpu,
  ListTodo,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'commander' | 'tasks' | 'briefing' | 'workflows' | 'schedule' | 'scratchpad';
  setActiveTab: (
    tab: 'commander' | 'tasks' | 'briefing' | 'workflows' | 'schedule' | 'scratchpad'
  ) => void;
  openHistory: () => void;
  historyCount: number;
  taskCount: number;
  pomodoroActive: boolean;
  pomodoroTimeLeft: number;
  scratchpadHasContent: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  openHistory,
  historyCount,
  taskCount,
  pomodoroActive,
  pomodoroTimeLeft,
  scratchpadHasContent,
}) => {
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  interface NavItem {
    id: 'commander' | 'tasks' | 'briefing' | 'workflows' | 'schedule' | 'scratchpad';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    extra?: React.ReactNode;
  }

  const navItems: NavItem[] = [
    { id: 'commander', label: 'Agent Commander', icon: Bot, badge: 'Core' },
    {
      id: 'tasks',
      label: 'Task Manager',
      icon: ListTodo,
      badge: taskCount > 0 ? String(taskCount) : undefined,
    },
    { id: 'briefing', label: 'Daily Briefing', icon: Sparkles },
    { id: 'workflows', label: 'Automations', icon: Layers, badge: '6' },
    {
      id: 'schedule',
      label: 'Schedule & Focus',
      icon: Calendar,
      extra: pomodoroActive ? (
        <span className="ml-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/20 text-amber-300 animate-pulse">
          <Clock className="w-2.5 h-2.5" />
          {formatTimer(pomodoroTimeLeft)}
        </span>
      ) : null,
    },
    {
      id: 'scratchpad',
      label: 'Memory & Notes',
      icon: FileText,
      extra: scratchpadHasContent ? (
        <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1"></span>
      ) : null,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-100 text-base tracking-tight flex items-center gap-1.5">
                  OmniTask{' '}
                  <span className="text-xs px-1.5 py-0.5 rounded font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    AGENT OS
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-mono text-slate-300">gemini-3.8-flash</span> · Autonomous Engine
              </p>
            </div>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={openHistory}
              className="p-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg text-xs flex items-center gap-1"
            >
              <History className="w-3.5 h-3.5" />
              <span>{historyCount}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && !item.extra && (
                  <span
                    className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                      isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.extra}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={openHistory}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            title="View Task Run History"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 font-mono text-indigo-300">
                {historyCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-[11px] font-mono">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Autonomous Mode Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};
