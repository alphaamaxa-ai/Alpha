import React, { useState } from 'react';
import {
  FileText,
  Mail,
  Calendar,
  Table as TableIcon,
  CheckSquare,
  Copy,
  Check,
  Download,
  Plus,
  Sparkles,
  Send,
  Clock,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { Deliverables, ActionItem, CalendarEvent, EmailDraft } from '../types/agent';
import { sound } from '../utils/audio';

interface DeliverablesViewerProps {
  deliverables: Deliverables;
  taskTitle: string;
  onAddCalendarEvent: (event: CalendarEvent) => void;
  onRefine: (instruction: string, field: string) => Promise<void>;
  isRefining: boolean;
}

export const DeliverablesViewer: React.FC<DeliverablesViewerProps> = ({
  deliverables,
  taskTitle,
  onAddCalendarEvent,
  onRefine,
  isRefining,
}) => {
  const [activeTab, setActiveTab] = useState<'doc' | 'emails' | 'calendar' | 'data' | 'actions'>('doc');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionsList, setActionsList] = useState<ActionItem[]>(deliverables.suggestedActions || []);
  const [addedEvents, setAddedEvents] = useState<Record<number, boolean>>({});
  const [refineInput, setRefineInput] = useState('');

  // Keep actionsList in sync if deliverables change
  React.useEffect(() => {
    setActionsList(deliverables.suggestedActions || []);
  }, [deliverables.suggestedActions]);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  const downloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadCsv = (title: string, headers: string[], rows: string[][]) => {
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleAction = (id: string) => {
    sound.playCheck();
    setActionsList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleAddEvent = (event: CalendarEvent, idx: number) => {
    sound.playCheck();
    onAddCalendarEvent(event);
    setAddedEvents((prev) => ({ ...prev, [idx]: true }));
  };

  const handleRefineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refineInput.trim() || isRefining) return;
    const input = refineInput.trim();
    setRefineInput('');
    await onRefine(input, activeTab);
  };

  const emails = deliverables.emailDrafts || [];
  const calendarEvents = deliverables.calendarEvents || [];
  const dataArtifacts = deliverables.dataArtifacts || [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/40 flex flex-col">
      {/* Deliverables Header with Tabs */}
      <div className="bg-slate-950/80 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Deliverables & Workstation
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Ready for Execution
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Interactive outputs produced by autonomous agent
            </p>
          </div>
        </div>

        {/* View Sub-Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('doc')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
              activeTab === 'doc'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Document</span>
          </button>

          {emails.length > 0 && (
            <button
              onClick={() => setActiveTab('emails')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                activeTab === 'emails'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Emails</span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-indigo-950 text-indigo-300">
                {emails.length}
              </span>
            </button>
          )}

          {calendarEvents.length > 0 && (
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                activeTab === 'calendar'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule</span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-indigo-950 text-indigo-300">
                {calendarEvents.length}
              </span>
            </button>
          )}

          {dataArtifacts.length > 0 && (
            <button
              onClick={() => setActiveTab('data')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                activeTab === 'data'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Data Matrix</span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-indigo-950 text-indigo-300">
                {dataArtifacts.length}
              </span>
            </button>
          )}

          {actionsList.length > 0 && (
            <button
              onClick={() => setActiveTab('actions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                activeTab === 'actions'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Action Items</span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-indigo-950 text-indigo-300">
                {actionsList.filter((a) => a.completed).length}/{actionsList.length}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="p-4 lg:p-6 flex-1 min-h-[350px]">
        {/* DOCUMENT / MARKDOWN VIEW */}
        {activeTab === 'doc' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-slate-400">
                Comprehensive Executive Output
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(deliverables.markdownContent, 'doc-copy')}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                >
                  {copiedId === 'doc-copy' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() =>
                    downloadTextFile(
                      deliverables.markdownContent,
                      `${taskTitle.toLowerCase().replace(/\s+/g, '_') || 'omnitask_output'}.md`
                    )
                  }
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .md</span>
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans selection:bg-indigo-500 selection:text-white">
              {deliverables.markdownContent || 'No document text generated.'}
            </div>
          </div>
        )}

        {/* EMAIL DRAFTS VIEW */}
        {activeTab === 'emails' && (
          <div className="space-y-4">
            <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
              <span>Ready-to-Send Email Drafts</span>
              <span>Total: {emails.length}</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {emails.map((email: EmailDraft, idx: number) => {
                const draftId = `email-${idx}`;
                return (
                  <div
                    key={idx}
                    className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                      <div className="space-y-1">
                        <div className="text-xs text-slate-400 flex items-center gap-1.5">
                          <span className="font-mono text-slate-500">To:</span>
                          <span className="font-medium text-slate-200">{email.recipient || 'Recipient'}</span>
                        </div>
                        <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                          <span>{email.subject}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {email.tone || 'Professional'}
                        </span>
                        <button
                          onClick={() => copyToClipboard(email.body, draftId)}
                          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                        >
                          {copiedId === draftId ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Copy Email</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800/60 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                      {email.body}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CALENDAR VIEW */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
              <span>Optimized Timeblocks & Scheduled Events</span>
              <span>Click "Add to Schedule" to sync with Timeline</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {calendarEvents.map((evt: CalendarEvent, idx: number) => {
                const isAdded = addedEvents[idx];
                return (
                  <div
                    key={idx}
                    className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {evt.startTime} – {evt.endTime}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {evt.category || 'Focus'}
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-slate-100">{evt.title}</h4>
                      {evt.description && (
                        <p className="text-xs text-slate-400 leading-relaxed">{evt.description}</p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 mt-3 flex items-center justify-end">
                      <button
                        onClick={() => handleAddEvent(evt, idx)}
                        disabled={isAdded}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                          isAdded
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 cursor-default'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added to My Day</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Schedule</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DATA MATRIX VIEW */}
        {activeTab === 'data' && (
          <div className="space-y-4">
            <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
              <span>Structured Data Tables & Metrics</span>
              <span>Export ready to CSV</span>
            </div>

            {dataArtifacts.map((table, tIdx) => (
              <div
                key={tIdx}
                className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden shadow-inner"
              >
                <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-200 font-mono flex items-center gap-2">
                    <TableIcon className="w-3.5 h-3.5 text-indigo-400" />
                    {table.title}
                  </h4>
                  <button
                    onClick={() => downloadCsv(table.title, table.headers, table.rows)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export CSV</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900/60 text-slate-300 uppercase font-mono text-[10px] border-b border-slate-800">
                      <tr>
                        {table.headers.map((h, hIdx) => (
                          <th key={hIdx} className="px-3.5 py-2.5">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {table.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-900/40 transition-colors">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-3.5 py-2.5 text-slate-300">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ACTION ITEMS CHECKLIST */}
        {activeTab === 'actions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <span className="text-xs font-mono text-slate-400">
                Action Items ({actionsList.filter((a) => a.completed).length} of {actionsList.length} complete)
              </span>
              <button
                onClick={() => {
                  const checklistText = actionsList
                    .map((a) => `[${a.completed ? 'x' : ' '}] ${a.title} (${a.urgency || 'normal'})`)
                    .join('\n');
                  copyToClipboard(checklistText, 'actions-copy');
                }}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                {copiedId === 'actions-copy' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Checklist</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2">
              {actionsList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleAction(item.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    item.completed
                      ? 'bg-slate-950/40 border-slate-800/50 text-slate-500'
                      : 'bg-slate-950/90 border-slate-800 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="mt-0.5">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 cursor-pointer"
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div
                      className={`text-xs font-medium leading-relaxed ${
                        item.completed ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {item.title}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span
                        className={`px-1.5 py-0.2 rounded uppercase ${
                          item.urgency === 'high'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : item.urgency === 'medium'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.urgency || 'normal'}
                      </span>

                      {item.timeEstimate && (
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {item.timeEstimate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick AI Refine Bar */}
      <div className="bg-slate-950 border-t border-slate-800 p-3">
        <form onSubmit={handleRefineSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={refineInput}
              onChange={(e) => setRefineInput(e.target.value)}
              placeholder={`Refine this ${activeTab === 'doc' ? 'document' : activeTab} (e.g. "make it punchier", "shorten by 30%", "add executive summary")...`}
              disabled={isRefining}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!refineInput.trim() || isRefining}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-medium cursor-pointer transition-colors shrink-0"
          >
            {isRefining ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Polishing...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Refine</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
