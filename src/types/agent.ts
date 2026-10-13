export type AgentMode =
  | 'autonomous'
  | 'deep_research'
  | 'scheduling'
  | 'email_outreach'
  | 'data_analysis'
  | 'workflow';

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface SpecializedAgent {
  id: string;
  name: string;
  role: string;
  avatarBg: string;
  avatarColor: string;
  badge: string;
  description: string;
  iconName: string;
}

export interface ManagedTask {
  id: string;
  title: string;
  description: string;
  assignedAgentId: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string; // ISO date string or YYYY-MM-DDTHH:mm
  category: string;
  tags: string[];
  createdAt: string;
  completedAt?: string;
  resultSummary?: string;
  deliverables?: Deliverables;
}

export interface PlanPhase {
  phase: string;
  objective: string;
}

export interface ExecutionStep {
  step: number;
  title: string;
  toolUsed:
    | 'CalendarEngine'
    | 'EmailComposer'
    | 'WebResearch'
    | 'DataMatrix'
    | 'DocArchitect'
    | 'WorkflowTrigger';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  thought: string;
  outputSummary: string;
}

export interface ActionItem {
  id: string;
  title: string;
  type: 'calendar' | 'email' | 'task' | 'export';
  urgency: 'high' | 'medium' | 'low';
  timeEstimate?: string;
  completed: boolean;
}

export interface CalendarEvent {
  id?: string;
  title: string;
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  category: 'Deep Work' | 'Meeting' | 'Triage' | 'Review' | 'Personal';
  description?: string;
  date?: string;
}

export interface EmailDraft {
  recipient: string;
  subject: string;
  tone: string;
  body: string;
}

export interface DataArtifact {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface Deliverables {
  markdownContent: string;
  suggestedActions: ActionItem[];
  calendarEvents: CalendarEvent[];
  emailDrafts: EmailDraft[];
  dataArtifacts: DataArtifact[];
}

export interface AgentRunResult {
  id: string;
  timestamp: string;
  taskPrompt: string;
  mode: AgentMode;
  title: string;
  category: string;
  summary: string;
  plan: PlanPhase[];
  executionTrace: ExecutionStep[];
  deliverables: Deliverables;
}

export interface DailyBriefing {
  greeting: string;
  focusMotto: string;
  top3Priorities: {
    priority: string;
    impact: string;
    targetTime: string;
  }[];
  timeblocks: {
    time: string;
    activity: string;
    type: 'prep' | 'deep_work' | 'comms' | 'break' | 'admin';
  }[];
  inboxStrategy: string;
  pitfallsToAvoid: string[];
  closingMotivation: string;
}

export interface AutomationWorkflow {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  estimatedTimeSaved: string;
  defaultPrompt: string;
  tags: string[];
}
