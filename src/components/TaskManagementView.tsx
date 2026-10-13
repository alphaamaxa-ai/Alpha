import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Play,
  Calendar,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  Trash2,
  Check,
  RotateCcw,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Eye,
  FileText,
  Tag,
  Zap,
} from 'lucide-react';
import {
  ManagedTask,
  TaskPriority,
  TaskStatus,
  SpecializedAgent,
  AgentMode,
} from '../types/agent';
import { SPECIALIZED_AGENTS } from '../utils/storage';
import { sound } from '../utils/audio';

interface TaskManagementViewProps {
  tasks: ManagedTask[];
  onAddTask: (task: ManagedTask) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onExecuteTaskWithAgent: (task: ManagedTask) => Promise<void>;
  runningTaskId: string | null;
  onSelectTaskForReview: (task: ManagedTask) => void;
}

export const TaskManagementView: React.FC<TaskManagementViewProps> = ({
  tasks,
  onAddTask,
  onUpdateTaskStatus,
  onDeleteTask,
  onExecuteTaskWithAgent,
  runningTaskId,
  onSelectTaskForReview,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedAgentId, setAssignedAgentId] = useState('agent-atlas');
  const [priority, setPriority] = useState<TaskPriority>('high');
  const [deadlineDate, setDeadlineDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(17, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [category, setCategory] = useState('Executive');
  const [tagsInput, setTagsInput] = useState('Priority, Q4');
  const [runImmediately, setRunImmediately] = useState(false);

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesAgent = agentFilter === 'all' || t.assignedAgentId === agentFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesAgent;
  });

  // Calculate statistics
  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const failedCount = tasks.filter((t) => t.status === 'failed').length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Helpers
  const getAgent = (agentId: string): SpecializedAgent => {
    return (
      SPECIALIZED_AGENTS.find((a) => a.id === agentId) || SPECIALIZED_AGENTS[0]
    );
  };

  const formatDeadline = (isoString: string) => {
    try {
      const target = new Date(isoString);
      const now = new Date();
      const diffMs = target.getTime() - now.getTime();
      const diffHrs = Math.round(diffMs / (1000 * 60 * 60));

      const dateStr = target.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
      const timeStr = target.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });

      if (diffMs < 0) {
        return {
          text: `Overdue (${Math.abs(diffHrs)}h ago)`,
          isOverdue: true,
          display: `${dateStr} ${timeStr}`,
        };
      } else if (diffHrs <= 24) {
        return {
          text: `Due in ${diffHrs}h`,
          isOverdue: false,
          isUrgent: true,
          display: `${dateStr} ${timeStr}`,
        };
      } else {
        const days = Math.round(diffHrs / 24);
        return {
          text: `Due in ${days}d`,
          isOverdue: false,
          isUrgent: false,
          display: `${dateStr} ${timeStr}`,
        };
      }
    } catch {
      return { text: 'No deadline', isOverdue: false, display: '' };
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newTask: ManagedTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      assignedAgentId,
      priority,
      status: runImmediately ? 'in_progress' : 'pending',
      deadline: new Date(deadlineDate).toISOString(),
      category,
      tags: parsedTags.length > 0 ? parsedTags : ['General'],
      createdAt: new Date().toISOString(),
    };

    onAddTask(newTask);
    setShowCreateModal(false);

    // Reset form
    setTitle('');
    setDescription('');
    setTagsInput('Priority');

    if (runImmediately) {
      await onExecuteTaskWithAgent(newTask);
    }
  };

  const priorityStyles: Record<TaskPriority, { bg: string; text: string; border: string }> = {
    urgent: { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' },
    high: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
    medium: { bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/30' },
    low: { bg: 'bg-slate-800', text: 'text-slate-400', border: 'border-slate-700' },
  };

  const statusCols: { id: TaskStatus; label: string; icon: any; color: string; count: number }[] = [
    { id: 'pending', label: 'Pending Dispatch', icon: Clock, color: 'text-slate-400', count: pendingCount },
    { id: 'in_progress', label: 'In Progress / Agent Active', icon: Sparkles, color: 'text-indigo-400', count: inProgressCount },
    { id: 'completed', label: 'Completed Deliverables', icon: CheckCircle2, color: 'text-emerald-400', count: completedCount },
    { id: 'failed', label: 'Failed / Blocked', icon: XCircle, color: 'text-rose-400', count: failedCount },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
      {/* Top Banner & Stats Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <h2 className="text-lg lg:text-xl font-bold text-slate-100 flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              <span>AI Agent Task Management & Autonomous Dispatch</span>
            </h2>
            <p className="text-xs text-slate-400">
              Assign high-impact goals to specialized autonomous agents, set deadlines, and monitor real-time execution pipelines.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>
        </div>

        {/* Analytics Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400">Total Tasks</div>
            <div className="text-lg font-bold text-slate-100 mt-0.5">{totalCount}</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400">Pending</div>
            <div className="text-lg font-bold text-slate-300 mt-0.5">{pendingCount}</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-indigo-900/40 text-center">
            <div className="text-[10px] font-mono uppercase text-indigo-400">Agent Active</div>
            <div className="text-lg font-bold text-indigo-300 mt-0.5">{inProgressCount}</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-emerald-900/40 text-center">
            <div className="text-[10px] font-mono uppercase text-emerald-400">Completed</div>
            <div className="text-lg font-bold text-emerald-300 mt-0.5">{completedCount}</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-rose-900/40 text-center">
            <div className="text-[10px] font-mono uppercase text-rose-400">Failed / Blocked</div>
            <div className="text-lg font-bold text-rose-300 mt-0.5">{failedCount}</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="text-[10px] font-mono uppercase text-cyan-400">Success Rate</div>
            <div className="text-lg font-bold text-cyan-300 mt-0.5">{completionRate}%</div>
          </div>
        </div>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 sm:flex-none sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks, tags, agents..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses ({totalCount})</option>
            <option value="pending">Pending ({pendingCount})</option>
            <option value="in_progress">In Progress ({inProgressCount})</option>
            <option value="completed">Completed ({completedCount})</option>
            <option value="failed">Failed ({failedCount})</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Assigned Agent Filter */}
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Agents</option>
            {SPECIALIZED_AGENTS.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name} ({agent.badge})
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle (Kanban / List) */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-end lg:self-auto">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
              viewMode === 'kanban'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
              viewMode === 'list'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List Table</span>
          </button>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {statusCols.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            const ColIcon = col.icon;

            return (
              <div
                key={col.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3 min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <ColIcon className={`w-4 h-4 ${col.color}`} />
                    <span className="text-xs font-bold text-slate-200">{col.label}</span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300 font-semibold">
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Task Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl p-4 text-[11px] text-slate-500">
                      No tasks in {col.label}
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const agent = getAgent(task.assignedAgentId);
                      const deadlineInfo = formatDeadline(task.deadline);
                      const pStyle = priorityStyles[task.priority] || priorityStyles.medium;
                      const isTaskRunning = runningTaskId === task.id;

                      return (
                        <div
                          key={task.id}
                          className="bg-slate-950 border border-slate-800/90 hover:border-slate-700 rounded-xl p-3.5 space-y-3 transition-all shadow-md group relative"
                        >
                          {/* Top Badges */}
                          <div className="flex items-center justify-between gap-1.5">
                            <span
                              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md font-semibold border ${pStyle.bg} ${pStyle.text} ${pStyle.border}`}
                            >
                              {task.priority}
                            </span>

                            {/* Deadline info */}
                            <div
                              className={`text-[10px] font-mono flex items-center gap-1 ${
                                deadlineInfo.isOverdue
                                  ? 'text-rose-400 font-semibold'
                                  : deadlineInfo.isUrgent
                                  ? 'text-amber-400 font-medium'
                                  : 'text-slate-400'
                              }`}
                              title={deadlineInfo.display}
                            >
                              <Calendar className="w-3 h-3" />
                              <span>{deadlineInfo.text}</span>
                            </div>
                          </div>

                          {/* Title & Description */}
                          <div className="space-y-1">
                            <h4 className="text-xs font-semibold text-slate-100 group-hover:text-indigo-200 transition-colors leading-snug">
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                                {task.description}
                              </p>
                            )}
                          </div>

                          {/* Assigned Agent Pill */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 rounded-lg ${agent.avatarBg} ${agent.avatarColor} flex items-center justify-center text-[11px] font-bold`}
                              >
                                {agent.name[0]}
                              </div>
                              <div className="text-left">
                                <div className="text-[11px] font-semibold text-slate-200">
                                  {agent.name}
                                </div>
                                <div className="text-[9px] font-mono text-slate-500">
                                  {agent.badge}
                                </div>
                              </div>
                            </div>

                            {/* Category tag */}
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                              {task.category}
                            </span>
                          </div>

                          {/* Result Summary snippet if completed */}
                          {task.resultSummary && (
                            <div className="bg-emerald-950/20 border border-emerald-900/30 p-2 rounded-lg text-[10px] text-emerald-300 line-clamp-2">
                              ✓ {task.resultSummary}
                            </div>
                          )}

                          {/* Action Controls */}
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                            {/* Run with Agent button */}
                            {task.status !== 'completed' ? (
                              <button
                                onClick={() => onExecuteTaskWithAgent(task)}
                                disabled={isTaskRunning}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                  isTaskRunning
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                                }`}
                              >
                                {isTaskRunning ? (
                                  <>
                                    <Sparkles className="w-3 h-3 animate-spin" />
                                    <span>Agent Working...</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3 h-3 fill-current" />
                                    <span>Dispatch {agent.name}</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => onSelectTaskForReview(task)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 transition-colors cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Inspect Output</span>
                              </button>
                            )}

                            {/* Status mover select & delete */}
                            <div className="flex items-center gap-1">
                              <select
                                value={task.status}
                                onChange={(e) =>
                                  onUpdateTaskStatus(task.id, e.target.value as TaskStatus)
                                }
                                className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300 rounded px-1.5 py-1 focus:outline-none"
                              >
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
                              </select>

                              <button
                                onClick={() => onDeleteTask(task.id)}
                                className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                                title="Delete task"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST TABLE VIEW */}
      {viewMode === 'list' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Task Details</th>
                  <th className="px-4 py-3">Assigned Agent</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Deadline</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500 text-xs">
                      No matching tasks found.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const agent = getAgent(task.assignedAgentId);
                    const deadlineInfo = formatDeadline(task.deadline);
                    const pStyle = priorityStyles[task.priority] || priorityStyles.medium;
                    const isTaskRunning = runningTaskId === task.id;

                    return (
                      <tr key={task.id} className="hover:bg-slate-950/60 transition-colors">
                        <td className="px-4 py-3 max-w-xs">
                          <div className="font-semibold text-slate-100">{task.title}</div>
                          {task.description && (
                            <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {task.description}
                            </div>
                          )}
                          <div className="flex gap-1 mt-1">
                            {task.tags?.map((t) => (
                              <span
                                key={t}
                                className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-lg ${agent.avatarBg} ${agent.avatarColor} flex items-center justify-center text-[10px] font-bold`}
                            >
                              {agent.name[0]}
                            </div>
                            <div>
                              <div className="font-medium text-slate-200">{agent.name}</div>
                              <div className="text-[10px] font-mono text-slate-400">
                                {agent.badge}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md font-semibold border ${pStyle.bg} ${pStyle.text} ${pStyle.border}`}
                          >
                            {task.priority}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <select
                            value={task.status}
                            onChange={(e) =>
                              onUpdateTaskStatus(task.id, e.target.value as TaskStatus)
                            }
                            className={`text-[11px] font-mono rounded-lg px-2 py-1 border focus:outline-none cursor-pointer ${
                              task.status === 'completed'
                                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                                : task.status === 'in_progress'
                                ? 'bg-indigo-950/60 border-indigo-800 text-indigo-300'
                                : task.status === 'failed'
                                ? 'bg-rose-950/60 border-rose-800 text-rose-400'
                                : 'bg-slate-950 border-slate-800 text-slate-300'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                          </select>
                        </td>

                        <td className="px-4 py-3 font-mono text-[11px]">
                          <div
                            className={
                              deadlineInfo.isOverdue
                                ? 'text-rose-400 font-bold'
                                : deadlineInfo.isUrgent
                                ? 'text-amber-400'
                                : 'text-slate-300'
                            }
                          >
                            {deadlineInfo.text}
                          </div>
                          <div className="text-[10px] text-slate-500">{deadlineInfo.display}</div>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {task.status !== 'completed' ? (
                              <button
                                onClick={() => onExecuteTaskWithAgent(task)}
                                disabled={isTaskRunning}
                                className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
                              >
                                {isTaskRunning ? (
                                  <Sparkles className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Play className="w-3 h-3 fill-current" />
                                )}
                                <span>Dispatch</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => onSelectTaskForReview(task)}
                                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Inspect</span>
                              </button>
                            )}

                            <button
                              onClick={() => onDeleteTask(task.id)}
                              className="p-1 text-slate-500 hover:text-rose-400 rounded cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Create & Assign AI Agent Task</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Conduct Q4 Competitive Benchmark Analysis"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  Task Objectives & Context
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe key outcomes, target metrics, constraints, or references..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Agent Selection Grid */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Assign to Specialized AI Agent</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SPECIALIZED_AGENTS.map((agent) => {
                    const isSelected = assignedAgentId === agent.id;
                    return (
                      <div
                        key={agent.id}
                        onClick={() => setAssignedAgentId(agent.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-lg ${agent.avatarBg} ${agent.avatarColor} text-xs font-bold flex items-center justify-center`}
                          >
                            {agent.name[0]}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-200">{agent.name}</div>
                            <div className="text-[10px] font-mono text-indigo-400">
                              {agent.badge}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Priority and Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="urgent">🔴 Urgent (Immediate Action)</option>
                    <option value="high">🟠 High Priority</option>
                    <option value="medium">🔵 Medium Priority</option>
                    <option value="low">⚪ Low / Backlog</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Deadline</label>
                  <input
                    type="datetime-local"
                    required
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Category and Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Executive">Executive</option>
                    <option value="Research">Research & Intel</option>
                    <option value="Communications">Communications</option>
                    <option value="Operations">Operations</option>
                    <option value="Data & Finance">Data & Finance</option>
                    <option value="Automation">Automation</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g. Q4, Contract, Urgent"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Dispatch Immediately Checkbox */}
              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={runImmediately}
                    onChange={(e) => setRunImmediately(e.target.checked)}
                    className="rounded text-indigo-600 bg-slate-950 border-slate-700 w-4 h-4"
                  />
                  <span className="font-semibold text-indigo-300">
                    Dispatch agent immediately upon creation (Autopilot)
                  </span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-indigo-600/30 transition-all"
                >
                  Create & Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
