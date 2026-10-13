import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health / Capability Status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    model: 'gemini-3.8-flash',
    apiKeyConfigured: Boolean(apiKey && apiKey.length > 5),
    time: new Date().toISOString(),
  });
});

// Helper to strip markdown json wrapper
function extractJson(text: string): any {
  if (!text) return null;
  let clean = text.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  try {
    return JSON.parse(clean);
  } catch (err) {
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerErr) {
        // Fallback
      }
    }
    return null;
  }
}

// System prompt that instructs the AI agent to behave as a premier autonomous productivity engine
const AGENT_SYSTEM_INSTRUCTION = `You are OmniTask Agent, a world-class autonomous productivity and executive intelligence agent.
Your mission is to take complex human tasks, messy requests, daily operational bottlenecks, and high-stakes productivity workflows, and autonomously execute them with rigorous decomposition, deep reasoning, and ready-to-use deliverables.

You output strictly valid JSON matching this structure:
{
  "title": "Short punchy task execution title",
  "category": "executive" | "scheduling" | "email" | "research" | "data_analysis" | "workflow",
  "summary": "Executive overview of what was accomplished and key takeaways (2-3 sentences)",
  "plan": [
    { "phase": "1. Scoping & Audit", "objective": "Analyze constraints, identify dependencies" },
    { "phase": "2. Synthesis & Assembly", "objective": "Formulate solutions and drafting" },
    { "phase": "3. Delivery & Action Items", "objective": "Package executable artifacts" }
  ],
  "executionTrace": [
    {
      "step": 1,
      "title": "Action title",
      "toolUsed": "CalendarEngine" | "EmailComposer" | "WebResearch" | "DataMatrix" | "DocArchitect" | "WorkflowTrigger",
      "status": "completed",
      "thought": "Internal agent reasoning and deduction",
      "outputSummary": "Concrete outcome achieved in this step"
    }
  ],
  "deliverables": {
    "markdownContent": "Full comprehensive deliverable with markdown headings, structured bullet points, tables, bold takeaways, and exact text.",
    "suggestedActions": [
      {
        "id": "act-1",
        "title": "Actionable next step",
        "type": "calendar" | "email" | "task" | "export",
        "urgency": "high" | "medium" | "low",
        "timeEstimate": "15 min",
        "completed": false
      }
    ],
    "calendarEvents": [
      {
        "title": "Event or Timeblock Title",
        "startTime": "09:00",
        "endTime": "10:30",
        "category": "Deep Work" | "Meeting" | "Triage" | "Review",
        "description": "Context and preparation details"
      }
    ],
    "emailDrafts": [
      {
        "recipient": "recipient@example.com or Name",
        "subject": "Clear descriptive subject line",
        "tone": "Executive & Concise" | "Diplomatic" | "Persuasive" | "Urgent",
        "body": "Complete, polished, ready-to-send email body"
      }
    ],
    "dataArtifacts": [
      {
        "title": "Metric or Table Title",
        "headers": ["Col 1", "Col 2", "Col 3"],
        "rows": [
          ["Val A", "Val B", "Val C"]
        ]
      }
    ]
  }
}

Always provide concrete, comprehensive, elite-quality deliverables. Never output vague placeholders like '[Insert text here]'. Always draft complete emails, full schedule blocks, detailed research dossiers, or data tables.`;

// Autonomous Agent Run Endpoint
app.post('/api/agent/run', async (req, res) => {
  try {
    const { task, mode, context } = req.body;

    if (!task || typeof task !== 'string') {
      res.status(400).json({ error: 'Task description is required' });
      return;
    }

    if (!ai) {
      res.status(500).json({
        error: 'Gemini API is not configured. Please ensure GEMINI_API_KEY is available.',
      });
      return;
    }

    const userPrompt = `TASK:
${task}

MODE: ${mode || 'autonomous'}
ADDITIONAL CONTEXT & PREFERENCES:
${context ? JSON.stringify(context, null, 2) : 'None provided'}

Please execute this task thoroughly and return ONLY the JSON object.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: AGENT_SYSTEM_INSTRUCTION,
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '';
    const parsed = extractJson(rawText);

    if (!parsed) {
      res.json({
        title: 'Task Execution Output',
        category: 'workflow',
        summary: 'Agent completed processing your task.',
        plan: [
          { phase: 'Execution', objective: 'Process requested instructions' },
        ],
        executionTrace: [
          {
            step: 1,
            title: 'Direct Execution',
            toolUsed: 'DocArchitect',
            status: 'completed',
            thought: 'Executed task directly with high precision.',
            outputSummary: 'Generated deliverable payload.',
          },
        ],
        deliverables: {
          markdownContent: rawText,
          suggestedActions: [
            {
              id: 'act-1',
              title: 'Review output deliverable',
              type: 'task',
              urgency: 'medium',
              timeEstimate: '5 min',
              completed: false,
            },
          ],
          calendarEvents: [],
          emailDrafts: [],
          dataArtifacts: [],
        },
      });
      return;
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Agent execution error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to execute agent workflow',
    });
  }
});

// Quick Chat / Refinement Endpoint
app.post('/api/agent/refine', async (req, res) => {
  try {
    const { instruction, currentContent, field } = req.body;

    if (!ai) {
      res.status(500).json({ error: 'Gemini API key is not configured' });
      return;
    }

    const prompt = `You are OmniTask Agent refinement assistant.
Current content (${field || 'deliverable'}):
${currentContent}

User instruction:
${instruction}

Provide the refined and improved version directly. Keep formatting clean and professional.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an ultra-fast refinement and polishing agent. Return directly the improved content without conversational fluff.',
        temperature: 0.2,
      },
    });

    res.json({ refined: response.text });
  } catch (error: any) {
    console.error('Refinement error:', error);
    res.status(500).json({ error: error.message || 'Refinement failed' });
  }
});

// Smart Routine Planner / Daily Briefing
app.post('/api/agent/briefing', async (req, res) => {
  try {
    const { goals, scheduleInput, energyLevel, date } = req.body;

    if (!ai) {
      res.status(500).json({ error: 'Gemini API key is not configured' });
      return;
    }

    const prompt = `Build an optimized daily executive briefing and productivity gameplan for date: ${date || 'Today'}.
Top priorities & goals: ${goals || 'Deliver high-priority projects and clear operational backlog'}
Existing commitments: ${scheduleInput || '9 AM Team sync, 2 PM Client review'}
Energy profile: ${energyLevel || 'Peak focus in morning (9am-12pm), medium focus afternoon'}

Return JSON in this format:
{
  "greeting": "Personalized executive greeting",
  "focusMotto": "Inspiring one-line focus directive for the day",
  "top3Priorities": [
    { "priority": "High-leverage goal", "impact": "Why this moves the needle", "targetTime": "Morning" }
  ],
  "timeblocks": [
    { "time": "08:30 - 09:00", "activity": "Day kickoff & triage", "type": "prep" },
    { "time": "09:00 - 11:30", "activity": "Deep Work Block: Project Alpha", "type": "deep_work" },
    { "time": "11:30 - 12:30", "activity": "Sync & Communications", "type": "comms" },
    { "time": "12:30 - 01:30", "activity": "Recharge & Lunch", "type": "break" },
    { "time": "01:30 - 03:30", "activity": "Execution & Collaboration", "type": "admin" },
    { "time": "03:30 - 05:00", "activity": "Deep Work Block 2 / Wrap-up", "type": "deep_work" }
  ],
  "inboxStrategy": "Concise guidance on email/slack triage",
  "pitfallsToAvoid": ["Over-scheduling bufferless meetings", "Checking Slack during Deep Work 1"],
  "closingMotivation": "Closing executive encouragement"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.25,
      },
    });

    const parsed = extractJson(response.text || '{}');
    res.json(parsed || {});
  } catch (error: any) {
    console.error('Briefing error:', error);
    res.status(500).json({ error: error.message || 'Briefing failed' });
  }
});

// Vite Integration (dev / prod)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`OmniTask Agent Server running at http://0.0.0.0:${PORT}`);
});
