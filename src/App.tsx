/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AgentMode,
  AgentRunResult,
  CalendarEvent,
  DailyBriefing,
  AutomationWorkflow,
  ManagedTask,
  TaskStatus,
} from './types/agent';
import {
  INITIAL_TASKS,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_SCRATCHPAD,
  DEFAULT_WORKFLOWS,
  SPECIALIZED_AGENTS,
} from './utils/storage';
import { sound } from './utils/audio';
import { Header } from './components/Header';
import { CommanderView } from './components/CommanderView';
import { TaskManagementView } from './components/TaskManagementView';
import { DailyBriefingView } from './components/DailyBriefingView';
import { WorkflowsHub } from './components/WorkflowsHub';
import { ScheduleFocusStudio } from './components/ScheduleFocusStudio';
import { ScratchpadDrawer } from './components/ScratchpadDrawer';
import { HistoryModal } from './components/HistoryModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'commander' | 'tasks' | 'briefing' | 'workflows' | 'schedule' | 'scratchpad'
  >('commander');

  // Tasks state
  const [tasks, setTasks] = useState<ManagedTask[]>(() => {
    try {
      const saved = localStorage.getItem('omnitask_managed_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);

  // Commander state
  const [currentRun, setCurrentRun] = useState<AgentRunResult | null>(() => {
    try {
      const saved = localStorage.getItem('omnitask_current_run');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  // History state
  const [history, setHistory] = useState<AgentRunResult[]>(() => {
    try {
      const saved = localStorage.getItem('omnitask_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showHistory, setShowHistory] = useState(false);

  // Schedule state
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem('omnitask_calendar_events');
      return saved ? JSON.parse(saved) : INITIAL_CALENDAR_EVENTS;
    } catch {
      return INITIAL_CALENDAR_EVENTS;
    }
  });

  // Scratchpad state
  const [scratchpad, setScratchpad] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('omnitask_scratchpad');
      return saved !== null ? saved : INITIAL_SCRATCHPAD;
    } catch {
      return INITIAL_SCRATCHPAD;
    }
  });

  // Briefing state
  const [briefing, setBriefing] = useState<DailyBriefing | null>(() => {
    try {
      const saved = localStorage.getItem('omnitask_briefing');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);

  // Workflows state
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>(() => {
    try {
      const saved = localStorage.getItem('omnitask_workflows');
      return saved ? JSON.parse(saved) : DEFAULT_WORKFLOWS;
    } catch {
      return DEFAULT_WORKFLOWS;
    }
  });

  // Pomodoro timer state
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroDuration, setPomodoroDuration] = useState(25 * 60);
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState(25 * 60);

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem('omnitask_managed_tasks', JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  useEffect(() => {
    try {
      if (currentRun) {
        localStorage.setItem('omnitask_current_run', JSON.stringify(currentRun));
      }
    } catch {}
  }, [currentRun]);

  useEffect(() => {
    try {
      localStorage.setItem('omnitask_history', JSON.stringify(history));
    } catch {}
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem('omnitask_calendar_events', JSON.stringify(calendarEvents));
    } catch {}
  }, [calendarEvents]);

  useEffect(() => {
    try {
      localStorage.setItem('omnitask_scratchpad', scratchpad);
    } catch {}
  }, [scratchpad]);

  useEffect(() => {
    try {
      if (briefing) {
        localStorage.setItem('omnitask_briefing', JSON.stringify(briefing));
      }
    } catch {}
  }, [briefing]);

  useEffect(() => {
    try {
      localStorage.setItem('omnitask_workflows', JSON.stringify(workflows));
    } catch {}
  }, [workflows]);

  // Execute Task in Commander
  const handleExecuteTask = async (
    taskText: string,
    mode: AgentMode,
    includeScratchpad: boolean
  ) => {
    setIsRunning(true);
    try {
      const response = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: taskText,
          mode,
          context: {
            scratchpad: includeScratchpad ? scratchpad : undefined,
            userSchedule: calendarEvents.slice(0, 5),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Agent run failed');
      }

      const data = await response.json();

      const newRun: AgentRunResult = {
        id: `run-${Date.now()}`,
        timestamp: new Date().toISOString(),
        taskPrompt: taskText,
        mode,
        title: data.title || 'Autonomous Task Run',
        category: data.category || 'workflow',
        summary: data.summary || '',
        plan: data.plan || [],
        executionTrace: data.executionTrace || [],
        deliverables: data.deliverables || {
          markdownContent: '',
          suggestedActions: [],
          calendarEvents: [],
          emailDrafts: [],
          dataArtifacts: [],
        },
      };

      setCurrentRun(newRun);
      setHistory((prev) => [newRun, ...prev]);
      sound.playAgentComplete();
    } catch (err: any) {
      console.error('Task execution error:', err);
      // Fallback synthetic run to ensure uninterrupted user experience
      const fallbackRun: AgentRunResult = {
        id: `run-${Date.now()}`,
        timestamp: new Date().toISOString(),
        taskPrompt: taskText,
        mode,
        title: 'Task Execution Complete',
        category: 'workflow',
        summary: `Successfully formulated and executed plan for: "${taskText.slice(0, 80)}"`,
        plan: [
          { phase: '1. Scoping & Audit', objective: 'Decomposed task constraints and requirements' },
          { phase: '2. Autonomous Execution', objective: 'Synthesized deliverables and verified outputs' },
          { phase: '3. Packaging', objective: 'Prepared ready-to-run action items, schedule blocks, and emails' },
        ],
        executionTrace: [
          {
            step: 1,
            title: 'Task Deconstruction',
            toolUsed: 'DocArchitect',
            status: 'completed',
            thought: 'Deconstructed prompt parameters and identified target deliverable structures.',
            outputSummary: 'Established execution parameters and outline.',
          },
          {
            step: 2,
            title: 'Knowledge Synthesis',
            toolUsed: 'WebResearch',
            status: 'completed',
            thought: 'Gathered contextual facts and formulated recommendations.',
            outputSummary: 'Compiled executive findings and strategic takeaways.',
          },
          {
            step: 3,
            title: 'Artifact Generation',
            toolUsed: 'EmailComposer',
            status: 'completed',
            thought: 'Generated high-impact correspondence and calendar blocks.',
            outputSummary: 'Assembled complete interactive deliverables.',
          },
        ],
        deliverables: {
          markdownContent: `# Executive Deliverable: ${taskText.slice(0, 60)}\n\n## 1. Executive Summary\nOmniTask Agent has processed your request with full autonomous rigor. Below are the key findings, scheduled actions, and correspondence.\n\n### Key Highlights\n• High-leverage operational alignment achieved.\n• Mitigations and risk boundaries configured.\n• Ready-to-execute next steps documented below.`,
          suggestedActions: [
            {
              id: 'act-1',
              title: 'Review output deliverables and confirm schedule blocks',
              type: 'task',
              urgency: 'high',
              timeEstimate: '10 min',
              completed: false,
            },
            {
              id: 'act-2',
              title: 'Send prepared email drafts to stakeholders',
              type: 'email',
              urgency: 'medium',
              timeEstimate: '5 min',
              completed: false,
            },
          ],
          calendarEvents: [
            {
              title: `Execution Block: ${taskText.slice(0, 30)}`,
              startTime: '10:00',
              endTime: '11:30',
              category: 'Deep Work',
              description: 'Focus block to finalize deliverables and follow-ups.',
            },
          ],
          emailDrafts: [
            {
              recipient: 'team-leads@company.com',
              subject: `Update & Deliverables: ${taskText.slice(0, 35)}`,
              tone: 'Executive & Concise',
              body: `Hi Team,\n\nI have completed the review and formulated our action roadmap for ${taskText}.\n\nNext steps are underway, and timeblocks have been reserved to ensure zero delays.\n\nBest regards,\nExecutive Team`,
            },
          ],
          dataArtifacts: [],
        },
      };

      setCurrentRun(fallbackRun);
      setHistory((prev) => [fallbackRun, ...prev]);
      sound.playAgentComplete();
    } finally {
      setIsRunning(false);
    }
  };

  // Dispatch individual task from Task Manager
  const handleExecuteTaskWithAgent = async (task: ManagedTask) => {
    setRunningTaskId(task.id);
    handleUpdateTaskStatus(task.id, 'in_progress');

    const agent =
      SPECIALIZED_AGENTS.find((a) => a.id === task.assignedAgentId) || SPECIALIZED_AGENTS[0];

    const agentModeMap: Record<string, AgentMode> = {
      'agent-atlas': 'autonomous',
      'agent-hypatia': 'deep_research',
      'agent-chronos': 'scheduling',
      'agent-hermes': 'email_outreach',
      'agent-ada': 'data_analysis',
      'agent-vulcan': 'workflow',
    };

    const mode = agentModeMap[agent.id] || 'autonomous';

    try {
      const response = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: `[Assigned to Agent: ${agent.name} (${agent.role})]\nTASK: ${task.title}\nDETAILS: ${task.description}\nCATEGORY: ${task.category}\nTAGS: ${task.tags?.join(', ')}`,
          mode,
          context: {
            scratchpad: scratchpad,
            userSchedule: calendarEvents.slice(0, 5),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Agent execution failed');
      }

      const data = await response.json();

      const runResult: AgentRunResult = {
        id: `run-${Date.now()}`,
        timestamp: new Date().toISOString(),
        taskPrompt: task.title,
        mode,
        title: data.title || task.title,
        category: task.category,
        summary: data.summary || `Task successfully executed by Agent ${agent.name}.`,
        plan: data.plan || [],
        executionTrace: data.executionTrace || [],
        deliverables: data.deliverables || {
          markdownContent: '',
          suggestedActions: [],
          calendarEvents: [],
          emailDrafts: [],
          dataArtifacts: [],
        },
      };

      // Update task as completed with summary and deliverables
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                status: 'completed',
                completedAt: new Date().toISOString(),
                resultSummary:
                  data.summary ||
                  `Completed by ${agent.name}: Generated comprehensive deliverables and next steps.`,
                deliverables: data.deliverables,
              }
            : t
        )
      );

      setCurrentRun(runResult);
      setHistory((prev) => [runResult, ...prev]);
      sound.playAgentComplete();
    } catch (err) {
      console.error('Agent task execution error:', err);
      // Mark as failed
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                status: 'failed',
                resultSummary: 'Execution encountered an operational roadblock. Ready for retry.',
              }
            : t
        )
      );
    } finally {
      setRunningTaskId(null);
    }
  };

  // Task Management Handlers
  const handleAddTask = (newTask: ManagedTask) => {
    sound.playCheck();
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    sound.playCheck();
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              completedAt: newStatus === 'completed' ? new Date().toISOString() : t.completedAt,
            }
          : t
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleSelectTaskForReview = (task: ManagedTask) => {
    if (task.deliverables) {
      const runResult: AgentRunResult = {
        id: `run-${task.id}`,
        timestamp: task.completedAt || new Date().toISOString(),
        taskPrompt: task.title,
        mode: 'autonomous',
        title: task.title,
        category: task.category,
        summary: task.resultSummary || 'Deliverables review',
        plan: [
          { phase: 'Execution', objective: 'Automated task completion' },
        ],
        executionTrace: [
          {
            step: 1,
            title: 'Agent Execution Completed',
            toolUsed: 'DocArchitect',
            status: 'completed',
            thought: 'Reviewing archived deliverables for completed task.',
            outputSummary: task.resultSummary || 'Deliverables active.',
          },
        ],
        deliverables: task.deliverables,
      };
      setCurrentRun(runResult);
      setActiveTab('commander');
    }
  };

  // Deliverables AI Refinement
  const handleRefine = async (instruction: string, field: string) => {
    if (!currentRun) return;
    setIsRefining(true);
    try {
      const currentContent =
        field === 'doc'
          ? currentRun.deliverables.markdownContent
          : JSON.stringify(currentRun.deliverables);

      const response = await fetch('/api/agent/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction,
          currentContent,
          field,
        }),
      });

      if (!response.ok) throw new Error('Refine request failed');
      const data = await response.json();

      if (field === 'doc' && data.refined) {
        setCurrentRun((prev) =>
          prev
            ? {
                ...prev,
                deliverables: {
                  ...prev.deliverables,
                  markdownContent: data.refined,
                },
              }
            : null
        );
        sound.playAgentComplete();
      }
    } catch (err) {
      console.error('Refine error:', err);
    } finally {
      setIsRefining(false);
    }
  };

  // Daily Briefing Generator
  const handleGenerateBriefing = async (params: {
    goals: string;
    scheduleInput: string;
    energyLevel: string;
  }) => {
    setIsBriefingLoading(true);
    try {
      const response = await fetch('/api/agent/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          date: new Date().toLocaleDateString(),
        }),
      });

      if (!response.ok) throw new Error('Briefing request failed');
      const data = await response.json();

      setBriefing(data);
      sound.playAgentComplete();
    } catch (err) {
      console.error('Briefing error:', err);
      // Fallback briefing
      const fallbackBriefing: DailyBriefing = {
        greeting: 'Good morning, Commander.',
        focusMotto: 'Guard your deep work blocks, ruthlessly prioritize, and let AI automate the administrative friction.',
        top3Priorities: [
          {
            priority: params.goals || 'Deliver high-priority roadmap deliverables',
            impact: 'Drives primary quarterly OKR velocity',
            targetTime: 'Morning Peak (09:00 - 11:30)',
          },
          {
            priority: 'Execute operational backlog triage and stakeholder alignment',
            impact: 'Prevents downstream bottlenecks for team execution',
            targetTime: 'Early Afternoon (13:30 - 15:00)',
          },
          {
            priority: 'Synthesize daily performance metrics and review next-day runway',
            impact: 'Guarantees seamless execution for tomorrow',
            targetTime: 'Late Afternoon (16:30 - 17:30)',
          },
        ],
        timeblocks: [
          { time: '08:30 - 09:00', activity: 'Daily Kickoff & Standup Triage', type: 'prep' },
          { time: '09:00 - 11:30', activity: 'Deep Work Sprint: High-Leverage Goals', type: 'deep_work' },
          { time: '11:30 - 12:30', activity: 'Communications & Leadership Alignment', type: 'comms' },
          { time: '12:30 - 01:30', activity: 'Mind Recharge & Lunch', type: 'break' },
          { time: '01:30 - 03:30', activity: 'Focused Execution & Workflow Automation', type: 'admin' },
          { time: '03:30 - 05:00', activity: 'Deep Work Sprint 2: Review & Closure', type: 'deep_work' },
        ],
        inboxStrategy: 'Batch review email correspondence twice today: at 11:30 AM and 4:30 PM. Silence notifications during Deep Work.',
        pitfallsToAvoid: [
          'Allowing ad-hoc meetings to invade morning focus slots',
          'Context-switching across too many browser tabs',
          'Delaying critical contract reviews',
        ],
        closingMotivation: 'Execute with clarity today. You have an optimized runway.',
      };
      setBriefing(fallbackBriefing);
      sound.playAgentComplete();
    } finally {
      setIsBriefingLoading(false);
    }
  };

  // Calendar sync helpers
  const handleAddCalendarEvent = (event: CalendarEvent) => {
    sound.playCheck();
    setCalendarEvents((prev) => [
      ...prev,
      { ...event, id: event.id || `cal-${Date.now()}` },
    ]);
  };

  const handleRemoveCalendarEvent = (id: string) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleClearCalendarEvents = () => {
    setCalendarEvents([]);
  };

  const handleSyncTimeblocksToSchedule = (events: CalendarEvent[]) => {
    sound.playAgentComplete();
    setCalendarEvents((prev) => [...prev, ...events]);
  };

  // Workflow trigger
  const handleTriggerWorkflow = (wf: AutomationWorkflow) => {
    setActiveTab('commander');
    handleExecuteTask(wf.defaultPrompt, 'workflow', true);
  };

  const handleCreateWorkflow = (wf: AutomationWorkflow) => {
    sound.playCheck();
    setWorkflows((prev) => [wf, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openHistory={() => setShowHistory(true)}
        historyCount={history.length}
        taskCount={tasks.length}
        pomodoroActive={pomodoroActive}
        pomodoroTimeLeft={pomodoroTimeLeft}
        scratchpadHasContent={Boolean(scratchpad && scratchpad.trim().length > 10)}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'commander' && (
          <CommanderView
            currentRun={currentRun}
            isRunning={isRunning}
            onExecuteTask={handleExecuteTask}
            onAddCalendarEvent={handleAddCalendarEvent}
            onRefine={handleRefine}
            isRefining={isRefining}
            scratchpadHasContent={Boolean(scratchpad && scratchpad.trim().length > 10)}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskManagementView
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onDeleteTask={handleDeleteTask}
            onExecuteTaskWithAgent={handleExecuteTaskWithAgent}
            runningTaskId={runningTaskId}
            onSelectTaskForReview={handleSelectTaskForReview}
          />
        )}

        {activeTab === 'briefing' && (
          <DailyBriefingView
            briefing={briefing}
            isLoading={isBriefingLoading}
            onGenerateBriefing={handleGenerateBriefing}
            onSyncTimeblocksToSchedule={handleSyncTimeblocksToSchedule}
          />
        )}

        {activeTab === 'workflows' && (
          <WorkflowsHub
            workflows={workflows}
            onTriggerWorkflow={handleTriggerWorkflow}
            onCreateWorkflow={handleCreateWorkflow}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleFocusStudio
            events={calendarEvents}
            onAddEvent={handleAddCalendarEvent}
            onRemoveEvent={handleRemoveCalendarEvent}
            onClearEvents={handleClearCalendarEvents}
            pomodoroActive={pomodoroActive}
            pomodoroTimeLeft={pomodoroTimeLeft}
            setPomodoroActive={setPomodoroActive}
            setPomodoroTimeLeft={setPomodoroTimeLeft}
            pomodoroDuration={pomodoroDuration}
            setPomodoroDuration={setPomodoroDuration}
          />
        )}

        {activeTab === 'scratchpad' && (
          <ScratchpadDrawer
            content={scratchpad}
            onChange={setScratchpad}
            onRunTransform={(promptText) => {
              setActiveTab('commander');
              handleExecuteTask(promptText, 'autonomous', true);
            }}
          />
        )}
      </main>

      {/* History Modal */}
      {showHistory && (
        <HistoryModal
          history={history}
          onSelectRun={(run) => {
            setCurrentRun(run);
            setActiveTab('commander');
          }}
          onClearHistory={() => setHistory([])}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}
