import React, { useState } from 'react';
import {
  Layers,
  Zap,
  Play,
  Plus,
  Clock,
  Tag,
  Search,
  Sun,
  FileCheck,
  Mail,
  Compass,
  BarChart3,
  Calculator,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { AutomationWorkflow } from '../types/agent';

interface WorkflowsHubProps {
  workflows: AutomationWorkflow[];
  onTriggerWorkflow: (workflow: AutomationWorkflow) => void;
  onCreateWorkflow: (workflow: AutomationWorkflow) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sun: Sun,
  FileCheck: FileCheck,
  Mail: Mail,
  Compass: Compass,
  BarChart3: BarChart3,
  Calculator: Calculator,
};

export const WorkflowsHub: React.FC<WorkflowsHubProps> = ({
  workflows,
  onTriggerWorkflow,
  onCreateWorkflow,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Workflow form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Productivity');
  const [newPrompt, setNewPrompt] = useState('');
  const [newTimeSaved, setNewTimeSaved] = useState('30 mins');

  const allTags = Array.from(new Set(workflows.flatMap((w) => w.tags || [])));

  const filteredWorkflows = workflows.filter((w) => {
    const matchesSearch =
      w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === 'all' || w.tags?.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrompt.trim()) return;

    const created: AutomationWorkflow = {
      id: `custom-wf-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || 'Custom user automation pipeline',
      category: newCategory,
      icon: 'Zap',
      estimatedTimeSaved: newTimeSaved,
      defaultPrompt: newPrompt.trim(),
      tags: ['Custom', newCategory],
    };

    onCreateWorkflow(created);
    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
    setNewPrompt('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl shadow-black/40">
        <div>
          <h2 className="text-lg lg:text-xl font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Automated Workflows & Productivity Pipelines</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pre-assembled agent playbooks designed to eliminate repetitive operational friction in 1 click.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Custom Workflow</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search workflows & playbooks..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              selectedTag === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All ({workflows.length})
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                selectedTag === t
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              #{t}
            </button>
          ))}
        </div>
      </div>

      {/* Workflow Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkflows.map((wf) => {
          const Icon = iconMap[wf.icon] || Zap;
          return (
            <div
              key={wf.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    <Clock className="w-3 h-3" />
                    <span>Saves ~{wf.estimatedTimeSaved}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider mb-0.5">
                    {wf.category}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors">
                    {wf.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1 line-clamp-2">
                    {wf.description}
                  </p>
                </div>

                {/* Prompt Preview Snippet */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 line-clamp-2 italic">
                  "{wf.defaultPrompt}"
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {wf.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-800/80 text-slate-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => onTriggerWorkflow(wf)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Autopilot Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Custom Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Create Custom Workflow Pipeline</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Workflow Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Daily Client Slack Digest"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Short Description</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Scans active client conversations and prepares summary bullets"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Communications">Communications</option>
                    <option value="Strategy & Research">Strategy & Research</option>
                    <option value="Operations">Operations</option>
                    <option value="Data & Finance">Data & Finance</option>
                    <option value="Daily Routine">Daily Routine</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Est. Time Saved</label>
                  <input
                    type="text"
                    value={newTimeSaved}
                    onChange={(e) => setNewTimeSaved(e.target.value)}
                    placeholder="e.g. 45 mins"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Agent Instruction Prompt</label>
                <textarea
                  required
                  rows={4}
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="Provide precise execution instructions for what the agent must do..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Save Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
