import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate as useRouterNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Circle, ChevronRight, ChevronLeft, RotateCcw,
  Copy, Check, AlertTriangle, Info, Lightbulb, BookOpen,
  Lock, Home, ArrowRight, ChevronLeft as BackIcon,
} from 'lucide-react';

// ─── TYPES ───────────────────────────────────────────────────────────────────

type BlockType = 'text' | 'code' | 'table' | 'callout' | 'heading' | 'list' | 'divider';
type CalloutKind = 'tip' | 'warning' | 'info' | 'note';

interface CodeData  { lang: string; code: string; filename?: string; }
interface TableData { headers: string[]; rows: string[][]; }
interface CalloutData { kind: CalloutKind; title?: string; text: string; }

interface Block {
  type: BlockType;
  text?: string;
  level?: 2 | 3;
  code?: CodeData;
  table?: TableData;
  callout?: CalloutData;
  items?: string[];
}

interface Step  { title: string; blocks: Block[]; }
interface QuizOption { id: string; label: string; }
interface Quiz  { question: string; options: QuizOption[]; answer: string; explanation: string; }
interface Module {
  id: string; num: string; title: string; subtitle: string; group: string;
  steps: Step[]; quiz: Quiz;
}

// ─── BLOCK HELPERS ───────────────────────────────────────────────────────────

const T   = (text: string): Block => ({ type: 'text', text });
const H   = (text: string, level: 2 | 3 = 2): Block => ({ type: 'heading', text, level });
const C   = (code: string, lang = 'bash', filename?: string): Block => ({ type: 'code', code: { lang, code, filename } });
const TBL = (headers: string[], rows: string[][]): Block => ({ type: 'table', table: { headers, rows } });
const CL  = (kind: CalloutKind, text: string, title?: string): Block => ({ type: 'callout', callout: { kind, text, title } });
const LI  = (items: string[]): Block => ({ type: 'list', items });

// ─── LANGUAGE STRINGS ─────────────────────────────────────────────────────────

const LANG_STORAGE_KEY = 'guide-lang';

const UI_STRINGS = {
  en: {
    allGuides: 'All guides',
    guideName: 'OpenClaw Guide',
    progress: 'Progress',
    reset: 'Reset progress',
    previous: 'Previous',
    continue: 'Continue',
    takeQuiz: 'Take quiz',
    done: 'Done',
    completed: 'Completed',
    step: 'Step',
  },
  es: {
    allGuides: 'Todas las guías',
    guideName: 'Guía OpenClaw',
    progress: 'Progreso',
    reset: 'Reiniciar',
    previous: 'Anterior',
    continue: 'Continuar',
    takeQuiz: 'Tomar quiz',
    done: 'Completado',
    completed: 'Completado',
    step: 'Paso',
  },
} as const;

// ─── MODULE DATA ──────────────────────────────────────────────────────────────

const MODULES: Module[] = [
  // ── MODULE 00 ──────────────────────────────────────────────────────────────
  {
    id: 'mod-00', num: '00', title: 'Setting Up', group: 'Fundamentals',
    subtitle: 'From zero to a running OpenClaw instance connected to WhatsApp',
    steps: [
      {
        title: 'System Requirements',
        blocks: [
          T('Before installing OpenClaw, verify that your machine meets the following baseline requirements. The stack is entirely Node.js — no Python, no Docker required for basic setups.'),
          TBL(
            ['Requirement', 'Minimum', 'Recommended', 'Notes'],
            [
              ['Node.js', 'v18.0', 'v20 LTS', 'Check with `node --version`'],
              ['npm', 'v9', 'v10', 'Bundled with Node.js'],
              ['Git', 'Any', 'Latest', 'For cloning and version control'],
              ['WhatsApp number', 'Active SIM', 'Dedicated number', 'Cannot be your main personal number'],
              ['LLM API key', 'OpenAI OR Anthropic OR Gemini', '—', 'You only need one provider to start'],
              ['RAM', '2 GB free', '4 GB+', 'More is better for multi-agent setups'],
              ['OS', 'macOS / Linux', 'Ubuntu 22+ / macOS 13+', 'Windows requires WSL2'],
            ]
          ),
          CL('tip', 'Run `node --version` and `npm --version` in your terminal before proceeding. If Node is missing, install it via https://nodejs.org (download the LTS version).'),
          CL('warning', 'Do not use your primary WhatsApp number. OpenClaw links to WhatsApp Web — any existing WhatsApp Web sessions on that number will be disconnected.'),
        ]
      },
      {
        title: 'Installation',
        blocks: [
          T('Installation follows three steps: clone the repository, install dependencies, and run the initialization wizard.'),
          H('1. Clone & Install', 3),
          C(`git clone https://github.com/openclaw/openclaw.git\ncd openclaw\nnpm install`, 'bash'),
          H('2. Run the Init Wizard', 3),
          C(`npx openclaw init`, 'bash'),
          T('The wizard walks you through configuration interactively. It generates your `openclaw.json` config file automatically based on your answers.'),
          TBL(
            ['Wizard Prompt', 'What to Enter', 'Example'],
            [
              ['LLM Provider', 'Your preferred AI provider', 'openai'],
              ['Model name', 'The exact model identifier', 'gpt-4o'],
              ['API Key', 'Your provider API key', 'sk-...'],
              ['Agent name', 'Display name for the agent', 'Kero Assistant'],
              ['Agent description', 'What this agent does', 'Customer support agent'],
              ['WhatsApp mode', 'Connection type', 'qr (default)'],
            ]
          ),
          CL('info', 'The wizard creates `openclaw.json` at the project root. You can edit it manually at any time — Module 01 covers every field in detail.'),
        ]
      },
      {
        title: 'Model Configuration',
        blocks: [
          T('OpenClaw supports multiple LLM providers through a unified adapter layer. You configure the model once in `openclaw.json` and the system handles the rest.'),
          TBL(
            ['Provider', 'auth.provider value', 'Example model', 'Notes'],
            [
              ['OpenAI', 'openai', 'gpt-4o', 'Recommended for production'],
              ['Anthropic', 'anthropic', 'claude-3-5-sonnet-20241022', 'Best instruction-following'],
              ['Google', 'gemini', 'gemini-1.5-pro', 'Good for high-volume'],
              ['Ollama (local)', 'ollama', 'llama3.2', 'No API key needed, runs offline'],
              ['Custom OpenAI-compatible', 'openai', 'any', 'Set `baseUrl` to your endpoint'],
            ]
          ),
          C(`// openclaw.json — auth section\n{\n  "auth": {\n    "provider": "openai",\n    "model": "gpt-4o",\n    "apiKey": "sk-your-key-here"\n  }\n}`, 'json', 'openclaw.json'),
          CL('tip', 'For local Ollama, set `"apiKey": ""` (empty string) and `"baseUrl": "http://localhost:11434"`. No cloud costs, full privacy.'),
        ]
      },
      {
        title: 'WhatsApp Connection',
        blocks: [
          T('OpenClaw uses WhatsApp Web under the hood via the `@whiskeysockets/baileys` library. The first connection requires scanning a QR code — after that, the session is stored locally and reconnects automatically.'),
          H('Start the server', 3),
          C(`npm start`, 'bash'),
          T('On first launch, a QR code appears in your terminal. Open WhatsApp on your phone:'),
          LI([
            'Tap the three dots (⋮) in the top-right corner',
            'Go to Linked Devices → Link a Device',
            'Point your camera at the QR code in the terminal',
            'Wait 3–5 seconds for the connection to confirm',
          ]),
          CL('warning', 'The QR code expires after about 60 seconds. If it expires before you scan, press Ctrl+C and restart with `npm start` to get a fresh code.'),
          H('Session persistence', 3),
          T('After the first scan, OpenClaw saves the session in the `auth_info_baileys/` folder inside your workspace. You never need to scan again unless you explicitly log out or delete this folder.'),
          TBL(
            ['File/Folder', 'What it does'],
            [
              ['auth_info_baileys/', 'Stores encrypted WhatsApp session credentials'],
              ['creds.json', 'Main session file — do not share or commit to git'],
              ['keys/*.json', 'Encryption keys for the session'],
            ]
          ),
          CL('warning', 'Add `auth_info_baileys/` to your `.gitignore` immediately. These files contain your WhatsApp session — sharing them gives someone full access to your linked number.'),
        ]
      },
      {
        title: 'Verification',
        blocks: [
          T('Once the server is running and WhatsApp is connected, verify everything works with a quick test.'),
          H('Send a ping', 3),
          T('Open WhatsApp on your phone and send the following message to yourself (to the number linked to OpenClaw):'),
          C(`/ping`, 'text'),
          T('The agent should reply: `pong` — this confirms the message pipeline is fully operational.'),
          H('Check the server logs', 3),
          C(`[OpenClaw] ✓ WA connected — +1234567890\n[OpenClaw] ✓ Agent "Kero Assistant" loaded\n[OpenClaw] ✓ Model: gpt-4o ready\n[OpenClaw] → Message received from +1234567890\n[OpenClaw] ← Sending response...`, 'text'),
          TBL(
            ['What you see', 'What it means'],
            [
              ['✓ WA connected', 'WhatsApp session active and receiving messages'],
              ['✓ Agent loaded', 'Your agent configuration was parsed successfully'],
              ['✓ Model ready', 'The LLM provider responded to a test ping'],
              ['→ Message received', 'Incoming message from WhatsApp arrived'],
              ['← Sending response', 'The agent generated a reply and is sending it'],
            ]
          ),
          CL('tip', 'If you see an error about `DATABASE_URL`, that\'s for the optional logging feature. The core agent still works without it.'),
        ]
      }
    ],
    quiz: {
      question: 'After scanning the WhatsApp QR code for the first time, what folder stores the session so you never need to scan again?',
      options: [
        { id: 'a', label: 'openclaw.json' },
        { id: 'b', label: 'auth_info_baileys/' },
        { id: 'c', label: 'workspace/' },
        { id: 'd', label: '.env' },
      ],
      answer: 'b',
      explanation: '`auth_info_baileys/` stores the encrypted session credentials. As long as this folder exists and is intact, OpenClaw reconnects to WhatsApp automatically on every restart — no QR scan needed.',
    }
  },

  // ── MODULE 01 ──────────────────────────────────────────────────────────────
  {
    id: 'mod-01', num: '01', title: 'The Config File', group: 'Fundamentals',
    subtitle: 'Every field in openclaw.json explained, one by one',
    steps: [
      {
        title: 'Structure Overview',
        blocks: [
          T('`openclaw.json` is the single source of truth for your entire OpenClaw installation. It lives at the root of the project and controls everything: which AI model to use, what agents exist, which plugins are enabled, how WhatsApp connects, and how sessions persist.'),
          C(`{\n  "auth": { ... },\n  "agents": [ ... ],\n  "plugins": [ ... ],\n  "gateway": { ... },\n  "channels": { ... },\n  "session": { ... }\n}`, 'json', 'openclaw.json'),
          TBL(
            ['Top-level key', 'What it controls'],
            [
              ['auth', 'LLM provider, model name, and API credentials'],
              ['agents', 'Array of agent definitions — each with its own identity and workspace'],
              ['plugins', 'List of enabled plugins and their per-plugin configuration'],
              ['gateway', 'How the HTTP API gateway behaves (port, auth, rate limits)'],
              ['channels', 'Channel-specific config — WhatsApp, Telegram, REST, etc.'],
              ['session', 'How conversation history is stored and retrieved'],
            ]
          ),
          CL('info', 'Changes to `openclaw.json` require a server restart to take effect. A hot-reload feature is on the roadmap.'),
        ]
      },
      {
        title: 'Auth Section',
        blocks: [
          T('The `auth` section defines your LLM connection. This is where you specify which AI brain your agents use.'),
          C(`"auth": {\n  "provider": "openai",\n  "model": "gpt-4o",\n  "apiKey": "sk-...",\n  "baseUrl": "https://api.openai.com/v1",\n  "maxTokens": 4096,\n  "temperature": 0.7\n}`, 'json', 'openclaw.json › auth'),
          TBL(
            ['Field', 'Type', 'Required', 'Description'],
            [
              ['provider', 'string', '✓', 'LLM backend: `openai`, `anthropic`, `gemini`, `ollama`'],
              ['model', 'string', '✓', 'Exact model identifier — must match the provider\'s naming convention'],
              ['apiKey', 'string', '✓*', 'Your API key. For Ollama, use an empty string `""`'],
              ['baseUrl', 'string', '—', 'Override the API endpoint. Useful for custom or local deployments'],
              ['maxTokens', 'number', '—', 'Max tokens per response. Higher = longer answers, more cost'],
              ['temperature', 'number', '—', 'Creativity/randomness 0.0–2.0. 0 = deterministic, 1.0 = balanced, 2.0 = very random'],
            ]
          ),
          CL('tip', 'Set `temperature: 0.2` for customer support agents that need consistent, predictable answers. Use `0.8+` for creative writing assistants.'),
          CL('warning', 'Never commit your `apiKey` to git. Use an environment variable instead: set `"apiKey": "$ENV:OPENAI_API_KEY"` and export the key in your shell or `.env` file.'),
        ]
      },
      {
        title: 'Agents Section',
        blocks: [
          T('The `agents` array is where you define one or more agents. Each agent has its own identity, workspace, and behavior. Think of each agent as a different "employee" with a specific role.'),
          C(`"agents": [\n  {\n    "id": "main",\n    "name": "Kero Assistant",\n    "description": "Main customer support agent",\n    "workspacePath": "./workspace",\n    "bootstrapMaxChars": 8000,\n    "language": "es"\n  }\n]`, 'json', 'openclaw.json › agents'),
          TBL(
            ['Field', 'Type', 'Description'],
            [
              ['id', 'string', 'Unique identifier for this agent. Used internally and in multi-agent routing'],
              ['name', 'string', 'Display name shown in logs and optionally in the chat itself'],
              ['description', 'string', 'What this agent does. Used for routing decisions in multi-agent setups'],
              ['workspacePath', 'string', 'Path to the agent\'s workspace folder — where AGENTS.md, SOUL.md, MEMORY.md live'],
              ['bootstrapMaxChars', 'number', 'Hard character limit for the system prompt. Prevents exceeding context window. Recommended: 6000–12000'],
              ['language', 'string', 'Default response language (`en`, `es`, `pt`, etc.)'],
            ]
          ),
          CL('info', 'You can have multiple entries in the `agents` array — one per specialized role. Module 06 covers multi-agent orchestration in depth.'),
        ]
      },
      {
        title: 'Plugins Section',
        blocks: [
          T('Plugins extend what your agent can *do*. Without plugins, the agent can only generate text replies. With plugins, it can search the web, read files, call APIs, run code, and more.'),
          C(`"plugins": [\n  {\n    "name": "web-search",\n    "enabled": true,\n    "config": {\n      "maxResults": 5\n    }\n  },\n  {\n    "name": "file-reader",\n    "enabled": true,\n    "config": {\n      "allowedExtensions": [".txt", ".md", ".pdf"]\n    }\n  }\n]`, 'json', 'openclaw.json › plugins'),
          TBL(
            ['Field', 'Type', 'Description'],
            [
              ['name', 'string', 'Plugin identifier — must match a plugin registered in the system'],
              ['enabled', 'boolean', 'Quick toggle without deleting the config. Set `false` to disable without removing settings'],
              ['config', 'object', 'Plugin-specific configuration. Each plugin documents its own available keys'],
            ]
          ),
          CL('tip', 'Disable plugins you\'re not using. Each enabled plugin adds a tool description to the system prompt, which costs tokens and can confuse the model if there are too many options.'),
        ]
      },
      {
        title: 'Gateway, Channels & Session',
        blocks: [
          T('The remaining three sections control the server infrastructure: how it exposes an API, which communication channels are active, and how conversation memory is stored.'),
          H('Gateway', 3),
          C(`"gateway": {\n  "port": 3000,\n  "authToken": "my-secret-token",\n  "rateLimit": {\n    "windowMs": 60000,\n    "max": 100\n  }\n}`, 'json', 'openclaw.json › gateway'),
          TBL(
            ['Field', 'Description'],
            [
              ['port', 'HTTP port for the REST API. Default: 3000'],
              ['authToken', 'Bearer token required on all API requests. Leave empty to disable auth (not recommended for production)'],
              ['rateLimit.windowMs', 'Time window in milliseconds for rate limiting. 60000 = 1 minute'],
              ['rateLimit.max', 'Max requests per window per IP'],
            ]
          ),
          H('Channels', 3),
          C(`"channels": {\n  "whatsapp": {\n    "enabled": true,\n    "printQR": true,\n    "sessionPath": "./auth_info_baileys"\n  },\n  "rest": {\n    "enabled": false\n  }\n}`, 'json', 'openclaw.json › channels'),
          TBL(
            ['Field', 'Description'],
            [
              ['whatsapp.enabled', 'Whether to start the WhatsApp listener on boot'],
              ['whatsapp.printQR', 'Print QR code to terminal on first connection (true) or save to a file (false)'],
              ['whatsapp.sessionPath', 'Where to store the WhatsApp session files'],
              ['rest.enabled', 'Expose a REST endpoint at `/api/message` for HTTP-based integrations'],
            ]
          ),
          H('Session', 3),
          C(`"session": {\n  "type": "file",\n  "maxHistory": 20,\n  "ttlSeconds": 3600\n}`, 'json', 'openclaw.json › session'),
          TBL(
            ['Field', 'Description'],
            [
              ['type', 'Storage backend: `file` (default, stores JSON on disk), `memory` (resets on restart), `redis` (requires Redis)'],
              ['maxHistory', 'Number of past messages to include in each request context. Higher = better memory, more tokens used'],
              ['ttlSeconds', 'Inactivity timeout in seconds before a session expires. 3600 = 1 hour'],
            ]
          ),
          CL('tip', 'For production with high traffic, switch `type` to `"redis"` and set a short `ttlSeconds` (300–600). File-based sessions work great for single-instance personal bots.'),
        ]
      }
    ],
    quiz: {
      question: 'In `openclaw.json`, which field controls how many past messages are included in each request to the LLM?',
      options: [
        { id: 'a', label: 'auth.maxTokens' },
        { id: 'b', label: 'agents.bootstrapMaxChars' },
        { id: 'c', label: 'session.maxHistory' },
        { id: 'd', label: 'gateway.rateLimit.max' },
      ],
      answer: 'c',
      explanation: '`session.maxHistory` controls how many previous messages from the conversation are included in each LLM request. More history = better context but more tokens consumed per message.',
    }
  },

  // ── MODULE 02 ──────────────────────────────────────────────────────────────
  {
    id: 'mod-02', num: '02', title: 'Workspace Architecture', group: 'Fundamentals',
    subtitle: 'The two-folder system, every file explained, and sandboxing modes',
    steps: [
      {
        title: 'The Two-Folder System',
        blocks: [
          T('OpenClaw keeps a strict separation between two directories. Understanding this distinction is fundamental — it prevents accidental overwrites and makes multi-agent setups possible.'),
          TBL(
            ['Folder', 'Purpose', 'Who writes to it', 'Contents'],
            [
              ['Project root (repo)', 'Engine code, config, and base logic', 'You (the developer)', '`openclaw.json`, `src/`, `node_modules/`, `package.json`'],
              ['workspace/', 'Agent identity, memory, and working files', 'You AND the agent', 'AGENTS.md, SOUL.md, MEMORY.md, SKILLS/, scratch files'],
            ]
          ),
          CL('info', 'The workspace is where the "personality" of your agent lives. You can have one workspace per agent, or share a workspace across agents that should have the same identity.'),
          CL('tip', 'Treat the project root as read-only after deployment. All your customization work happens inside the workspace folder.'),
        ]
      },
      {
        title: 'The Workspace File Map',
        blocks: [
          T('Every file inside the workspace has a specific role in the agent\'s behavior. Here is the complete map of what each file does:'),
          C(`workspace/\n├── AGENTS.md          # Primary identity file — who the agent is\n├── SOUL.md            # Persistent values, brand voice, non-negotiables\n├── MEMORY.md          # Auto-updated conversation summaries\n├── CONTEXT.md         # Manual reference context (FAQs, product info)\n├── SKILLS/            # Folder of skill definitions\n│   ├── skill-one/\n│   │   └── SKILL.md\n│   └── skill-two/\n│       └── SKILL.md\n├── scratch/           # Agent working files (temp notes, drafts)\n└── exports/           # Files generated for users`, 'text'),
          TBL(
            ['File', 'Injected into prompt?', 'Who edits it', 'Description'],
            [
              ['AGENTS.md', '✓ Always (Layer 1)', 'You', 'Core identity: role, capabilities, tone, rules'],
              ['SOUL.md', '✓ Always (Layer 2)', 'You', 'Values and brand voice that NEVER change regardless of user requests'],
              ['MEMORY.md', '✓ Conditionally', 'Agent (auto-writes)', 'Summarized conversation history — updated automatically'],
              ['CONTEXT.md', '✓ Conditionally', 'You', 'Static reference material: FAQs, pricing, policies — injected when relevant'],
              ['SKILLS/*.md', '✓ When triggered', 'You', 'Step-by-step task procedures the agent follows exactly'],
              ['scratch/', '✗ Never', 'Agent', 'Agent\'s working scratch pad — files here are tools, not prompt content'],
              ['exports/', '✗ Never', 'Agent', 'Output destination for generated files (PDFs, reports, etc.)'],
            ]
          ),
          CL('warning', 'Files in `scratch/` and `exports/` are never injected into the prompt. If you want something to influence the agent\'s behavior, it must live at the root of the workspace or in SKILLS/.'),
        ]
      },
      {
        title: 'Sandboxing Modes',
        blocks: [
          T('OpenClaw can restrict what the agent is allowed to do with the file system. This is controlled via the `sandboxing` field in the agent config.'),
          TBL(
            ['Mode', 'What the agent can do', 'When to use'],
            [
              ['none', 'Full file system access — read/write anywhere', 'Development and trusted personal use only'],
              ['minimal', 'Can only read/write inside the workspace folder', 'Most production deployments — good balance'],
              ['full', 'Read-only, no writes allowed, no external calls', 'High-security deployments or untrusted user inputs'],
            ]
          ),
          C(`// In openclaw.json › agents\n{\n  "id": "main",\n  "workspacePath": "./workspace",\n  "sandboxing": "minimal"\n}`, 'json'),
          CL('warning', 'Running with `"sandboxing": "none"` in production means the agent can potentially read any file on your server if a malicious prompt manipulates it. Always use `"minimal"` or `"full"` in production.'),
          CL('tip', 'Start with `"minimal"`. Only downgrade to `"none"` if you have a specific use case that requires cross-directory access AND you fully trust the user inputs.'),
        ]
      },
      {
        title: 'Multi-Agent Configuration',
        blocks: [
          T('When you define multiple agents in the `agents` array, OpenClaw can route messages to different agents based on content, user identity, or explicit commands. Each agent must have a unique `id` and its own workspace path.'),
          C(`"agents": [\n  {\n    "id": "support",\n    "name": "Support Agent",\n    "description": "Handles customer support, billing, and account questions",\n    "workspacePath": "./workspaces/support"\n  },\n  {\n    "id": "sales",\n    "name": "Sales Agent",\n    "description": "Handles product inquiries, pricing, and demos",\n    "workspacePath": "./workspaces/sales"\n  }\n]`, 'json', 'openclaw.json'),
          T('The router uses the `description` field to decide which agent to invoke. It embeds the description of each agent and performs semantic matching against the incoming message.'),
          C(`# Create separate workspace folders\nmkdir -p workspaces/support\nmkdir -p workspaces/sales\n\n# Each workspace needs at minimum AGENTS.md and SOUL.md\ntouch workspaces/support/AGENTS.md\ntouch workspaces/sales/AGENTS.md`, 'bash'),
          CL('info', 'Each agent has completely isolated memory and identity. A conversation with the "support" agent never bleeds into the context of the "sales" agent — they are fully independent.'),
        ]
      }
    ],
    quiz: {
      question: 'Which file in the workspace is auto-updated by the agent itself (not by you) to summarize conversation history?',
      options: [
        { id: 'a', label: 'AGENTS.md' },
        { id: 'b', label: 'SOUL.md' },
        { id: 'c', label: 'CONTEXT.md' },
        { id: 'd', label: 'MEMORY.md' },
      ],
      answer: 'd',
      explanation: 'MEMORY.md is the only file in the workspace that the agent writes to automatically. It contains compressed summaries of past conversations, allowing the agent to "remember" without blowing up the context window.',
    }
  },

  // ── MODULE 03 ──────────────────────────────────────────────────────────────
  {
    id: 'mod-03', num: '03', title: 'The Identity Stack', group: 'Architecture',
    subtitle: 'How the system prompt is assembled from 12 injection layers',
    steps: [
      {
        title: 'The Bootstrap Cycle',
        blocks: [
          T('Every time OpenClaw starts (or reinitializes an agent), it runs through a 5-step bootstrap cycle to build the complete agent runtime from scratch.'),
          TBL(
            ['Step', 'Name', 'What happens'],
            [
              ['1', 'Load Config', 'Reads `openclaw.json` and validates all fields'],
              ['2', 'Load Identity', 'Reads AGENTS.md and SOUL.md from the workspace path'],
              ['3', 'Load Memory', 'Reads MEMORY.md and compresses if over `bootstrapMaxChars` limit'],
              ['4', 'Load Skills', 'Scans SKILLS/ folder, reads each SKILL.md, applies gating rules'],
              ['5', 'Assemble Prompt', 'Concatenates all layers in order into the final system prompt'],
            ]
          ),
          T('The assembled system prompt is cached in memory. It is rebuilt only when the agent is explicitly refreshed or the server restarts.'),
          CL('info', 'The `bootstrapMaxChars` setting acts as a safety valve — if the assembled system prompt exceeds this character count, the lowest-priority layers (memory, context) are trimmed first. Protected layers are never touched.'),
        ]
      },
      {
        title: 'The 12 Injection Layers',
        blocks: [
          T('The final system prompt is not a single document — it\'s a carefully ordered stack of 12 layers, each contributing specific content. The order matters: earlier layers have higher priority and are never trimmed.'),
          TBL(
            ['Layer', 'Source', 'Approx. tokens', 'Can be trimmed?'],
            [
              ['1', 'Core engine instructions (hardcoded)', '~200', '✗ Never'],
              ['2', 'SOUL.md — brand values', '~300–600', '✗ Never'],
              ['3', 'AGENTS.md — role definition', '~500–1500', '✗ Never'],
              ['4', 'Channel context (WhatsApp-specific rules)', '~100', '✗ Never'],
              ['5', 'Active plugins tool descriptions', '~50–200 per plugin', 'Partially'],
              ['6', 'Current date/time injection', '~20', '✗ Never'],
              ['7', 'Active skill procedures (triggered)', '~200–800', 'Yes'],
              ['8', 'CONTEXT.md (when relevant)', '~200–2000', 'Yes'],
              ['9', 'MEMORY.md summary (long-term)', '~200–600', 'Yes'],
              ['10', 'Recent conversation history', '~variable', 'Yes (maxHistory)'],
              ['11', 'Pre-message hook output', '~variable', 'Yes'],
              ['12', 'User\'s incoming message', 'Varies', '✗ Never'],
            ]
          ),
          CL('warning', 'Layers 1–4 are protected and never trimmed regardless of `bootstrapMaxChars`. This ensures the agent never "forgets" its core identity even in very long conversations.'),
          CL('tip', 'If your agent seems to "forget" instructions mid-conversation, the most likely cause is that MEMORY.md or CONTEXT.md is being trimmed due to a tight `bootstrapMaxChars`. Increase the limit or trim those files.'),
        ]
      },
      {
        title: 'AGENTS.md vs SOUL.md',
        blocks: [
          T('Both files define who the agent is, but they serve different purposes. Understanding the distinction helps you write better, more effective agent identities.'),
          TBL(
            ['Aspect', 'AGENTS.md', 'SOUL.md'],
            [
              ['Purpose', 'Role, capabilities, and operational instructions', 'Core values, brand voice, and non-negotiable principles'],
              ['Tone', 'Functional and descriptive', 'Philosophical and declarative'],
              ['Changes?', 'Evolves as the agent\'s role changes', 'Rarely changes — only when brand/values shift'],
              ['Overridable?', 'Partially — user context can expand role', 'No — values persist regardless of any user instruction'],
              ['Typical length', '500–1500 chars', '300–600 chars'],
              ['Contains', 'What the agent does, how it formats responses, what tools it uses', 'What the agent believes, how it treats people, what it refuses to do'],
            ]
          ),
          H('Example: SOUL.md', 3),
          C(`# Soul\n\nI am Kero, a product design assistant.\n\nMy values:\n- I am always honest, even when the truth is uncomfortable\n- I never pretend to know something I don't\n- I respect the user's time: I am concise and direct\n- I never impersonate a human or deny being an AI\n- I do not engage with harmful, illegal, or deceptive requests`, 'markdown', 'workspace/SOUL.md'),
          H('Example: AGENTS.md', 3),
          C(`# Role\nYou are Kero, a product design consultant specializing in UX and strategy.\n\n# Capabilities\n- Review and critique design decisions\n- Suggest UX improvements with concrete examples\n- Draft product specs and user stories\n\n# Response format\n- Always be concise — no padding, no filler\n- Use markdown formatting when helpful\n- If unsure, say so and offer to research further`, 'markdown', 'workspace/AGENTS.md'),
        ]
      },
      {
        title: 'AGENTS.md Anatomy Sections',
        blocks: [
          T('A well-structured AGENTS.md follows a specific anatomy. Each section serves a purpose — think of it as a job description written for an AI. The **2KB Rule of Thumb**: keep AGENTS.md under 2000 characters for optimal performance without trimming.'),
          TBL(
            ['Section heading', 'What to write here', 'Max size'],
            [
              ['# Role', 'One sentence defining who the agent is and their primary function', '50–100 chars'],
              ['# Context', 'Background the agent needs: company info, product context, audience', '200–400 chars'],
              ['# Capabilities', 'Bulleted list of what this agent CAN do', '200–500 chars'],
              ['# Limitations', 'What this agent CANNOT or SHOULD NOT do', '100–200 chars'],
              ['# Response Format', 'How to structure replies: length, language, markdown use, tone', '100–300 chars'],
              ['# Examples (optional)', 'Sample Q&A pairs showing desired behavior', '200–400 chars'],
            ]
          ),
          CL('tip', 'The "# Limitations" section is often the most powerful. A clear list of things the agent should NOT do (e.g., "never discuss competitor products") is more reliable than trying to describe everything it should do.'),
          CL('info', 'Sections are parsed by their heading names. You can add custom sections, but the standard ones (Role, Context, Capabilities, etc.) are recognized and given slight priority weighting by the engine.'),
        ]
      }
    ],
    quiz: {
      question: 'Which two layers of the injection stack are NEVER trimmed, no matter how long the system prompt gets?',
      options: [
        { id: 'a', label: 'MEMORY.md and CONTEXT.md' },
        { id: 'b', label: 'SOUL.md (Layer 2) and AGENTS.md (Layer 3)' },
        { id: 'c', label: 'Plugin descriptions and Skills' },
        { id: 'd', label: 'Conversation history and the user\'s message' },
      ],
      answer: 'b',
      explanation: 'SOUL.md (Layer 2) and AGENTS.md (Layer 3) are protected layers — they are never trimmed regardless of the `bootstrapMaxChars` limit. This guarantees the agent always retains its core identity and role definition.',
    }
  },

  // ── MODULE 04 ──────────────────────────────────────────────────────────────
  {
    id: 'mod-04', num: '04', title: 'Conversation Flow', group: 'Architecture',
    subtitle: 'How a message travels from WhatsApp to AI response and back',
    steps: [
      {
        title: 'The Message Lifecycle',
        blocks: [
          T('Every incoming message passes through a deterministic pipeline before the agent generates a response. Understanding this pipeline helps you debug issues and optimize latency.'),
          TBL(
            ['Stage', 'Name', 'What happens'],
            [
              ['1', 'Receive', 'Channel listener (WhatsApp/REST) receives raw message'],
              ['2', 'Parse', 'Extract sender ID, content, media type, timestamp'],
              ['3', 'Route', 'Determine which agent handles this sender/conversation'],
              ['4', 'Pre-hook', 'Run pre-message hooks (logging, filtering, enrichment)'],
              ['5', 'Context build', 'Assemble conversation history + system prompt'],
              ['6', 'LLM call', 'Send to AI provider, await response'],
              ['7', 'Post-hook', 'Run post-message hooks (moderation, audit log)'],
              ['8', 'Send', 'Deliver response back via the originating channel'],
            ]
          ),
          CL('info', 'Stages 4 and 7 (pre/post hooks) are where you can inject custom middleware — rate limiting, content moderation, A/B testing, analytics, etc.'),
        ]
      },
      {
        title: 'Context Assembly',
        blocks: [
          T('Before calling the LLM, OpenClaw assembles a "context packet" — the full input the model will see. This packet determines the quality and relevance of the response.'),
          C(`// Simplified context packet structure\n{\n  "system": "<assembled 12-layer prompt>",\n  "messages": [\n    { "role": "user",      "content": "Message from 3 exchanges ago" },\n    { "role": "assistant", "content": "Agent reply 3 exchanges ago" },\n    // ... up to session.maxHistory entries\n    { "role": "user",      "content": "Current message" }\n  ]\n}`, 'json'),
          T('The `session.maxHistory` setting directly controls how many `{role, content}` pairs appear in the messages array.'),
          TBL(
            ['maxHistory value', 'Messages remembered', 'Token impact', 'Best for'],
            [
              ['5', 'Last ~2–3 exchanges', 'Low (~500 tokens)', 'Simple FAQs, one-shot tasks'],
              ['10', 'Last ~5 exchanges', 'Medium (~1000 tokens)', 'Most use cases — good default'],
              ['20', 'Last ~10 exchanges', 'High (~2000 tokens)', 'Long negotiations, complex tasks'],
              ['50', 'Last ~25 exchanges', 'Very high', 'Only with models with large context windows'],
            ]
          ),
        ]
      },
      {
        title: 'Response Streaming',
        blocks: [
          T('OpenClaw supports both streaming and non-streaming response modes. Streaming sends words to WhatsApp as the AI generates them — non-streaming waits for the full response before sending.'),
          TBL(
            ['Mode', 'WhatsApp experience', 'Latency', 'When to use'],
            [
              ['Streaming (default)', 'User sees "typing..." then progressive text delivery', 'Feels faster', 'All conversational use cases'],
              ['Non-streaming', 'Silence, then full message appears instantly', 'Feels slower', 'When you need the full response before post-processing'],
            ]
          ),
          C(`// Toggle in openclaw.json › channels\n"channels": {\n  "whatsapp": {\n    "streaming": true  // set false to disable\n  }\n}`, 'json'),
          CL('tip', 'WhatsApp\'s "typing..." indicator appears automatically when streaming is on, making the interaction feel natural and human-like. Keep streaming enabled for chat-style bots.'),
        ]
      },
      {
        title: 'Error Handling',
        blocks: [
          T('When something goes wrong in the pipeline, OpenClaw\'s error handling ensures the user always gets a response (even if it\'s an error message) and the failure is logged.'),
          TBL(
            ['Error type', 'Default behavior', 'User receives'],
            [
              ['LLM API timeout', 'Retry once, then fallback', '"I\'m having trouble connecting. Please try again."'],
              ['LLM API rate limit', 'Queue with backoff', 'Response delayed, then sent normally'],
              ['Invalid config', 'Server refuses to start', 'Error printed to terminal — fix before starting'],
              ['WhatsApp disconnect', 'Auto-reconnect in 5s', 'No message to user — transparent reconnect'],
              ['Plugin failure', 'Skip plugin, continue without it', 'Agent responds without plugin data (degraded mode)'],
            ]
          ),
          CL('warning', 'LLM API errors are often caused by expired keys or exceeded quota. Check your API provider dashboard if you see repeated timeout errors.'),
        ]
      }
    ],
    quiz: {
      question: 'In the message pipeline, at which stage does OpenClaw call the AI (LLM) provider?',
      options: [
        { id: 'a', label: 'Stage 2 — Parse' },
        { id: 'b', label: 'Stage 4 — Pre-hook' },
        { id: 'c', label: 'Stage 6 — LLM call' },
        { id: 'd', label: 'Stage 8 — Send' },
      ],
      answer: 'c',
      explanation: 'The LLM call happens at Stage 6, after the context has been fully assembled. Stages 1–5 are preparation (receive, parse, route, hooks, context build), and Stages 7–8 are delivery (post-hook, send).',
    }
  },

  // ── MODULE 05 ──────────────────────────────────────────────────────────────
  {
    id: 'mod-05', num: '05', title: 'Plugins', group: 'Architecture',
    subtitle: 'Extending your agent with tools that go beyond text generation',
    steps: [
      {
        title: 'What Are Plugins',
        blocks: [
          T('Without plugins, your agent is limited to generating text based on what it was trained on. Plugins give the agent the ability to *act* — fetch live data, read files, call APIs, execute code, and interact with external services.'),
          T('Under the hood, plugins are implemented as LLM "tools" or "function calls" — the model can request to use a plugin mid-response, OpenClaw executes it, and the result is fed back to the model to complete the response.'),
          TBL(
            ['Plugin type', 'What it enables', 'Examples'],
            [
              ['Data retrieval', 'Fetch real-time or external information', 'web-search, weather, database-query'],
              ['File operations', 'Read and write files in the workspace', 'file-reader, file-writer, pdf-parser'],
              ['External APIs', 'Call third-party services', 'calendar, crm, webhook'],
              ['Computation', 'Run code or math', 'code-executor, calculator'],
              ['Communication', 'Send messages to other channels', 'email-sender, slack-notifier'],
            ]
          ),
          CL('info', 'The agent decides on its own when to invoke a plugin. You don\'t need to explicitly tell it "use the web search plugin" — if a plugin is enabled and the query warrants it, the model will use it.'),
        ]
      },
      {
        title: 'Built-in Plugins',
        blocks: [
          T('OpenClaw ships with a set of first-party plugins ready to enable.'),
          TBL(
            ['Plugin name', 'Description', 'Key config options'],
            [
              ['web-search', 'Search the web using Brave or Google Search API', 'apiKey, maxResults, safeSearch'],
              ['file-reader', 'Read files from the workspace', 'allowedExtensions, maxFileSizeKB'],
              ['file-writer', 'Create or overwrite files in the workspace', 'allowedPaths, maxFileSizeKB'],
              ['calculator', 'Evaluate mathematical expressions safely', 'precision'],
              ['date-time', 'Get current date/time in any timezone', 'defaultTimezone'],
              ['http-request', 'Make HTTP GET/POST requests to configured endpoints', 'allowedHosts, timeout'],
              ['memory-writer', 'Explicitly update MEMORY.md mid-conversation', 'maxMemoryChars'],
            ]
          ),
          C(`"plugins": [\n  {\n    "name": "web-search",\n    "enabled": true,\n    "config": {\n      "apiKey": "your-brave-api-key",\n      "maxResults": 3\n    }\n  },\n  {\n    "name": "calculator",\n    "enabled": true\n  }\n]`, 'json', 'openclaw.json › plugins'),
        ]
      },
      {
        title: 'Security & Best Practices',
        blocks: [
          T('Poorly configured plugins are one of the most common sources of issues in OpenClaw deployments.'),
          LI([
            'Only enable plugins your agent actually needs — each one consumes tokens in the system prompt',
            'Set tight `allowedPaths` for file plugins in production to prevent path traversal',
            'For `http-request`, always whitelist `allowedHosts` — never allow arbitrary URLs in production',
            'Set `maxResults: 3` or lower for web-search to reduce context bloat',
            'Use `enabled: false` to temporarily disable a plugin without losing its configuration',
          ]),
          CL('warning', 'The `http-request` plugin with no `allowedHosts` restriction is a significant security risk. A carefully crafted user prompt could instruct the agent to exfiltrate data to an external server. Always restrict allowed hosts.'),
        ]
      },
      {
        title: 'Custom Plugins',
        blocks: [
          T('You can create custom plugins to integrate any service or logic into your agent. A plugin is a TypeScript module that exports a specific interface.'),
          C(`// plugins/my-plugin.ts\nimport { Plugin, PluginContext } from 'openclaw';\n\nexport const myPlugin: Plugin = {\n  name: 'my-plugin',\n  description: 'What this plugin does — the agent reads this to know when to use it',\n  parameters: {\n    type: 'object',\n    properties: {\n      query: { type: 'string', description: 'The query to process' }\n    },\n    required: ['query']\n  },\n  execute: async (params: { query: string }, ctx: PluginContext) => {\n    const result = await myService.fetch(params.query);\n    return { result };\n  }\n};`, 'typescript', 'plugins/my-plugin.ts'),
          CL('tip', 'The `description` field of a custom plugin is critical — it\'s what the LLM reads to decide when to invoke your plugin. Write it as a clear, one-sentence description of when the plugin is useful.'),
        ]
      }
    ],
    quiz: {
      question: 'What is the main security risk of enabling the `http-request` plugin without configuring `allowedHosts`?',
      options: [
        { id: 'a', label: 'It uses too many tokens in the system prompt' },
        { id: 'b', label: 'A crafted user prompt could make the agent send data to an external server' },
        { id: 'c', label: 'The plugin will fail to load and the agent won\'t start' },
        { id: 'd', label: 'The agent might call itself recursively' },
      ],
      answer: 'b',
      explanation: 'Without `allowedHosts`, the `http-request` plugin can call any URL. A malicious user prompt could instruct the agent to POST sensitive conversation data to an attacker-controlled server. Always whitelist hosts in production.',
    }
  },

  // ── MODULE 06 ──────────────────────────────────────────────────────────────
  {
    id: 'mod-06', num: '06', title: 'Multi-Agent Systems', group: 'Architecture',
    subtitle: 'Orchestrating multiple specialized agents that work together',
    steps: [
      {
        title: 'Why Multiple Agents',
        blocks: [
          T('A single agent trying to do everything — customer support, sales, technical help — performs worse than multiple specialized agents, each with a focused identity and context.'),
          TBL(
            ['Single-agent approach', 'Multi-agent approach'],
            [
              ['One large AGENTS.md trying to cover all roles', 'Separate AGENTS.md per role, each concise and focused'],
              ['Context gets diluted with irrelevant information', 'Each agent only sees context relevant to its specialty'],
              ['Harder to maintain — one change can affect all behaviors', 'Independent workspaces — update one agent without affecting others'],
              ['All conversations go to the same "personality"', 'Users get routed to the best-suited agent automatically'],
            ]
          ),
          CL('tip', 'A good rule of thumb: if your AGENTS.md exceeds 2000 characters to cover everything the bot needs to do, you probably need multiple agents.'),
        ]
      },
      {
        title: 'Routing Strategies',
        blocks: [
          T('OpenClaw offers three strategies for deciding which agent handles a given message.'),
          TBL(
            ['Strategy', 'How it works', 'Best for'],
            [
              ['Semantic routing (default)', 'LLM compares message against each agent\'s `description` and picks the closest match', 'General-purpose multi-agent setups'],
              ['Rule-based routing', 'You define regex or keyword rules that map message patterns to agents', 'High-volume bots where LLM routing adds cost/latency'],
              ['Explicit routing', 'Users type a command like `/support` or `/sales` to manually switch agents', 'Power users who know the agent structure'],
            ]
          ),
          C(`// Rule-based routing example in openclaw.json\n"routing": {\n  "strategy": "rule-based",\n  "rules": [\n    { "pattern": "^/support", "agentId": "support" },\n    { "pattern": "^/sales",   "agentId": "sales" },\n    { "pattern": "precio|cotización", "agentId": "sales" },\n    { "default": "support" }\n  ]\n}`, 'json'),
        ]
      },
      {
        title: 'Agent Handoff',
        blocks: [
          T('When routing switches an ongoing conversation from one agent to another, a "handoff" occurs. By default, handoffs carry conversation history but not agent-specific memory.'),
          TBL(
            ['What carries over on handoff', 'What does NOT carry over'],
            [
              ['Last N messages (from session.maxHistory)', 'MEMORY.md of the previous agent'],
              ['User\'s WhatsApp phone number / identity', 'Scratch files from the previous agent'],
              ['Explicit context set by the user', 'Plugin state from the previous agent'],
            ]
          ),
          CL('info', 'You can configure a "handoff context" — a summary injected into the new agent\'s context on arrival — to smooth transitions. Set this in `handoffContext.md` inside each agent\'s workspace.'),
        ]
      },
      {
        title: 'Shared Resources',
        blocks: [
          T('Multiple agents can share read-only resources — like a company FAQ document or a product catalog — without duplicating them across workspaces.'),
          C(`"agents": [\n  {\n    "id": "support",\n    "workspacePath": "./workspaces/support",\n    "sharedContextPaths": [\n      "./shared/COMPANY_FAQ.md",\n      "./shared/PRODUCT_CATALOG.md"\n    ]\n  },\n  {\n    "id": "sales",\n    "workspacePath": "./workspaces/sales",\n    "sharedContextPaths": [\n      "./shared/PRODUCT_CATALOG.md"\n    ]\n  }\n]`, 'json'),
          CL('tip', 'Shared context files are injected as Layer 8 (CONTEXT.md equivalent) and are subject to trimming. Keep them focused and under 1500 characters each for best results.'),
        ]
      }
    ],
    quiz: {
      question: 'Which routing strategy avoids using the LLM to decide which agent to use, making it best for high-volume bots?',
      options: [
        { id: 'a', label: 'Semantic routing' },
        { id: 'b', label: 'Explicit routing' },
        { id: 'c', label: 'Rule-based routing' },
        { id: 'd', label: 'Probabilistic routing' },
      ],
      answer: 'c',
      explanation: 'Rule-based routing uses regex/keyword patterns defined by you — no LLM call needed to decide the route. This makes it faster and cheaper for high-volume deployments where semantic intelligence in routing isn\'t necessary.',
    }
  },

  // ── MODULE 07 ──────────────────────────────────────────────────────────────
  {
    id: 'mod-07', num: '07', title: 'Memory & Context', group: 'Advanced',
    subtitle: 'Managing what the agent remembers across conversations',
    steps: [
      {
        title: 'The Context Window Problem',
        blocks: [
          T('Every LLM has a context window — a maximum amount of text it can "see" at once. Everything outside the window is effectively forgotten. OpenClaw\'s memory system is designed to work around this limitation.'),
          TBL(
            ['Model', 'Context window', 'Practical limit with system prompt'],
            [
              ['gpt-4o', '128K tokens', '~100K tokens for conversation'],
              ['claude-3-5-sonnet', '200K tokens', '~160K tokens for conversation'],
              ['gpt-3.5-turbo', '16K tokens', '~12K tokens for conversation'],
              ['ollama/llama3.2', '8K tokens', '~5K tokens for conversation'],
            ]
          ),
          CL('warning', 'Even models with large context windows slow down significantly as the context fills up. Long contexts = higher latency and cost. Memory management isn\'t just about staying within limits — it\'s about efficiency.'),
        ]
      },
      {
        title: 'MEMORY.md — Auto-Summarization',
        blocks: [
          T('MEMORY.md is OpenClaw\'s primary mechanism for long-term memory. After each conversation session, the engine summarizes the conversation into structured bullet points and appends them to MEMORY.md.'),
          C(`# Memory\n\n## Session 2024-01-15\n- User is building an e-commerce site on Shopify\n- Prefers Spanish responses\n- Has a budget of ~$500/mo for third-party apps\n- Previously struggled with inventory sync — solved with SKU Bridge plugin\n\n## Session 2024-01-20\n- Asked about marketing automations — recommended Klaviyo integration\n- Interested in a loyalty program — suggested Smile.io`, 'markdown', 'workspace/MEMORY.md'),
          T('On each new conversation, MEMORY.md is injected into Layer 9 of the system prompt, giving the agent background context about the user even before they say anything.'),
          CL('tip', 'You can manually edit MEMORY.md to add permanent facts about a user or customer that should always be remembered. Write them in the same bullet format for consistency.'),
        ]
      },
      {
        title: 'Context vs Memory',
        blocks: [
          T('There\'s an important distinction between two types of "context" in OpenClaw:'),
          TBL(
            ['Type', 'File', 'Layer', 'Updated by', 'Contains'],
            [
              ['Knowledge context', 'CONTEXT.md', 'Layer 8', 'You', 'Static product info, FAQs, policies — doesn\'t change conversation by conversation'],
              ['Episodic memory', 'MEMORY.md', 'Layer 9', 'Agent (auto)', 'Per-user or per-session summaries — changes as conversations happen'],
              ['Active history', 'session storage', 'Layer 10', 'System', 'Raw recent messages — automatically rotated by maxHistory'],
            ]
          ),
          CL('info', 'Think of CONTEXT.md as the agent\'s "training manual" (static) and MEMORY.md as its "personal notes about this user" (dynamic). They serve very different purposes.'),
        ]
      },
      {
        title: 'Memory Best Practices',
        blocks: [
          T('Poorly managed memory is one of the most common causes of degraded agent performance over time.'),
          LI([
            'Review MEMORY.md periodically — if it exceeds 800 characters, manually summarize or archive old sessions',
            'Use specific, factual bullet points in MEMORY.md — avoid vague notes like "user seems happy"',
            'For shared bots (multiple users), never put user-specific data in MEMORY.md — use per-user session files instead',
            'Set `session.maxHistory` between 10–20 for most use cases',
            'Use `bootstrapMaxChars` to enforce a hard limit and prevent runaway prompt growth',
          ]),
          CL('warning', 'If you\'re running a bot for many different users, MEMORY.md should only contain information that applies to ALL users. Per-user memory requires a custom memory plugin or database integration.'),
        ]
      }
    ],
    quiz: {
      question: 'What is the difference between CONTEXT.md and MEMORY.md in terms of who writes them?',
      options: [
        { id: 'a', label: 'Both are written by you manually' },
        { id: 'b', label: 'CONTEXT.md is written by you; MEMORY.md is auto-updated by the agent' },
        { id: 'c', label: 'CONTEXT.md is auto-updated; MEMORY.md is written by you manually' },
        { id: 'd', label: 'Both are auto-updated by the agent' },
      ],
      answer: 'b',
      explanation: 'CONTEXT.md is static reference material you write and maintain (product docs, FAQs, policies). MEMORY.md is dynamically updated by the agent after each conversation session, containing summaries of past interactions.',
    }
  },

  // ── MODULE 08 ──────────────────────────────────────────────────────────────
  {
    id: 'mod-08', num: '08', title: 'Production', group: 'Advanced',
    subtitle: 'Hardening, monitoring, and running OpenClaw reliably at scale',
    steps: [
      {
        title: 'Environment Setup',
        blocks: [
          T('Before going to production, configure your environment correctly. All sensitive values should live in environment variables — never hardcoded in `openclaw.json`.'),
          C(`# .env file (add to .gitignore!)\nOPENAI_API_KEY=sk-...\nANTHROPIC_API_KEY=sk-ant-...\nGATEWAY_AUTH_TOKEN=your-strong-secret-here\nNODE_ENV=production\nPORT=3000`, 'bash', '.env'),
          T('Then in `openclaw.json`, reference environment variables using the `$ENV:` prefix:'),
          C(`{\n  "auth": {\n    "provider": "openai",\n    "apiKey": "$ENV:OPENAI_API_KEY"\n  },\n  "gateway": {\n    "authToken": "$ENV:GATEWAY_AUTH_TOKEN"\n  }\n}`, 'json', 'openclaw.json'),
          TBL(
            ['Security checklist', 'Status'],
            [
              ['API keys in env vars, not in openclaw.json', '☐'],
              ['auth_info_baileys/ in .gitignore', '☐'],
              ['.env in .gitignore', '☐'],
              ['gateway.authToken set and strong (20+ chars)', '☐'],
              ['sandboxing: "minimal" or "full" for all agents', '☐'],
              ['http-request plugin: allowedHosts set if enabled', '☐'],
            ]
          ),
        ]
      },
      {
        title: 'Process Management with PM2',
        blocks: [
          T('Never run OpenClaw directly with `node` or `npm start` in production — the process will die on any error. Use PM2 to keep it alive.'),
          C(`npm install -g pm2\n\n# Start OpenClaw with PM2\npm2 start npm --name "openclaw" -- start\n\n# Enable auto-start on server reboot\npm2 startup\npm2 save`, 'bash'),
          TBL(
            ['PM2 command', 'What it does'],
            [
              ['pm2 status', 'Show all running processes and their status'],
              ['pm2 logs openclaw', 'Stream live logs from the OpenClaw process'],
              ['pm2 restart openclaw', 'Restart the process (applies config changes)'],
              ['pm2 stop openclaw', 'Stop the process without removing it'],
              ['pm2 monit', 'Real-time CPU/memory dashboard for all processes'],
            ]
          ),
          CL('tip', 'PM2 automatically restarts the process on crash. With `pm2 startup`, it also survives server reboots. This is the minimum viable production setup.'),
        ]
      },
      {
        title: 'Logging & Monitoring',
        blocks: [
          T('OpenClaw emits structured logs. In production, capture and analyze these to detect issues early.'),
          C(`# View live logs\npm2 logs openclaw --lines 100\n\n# Export logs to file\npm2 logs openclaw --nostream > openclaw.log\n\n# Rotate logs (prevent disk fill)\npm2 install pm2-logrotate`, 'bash'),
          TBL(
            ['Log level', 'Meaning', 'Action required'],
            [
              ['INFO', 'Normal operation events (connections, messages, responses)', 'None'],
              ['WARN', 'Non-fatal issues (retries, degraded plugin, slow response)', 'Review periodically'],
              ['ERROR', 'Failures that affected a user\'s response', 'Investigate promptly'],
              ['FATAL', 'Startup failure or unrecoverable error — process terminates', 'Immediate attention'],
            ]
          ),
        ]
      },
      {
        title: 'Scaling Considerations',
        blocks: [
          T('A single OpenClaw instance handles roughly 5–10 concurrent conversations comfortably. Beyond that, you\'ll need horizontal scaling.'),
          TBL(
            ['Scenario', 'Recommended approach'],
            [
              ['< 10 simultaneous users', 'Single instance with PM2 — simplest setup'],
              ['10–100 simultaneous users', 'Redis sessions + multiple instances behind a load balancer'],
              ['100+ simultaneous users', 'Containerized deployment (Docker/Kubernetes) with Redis + message queue'],
              ['Global deployment', 'Multi-region with regional WhatsApp numbers'],
            ]
          ),
          CL('tip', 'Start with a single instance and PM2. Only add complexity when you hit actual limits. Premature scaling creates operational overhead with no user benefit.'),
        ]
      }
    ],
    quiz: {
      question: 'What is the correct way to reference an environment variable in `openclaw.json` instead of hardcoding sensitive values?',
      options: [
        { id: 'a', label: 'Use `process.env.KEY` directly in the JSON file' },
        { id: 'b', label: 'Use the `$ENV:KEY` prefix syntax' },
        { id: 'c', label: 'Environment variables cannot be used in openclaw.json' },
        { id: 'd', label: 'Use `{{KEY}}` template syntax' },
      ],
      answer: 'b',
      explanation: 'OpenClaw supports the `$ENV:KEY` prefix in any string value in `openclaw.json`. For example, `"apiKey": "$ENV:OPENAI_API_KEY"` reads the value from the `OPENAI_API_KEY` environment variable at runtime, keeping secrets out of your config file.',
    }
  },

  // ── MODULE 09 ──────────────────────────────────────────────────────────────
  {
    id: 'mod-09', num: '09', title: 'Skills', group: 'Advanced',
    subtitle: 'Teaching the agent to follow precise, step-by-step procedures',
    steps: [
      {
        title: 'Skills vs Tools vs Plugins',
        blocks: [
          T('Three different mechanisms can extend an agent\'s capabilities, and they\'re often confused. Here\'s the definitive distinction:'),
          TBL(
            ['Mechanism', 'What it is', 'Defined where', 'Used when'],
            [
              ['Skill', 'A procedural workflow — step-by-step instructions the agent follows to complete a specific task', 'SKILLS/*/SKILL.md', 'The agent needs to follow a precise, repeatable process'],
              ['Plugin', 'A tool the agent can call to do something (fetch data, run code, write a file)', 'openclaw.json + JS/TS module', 'The agent needs to perform an action beyond text generation'],
              ['AGENTS.md section', 'Behavioral guidance — how to respond, what tone to use, general rules', 'workspace/AGENTS.md', 'Shaping personality and general response style'],
            ]
          ),
          T('A skill is more like a recipe: "When the user asks to generate a report, follow these 5 steps in order." A plugin is more like a tool: "Use the calculator to compute this." They can work together.'),
          CL('info', 'Skills are powerful for complex workflows where the order of steps matters and mistakes are costly — like generating a proposal, filling out a form, or running an onboarding sequence.'),
        ]
      },
      {
        title: 'Skill Folder Structure',
        blocks: [
          T('Each skill lives in its own subfolder inside `SKILLS/`. The folder name is the skill\'s identifier. The only required file is `SKILL.md`.'),
          C(`workspace/SKILLS/\n├── generate-report/\n│   ├── SKILL.md          # Required: definition and instructions\n│   ├── template.md       # Optional: file the skill uses as input\n│   └── example-output.md # Optional: reference for the agent\n├── onboard-client/\n│   └── SKILL.md\n└── draft-proposal/\n    ├── SKILL.md\n    └── proposal-template.md`, 'text'),
          T('The agent scans the SKILLS/ folder on startup and loads each SKILL.md that passes the gating rules. Skills that pass gating are injected into Layer 7 of the system prompt.'),
          CL('tip', 'Keep each skill folder focused on one task. A skill called "generate-report" should only contain files related to report generation — don\'t mix concerns.'),
        ]
      },
      {
        title: 'SKILL.md Frontmatter',
        blocks: [
          T('Every SKILL.md starts with a YAML frontmatter block (between `---` delimiters) that tells OpenClaw when and how to load the skill. The frontmatter is followed by the actual skill instructions in Markdown.'),
          C(`---\nname: generate-report\ndescription: Step-by-step procedure for generating a client report from data\ntriggers:\n  - "generate a report"\n  - "create report"\n  - "make a report for"\nalways: false\nrequires:\n  env: [REPORT_API_KEY]\n  config: [agents.id]\n---\n\n# How to Generate a Report\n\n## Step 1: Gather data\nAsk the user for the reporting period and which metrics to include...\n\n## Step 2: Format the data\n...`, 'yaml', 'SKILLS/generate-report/SKILL.md'),
          TBL(
            ['Frontmatter field', 'Type', 'Required', 'Description'],
            [
              ['name', 'string', '✓', 'Unique identifier for this skill — used in logs and routing'],
              ['description', 'string', '✓', 'One-line description. The LLM reads this to decide whether to invoke the skill'],
              ['triggers', 'string[]', '—', 'Phrases that automatically activate this skill. Semantic matching — not exact'],
              ['always', 'boolean', '—', 'If `true`, inject this skill into every conversation. Default: `false`'],
              ['requires.env', 'string[]', '—', 'Skill is only loaded if these environment variables are set'],
              ['requires.config', 'string[]', '—', 'Skill is only loaded if these `openclaw.json` paths are defined'],
              ['requires.os', 'string', '—', 'Only load on specific OS: `linux`, `darwin` (macOS), `win32`'],
              ['requires.bins', 'string[]', '—', 'Only load if these CLI tools are available in PATH'],
            ]
          ),
        ]
      },
      {
        title: 'The Gating System',
        blocks: [
          T('The `requires` frontmatter fields form a gating system that conditionally enables or disables skills based on the runtime environment. This lets you ship a single workspace that adapts to different deployment contexts.'),
          TBL(
            ['Gate type', 'Frontmatter key', 'Example', 'Use case'],
            [
              ['Environment variable', 'requires.env', '`[SLACK_WEBHOOK_URL]`', 'Only enable Slack-notifying skills on servers that have Slack configured'],
              ['Config presence', 'requires.config', '`[agents.plugins]`', 'Only enable plugin-dependent skills if plugins are configured'],
              ['OS detection', 'requires.os', '`darwin`', 'macOS-only or Linux-only skills (e.g., using system commands)'],
              ['Binary presence', 'requires.bins', '`[ffmpeg, curl]`', 'Skills that shell out to external CLI tools — only load if the tool is installed'],
              ['Always on', 'always: true', '—', 'Core skills that should always be available, no conditions'],
            ]
          ),
          CL('tip', 'Use gating aggressively. It\'s better to have skills silently not load than to have the agent try to use a skill that will fail because a dependency is missing.'),
          CL('info', 'When a skill fails its gating check, it is silently excluded from Layer 7. The agent has zero knowledge of the skill\'s existence — it won\'t reference it or try to use it.'),
        ]
      },
      {
        title: 'Writing Effective Skills',
        blocks: [
          T('A skill\'s Markdown content is the procedure the agent follows. Writing it well is an art — here are the principles that produce reliable, consistent agent behavior.'),
          LI([
            'Use numbered steps — the agent follows them sequentially and can track where it is',
            'Each step should have one clear action — "Ask the user for X" or "Write the file Y" — not both',
            'Include decision points: "If the user says X, go to Step 3. Otherwise, proceed to Step 4."',
            'Specify the exact format of outputs: "Generate a table with these exact columns: Name, Date, Amount"',
            'End with a validation step: "Confirm with the user before sending/saving/submitting"',
          ]),
          C(`# Draft a Proposal\n\n## Step 1: Gather requirements\nAsk: "What is the project scope and expected timeline?"\nWait for user response before proceeding.\n\n## Step 2: Confirm budget\nAsk: "What is the client's approximate budget range?"\n\n## Step 3: Generate draft\nWrite the proposal using this format:\n- Header with client name, date, project name\n- 3-sentence executive summary\n- Scope table: Task | Hours | Rate | Total\n- Payment terms section\n\n## Step 4: Review with user\nPresent the draft and ask: "Should I adjust anything before finalizing?"`, 'markdown', 'SKILLS/draft-proposal/SKILL.md'),
          CL('tip', 'The single most impactful improvement to any skill: add "Wait for user response before proceeding" after steps that ask questions. Without it, the agent may rush through multiple steps in a single response.'),
        ]
      }
    ],
    quiz: {
      question: 'When a skill\'s `requires.bins` check fails (the required CLI tool is not installed), what does the agent experience?',
      options: [
        { id: 'a', label: 'The agent receives an error message and reports it to the user' },
        { id: 'b', label: 'The skill loads anyway but produces warnings' },
        { id: 'c', label: 'The skill is silently excluded — the agent has no knowledge it exists' },
        { id: 'd', label: 'The server refuses to start until all skill dependencies are met' },
      ],
      answer: 'c',
      explanation: 'When any `requires` gate fails, the skill is silently excluded from the loaded set. The agent has zero knowledge of the skill\'s existence — it won\'t reference it, try to use it, or explain its absence. This is by design: a clean, dependency-safe loading mechanism.',
    }
  },
];

// ─── PROGRESS ────────────────────────────────────────────────────────────────

interface Progress {
  currentModuleId: string;
  currentStepIndex: number;
  completedModules: string[];
}

const defaultProgress = (): Progress => ({
  currentModuleId: MODULES[0].id,
  currentStepIndex: 0,
  completedModules: [],
});

const STORAGE_KEY = 'openclaw-guide-v2';

// ─── COPY BUTTON ──────────────────────────────────────────────────────────────

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 rounded hover:bg-white/5"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
};

// ─── INLINE TEXT RENDERER ────────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className="font-mono text-[0.82em] text-emerald-300 bg-emerald-950/50 px-1.5 py-0.5 rounded">{part.slice(1, -1)}</code>;
    return part;
  });
}

// ─── BLOCK RENDERER ───────────────────────────────────────────────────────────

const calloutConfig: Record<CalloutKind, { bg: string; border: string; icon: React.ReactNode }> = {
  tip:     { bg: 'bg-emerald-950/40', border: 'border-emerald-800/50', icon: <Lightbulb size={13} className="text-emerald-400 shrink-0 mt-0.5" /> },
  warning: { bg: 'bg-amber-950/40',   border: 'border-amber-800/50',   icon: <AlertTriangle size={13} className="text-amber-400 shrink-0 mt-0.5" /> },
  info:    { bg: 'bg-blue-950/40',    border: 'border-blue-800/50',    icon: <Info size={13} className="text-blue-400 shrink-0 mt-0.5" /> },
  note:    { bg: 'bg-zinc-800/40',    border: 'border-zinc-700/50',    icon: <BookOpen size={13} className="text-zinc-400 shrink-0 mt-0.5" /> },
};

const BlockRenderer: React.FC<{ block: Block }> = ({ block }) => {
  switch (block.type) {
    case 'text':
      return <p className="text-zinc-300 leading-relaxed text-sm mb-4 last:mb-0">{renderInline(block.text || '')}</p>;

    case 'heading':
      return block.level === 2
        ? <h2 className="text-white font-semibold text-base mt-6 mb-3 first:mt-0">{block.text}</h2>
        : <h3 className="text-zinc-200 font-medium text-sm mt-5 mb-2 first:mt-0">{block.text}</h3>;

    case 'code': {
      const cd = block.code!;
      return (
        <div className="mb-4 last:mb-0 rounded-lg overflow-hidden border border-white/[0.08]">
          <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-500 font-mono uppercase tracking-wider">{cd.lang}</span>
              {cd.filename && <><span className="text-zinc-700 text-xs">·</span><span className="text-[11px] text-zinc-500 font-mono">{cd.filename}</span></>}
            </div>
            <CopyButton text={cd.code} />
          </div>
          <pre className="px-4 py-4 overflow-x-auto bg-[#111111]">
            <code className="font-mono text-zinc-300 text-[0.8rem] leading-relaxed whitespace-pre">{cd.code}</code>
          </pre>
        </div>
      );
    }

    case 'table': {
      const td = block.table!;
      return (
        <div className="mb-4 last:mb-0 overflow-x-auto rounded-lg border border-white/[0.08]">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#1a1a1a]">
                {td.headers.map((h, i) => (
                  <th key={i} className="text-left text-xs font-medium text-zinc-400 px-4 py-3 border-b border-white/[0.08]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {td.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-zinc-300 text-xs align-top">{renderInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'callout': {
      const cl = block.callout!;
      const s = calloutConfig[cl.kind];
      return (
        <div className={`mb-4 last:mb-0 flex gap-3 p-4 rounded-lg border ${s.bg} ${s.border}`}>
          {s.icon}
          <div className="text-xs leading-relaxed text-zinc-300 min-w-0">
            {cl.title && <span className="font-semibold text-white mr-1.5">{cl.title}:</span>}
            {renderInline(cl.text)}
          </div>
        </div>
      );
    }

    case 'list':
      return (
        <ul className="mb-4 last:mb-0 space-y-2">
          {(block.items || []).map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-zinc-300 leading-relaxed">
              <span className="text-zinc-600 shrink-0 mt-0.5 text-xs">→</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );

    case 'divider':
      return <hr className="border-white/[0.08] my-6" />;

    default:
      return null;
  }
};

// ─── MODULE HEADER ────────────────────────────────────────────────────────────

const ModuleHeader: React.FC<{
  module: Module;
  stepIndex: number;
  isCompleted: boolean;
  lang: 'en' | 'es';
}> = ({ module, stepIndex, isCompleted, lang }) => {
  const t = UI_STRINGS[lang];
  return (
    <div className="sticky top-0 z-10 bg-[#0a0a0a]/[0.97] backdrop-blur-sm border-b border-white/[0.06] -mx-8 px-8 pt-5 pb-4 mb-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-2.5">
        <span className="font-mono text-[11px] text-zinc-600 tracking-wider">{module.num}</span>
        <span className="text-zinc-800 text-[11px]">·</span>
        <span className="text-[11px] text-zinc-600">{module.group}</span>
        {isCompleted ? (
          <>
            <span className="text-zinc-800 text-[11px]">·</span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-500">
              <CheckCircle2 size={10} /> {t.completed}
            </span>
          </>
        ) : (
          <>
            <span className="text-zinc-800 text-[11px]">·</span>
            <span className="text-[11px] text-zinc-600 font-mono">{t.step} {stepIndex + 1}/{module.steps.length}</span>
          </>
        )}
      </div>
      {/* Title + subtitle */}
      <h1 className="text-2xl font-bold text-white tracking-tight mb-0.5 leading-tight">{module.title}</h1>
      <p className="text-xs text-zinc-500 mb-4 leading-relaxed">{module.subtitle}</p>
      {/* Step progress dots */}
      <div className="flex items-center">
        {module.steps.map((step, i) => {
          const done = isCompleted ? true : i < stepIndex;
          const active = !isCompleted && i === stepIndex;
          return (
            <React.Fragment key={i}>
              <div title={step.title} className={`
                flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-mono shrink-0 transition-all
                ${done ? 'bg-emerald-500 text-black' : active ? 'bg-white text-black font-bold scale-110' : 'bg-zinc-800/80 text-zinc-600 border border-zinc-700/50'}
              `}>
                {done ? <Check size={8} strokeWidth={3} /> : i + 1}
              </div>
              {i < module.steps.length - 1 && (
                <div className={`h-px flex-1 min-w-[12px] transition-colors duration-500 ${done ? 'bg-emerald-600/50' : 'bg-zinc-800'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      {/* Current step name */}
      {!isCompleted && (
        <div className="mt-2 text-[10px] text-zinc-600 font-mono truncate">→ {module.steps[stepIndex]?.title}</div>
      )}
    </div>
  );
};

// ─── QUIZ VIEW ────────────────────────────────────────────────────────────────

const QuizView: React.FC<{ quiz: Quiz; onPass: () => void; onSkip: () => void }> = ({ quiz, onPass, onSkip }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const correct = submitted && selected === quiz.answer;
  const wrong   = submitted && selected !== quiz.answer;

  const submit = () => {
    if (!selected) return;
    setSubmitted(true);
    if (selected === quiz.answer) setTimeout(onPass, 1400);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-10 border border-white/[0.10] rounded-xl overflow-hidden">
      <div className="px-6 py-4 bg-[#161616] border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
          <span className="text-xs text-zinc-400 font-medium tracking-wide uppercase">Module Check</span>
        </div>
        <button onClick={onSkip} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
          Skip
        </button>
      </div>
      <div className="px-6 py-6">
        <p className="text-white text-sm font-medium mb-5 leading-relaxed">{quiz.question}</p>
        <div className="space-y-2.5">
          {quiz.options.map(opt => {
            let cls = 'border-white/[0.08] text-zinc-300 hover:border-white/20 hover:bg-white/[0.03]';
            if (selected === opt.id && !submitted) cls = 'border-white/30 bg-white/[0.06] text-white';
            if (submitted && opt.id === quiz.answer) cls = 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300';
            if (submitted && selected === opt.id && opt.id !== quiz.answer) cls = 'border-red-500/60 bg-red-950/40 text-red-300';
            return (
              <button key={opt.id} onClick={() => !submitted && setSelected(opt.id)} disabled={submitted}
                className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${cls}`}>
                <span className="font-mono text-[11px] text-zinc-600 mr-2.5">{opt.id.toUpperCase()}.</span>
                {opt.label}
              </button>
            );
          })}
        </div>
        {!submitted ? (
          <div className="mt-5">
            <button onClick={submit} disabled={!selected}
              className="px-5 py-2 bg-white text-black text-sm font-medium rounded-lg disabled:opacity-30 hover:bg-zinc-100 transition-colors">
              Check answer
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
            <div className={`p-4 rounded-lg border text-xs leading-relaxed ${correct ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200' : 'bg-red-950/30 border-red-800/40 text-red-200'}`}>
              <span className="font-semibold block mb-1">{correct ? '✓ Correct' : '✗ Not quite'}</span>
              {quiz.explanation}
            </div>
            {wrong && (
              <button onClick={() => { setSelected(null); setSubmitted(false); }}
                className="mt-3 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                Try again
              </button>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// ─── RESET MODAL ──────────────────────────────────────────────────────────────

const ResetModal: React.FC<{ onConfirm: () => void; onCancel: () => void }> = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
    <motion.div initial={{ scale: 0.96, opacity: 0, y: 8 }} animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="bg-[#111111] border border-white/[0.12] rounded-xl p-6 max-w-sm w-full shadow-2xl"
      onClick={e => e.stopPropagation()}>
      <div className="flex items-start gap-4 mb-5">
        <div className="w-9 h-9 rounded-lg bg-red-950/60 border border-red-800/50 flex items-center justify-center shrink-0">
          <RotateCcw size={16} className="text-red-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm mb-1">Reset all progress?</h3>
          <p className="text-zinc-400 text-xs leading-relaxed">This will clear all completed modules, quiz results, and return you to Module 00. This cannot be undone.</p>
        </div>
      </div>
      <div className="flex gap-2.5">
        <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-lg border border-white/[0.1] text-zinc-300 text-sm hover:bg-white/[0.04] transition-colors">Cancel</button>
        <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">Reset progress</button>
      </div>
    </motion.div>
  </div>
);

// ─── FORWARD WARNING MODAL ────────────────────────────────────────────────────

const ForwardWarningModal: React.FC<{ target: Module; onConfirm: () => void; onCancel: () => void }> = ({ target, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
    <motion.div initial={{ scale: 0.96, opacity: 0, y: 8 }} animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="bg-[#111111] border border-white/[0.12] rounded-xl p-6 max-w-sm w-full shadow-2xl"
      onClick={e => e.stopPropagation()}>
      <div className="flex items-start gap-4 mb-5">
        <div className="w-9 h-9 rounded-lg bg-amber-950/60 border border-amber-800/50 flex items-center justify-center shrink-0">
          <AlertTriangle size={16} className="text-amber-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm mb-1">Jumping ahead</h3>
          <p className="text-zinc-400 text-xs leading-relaxed mb-2">
            You're navigating to <span className="text-white font-medium">{target.num} — {target.title}</span> without completing the previous modules.
          </p>
          <p className="text-zinc-500 text-xs leading-relaxed">
            Some content may be harder to follow without the foundation. You can always come back.
          </p>
        </div>
      </div>
      <div className="flex gap-2.5">
        <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-lg border border-white/[0.1] text-zinc-300 text-sm hover:bg-white/[0.04] transition-colors">Go back</button>
        <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors">Continue anyway</button>
      </div>
    </motion.div>
  </div>
);

// ─── WELCOME SCREEN ───────────────────────────────────────────────────────────

const WelcomeScreen: React.FC<{ onStart: () => void; hasProgress: boolean; onResume: () => void; onBackToGuides: () => void }> = ({ onStart, hasProgress, onResume, onBackToGuides }) => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="max-w-lg w-full">
      <button onClick={onBackToGuides} className="flex items-center gap-1.5 text-zinc-700 hover:text-zinc-400 transition-colors text-xs mb-8">
        <BackIcon size={11} /> All guides
      </button>
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.10] text-xs text-zinc-400 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          OpenClaw Complete Guide · 10 Modules
        </div>
        <h1 className="text-3xl font-semibold text-white mb-3 tracking-tight">Learn OpenClaw from scratch.</h1>
        <p className="text-zinc-400 text-base leading-relaxed">
          From installation to production deployment. Each module builds on the last —
          interactive, hands-on, with real configuration examples from the actual system.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[{ label: 'Modules', value: '10' }, { label: 'Topics', value: '42+' }, { label: 'Quizzes', value: '10' }].map(item => (
          <div key={item.label} className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.08] text-center">
            <div className="text-2xl font-semibold text-white mb-0.5">{item.value}</div>
            <div className="text-xs text-zinc-500">{item.label}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        {hasProgress ? (
          <>
            <button onClick={onResume} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-100 transition-colors">
              Continue where I left off <ArrowRight size={15} />
            </button>
            <button onClick={onStart} className="px-5 py-3 border border-white/[0.12] text-zinc-400 text-sm rounded-lg hover:bg-white/[0.04] transition-colors">Start over</button>
          </>
        ) : (
          <button onClick={onStart} className="flex items-center gap-2 px-8 py-3 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-100 transition-colors">
            Start learning <ArrowRight size={15} />
          </button>
        )}
      </div>
    </div>
  </div>
);

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

const GROUPS = ['Fundamentals', 'Architecture', 'Advanced'];

const Sidebar: React.FC<{
  progress: Progress;
  onNavigate: (id: string) => void;
  onReset: () => void;
  onHome: () => void;
  onBackToGuides: () => void;
  lang: 'en' | 'es';
  onToggleLang: () => void;
}> = ({ progress, onNavigate, onReset, onHome, onBackToGuides, lang, onToggleLang }) => {
  const t = UI_STRINGS[lang];
  const currentIdx = MODULES.findIndex(m => m.id === progress.currentModuleId);
  return (
    <aside className="w-[220px] shrink-0 h-full flex flex-col border-r border-white/[0.07] bg-[#0d0d0d] overflow-y-auto">
      <div className="px-4 pt-3 pb-3 border-b border-white/[0.07] shrink-0 space-y-2">
        <button onClick={onBackToGuides} className="flex items-center gap-1.5 text-zinc-700 hover:text-zinc-400 transition-colors">
          <BackIcon size={11} /><span className="text-[11px]">{t.allGuides}</span>
        </button>
        <button onClick={onHome} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors">
          <Home size={13} /><span className="text-xs font-medium">{t.guideName}</span>
        </button>
      </div>
      <nav className="flex-1 py-4 px-2">
        {GROUPS.map(group => {
          const groupMods = MODULES.filter(m => m.group === group);
          return (
            <div key={group} className="mb-5 last:mb-0">
              <div className="px-2 mb-2 text-[10px] font-semibold text-zinc-700 uppercase tracking-widest">{group}</div>
              <div className="space-y-0.5">
                {groupMods.map(mod => {
                  const modIdx = MODULES.findIndex(m => m.id === mod.id);
                  const done    = progress.completedModules.includes(mod.id);
                  const current = mod.id === progress.currentModuleId;
                  const ahead   = modIdx > currentIdx && !done;
                  return (
                    <button key={mod.id} onClick={() => onNavigate(mod.id)}
                      className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-left transition-all text-xs border-l-2
                        ${current
                          ? 'border-white bg-white/[0.06] text-white'
                          : done
                          ? 'border-emerald-500/30 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] hover:border-emerald-500/50'
                          : 'border-transparent text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.03]'
                        }`}>
                      <div className="shrink-0 ml-0.5">
                        {done    ? <CheckCircle2 size={12} className="text-emerald-500" />
                        : current ? <div className="w-2 h-2 rounded-full bg-white" />
                        : ahead   ? <Lock size={10} className="text-zinc-700" />
                                  : <Circle size={12} className="text-zinc-700" />}
                      </div>
                      <span className="font-mono text-[10px] text-zinc-600 shrink-0">{mod.num}</span>
                      <span className="truncate leading-tight">{mod.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-white/[0.07] shrink-0 space-y-3">
        <div>
          <div className="flex items-center justify-between text-[10px] text-zinc-600 mb-1.5">
            <span>{t.progress}</span><span>{progress.completedModules.length}/{MODULES.length}</span>
          </div>
          <div className="h-0.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${(progress.completedModules.length / MODULES.length) * 100}%` }} />
          </div>
        </div>
        <button onClick={onReset} className="flex items-center gap-1.5 text-[11px] text-zinc-700 hover:text-zinc-400 transition-colors">
          <RotateCcw size={10} />{t.reset}
        </button>
        <div className="pt-2 border-t border-white/[0.05]">
          <button onClick={onToggleLang}
            className="flex items-center gap-1.5 w-full px-2.5 py-1.5 rounded-md bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.07] transition-colors">
            <span className={`text-[10px] font-mono font-semibold ${lang === 'en' ? 'text-white' : 'text-zinc-600'}`}>EN</span>
            <span className="text-zinc-700 text-[10px]">/</span>
            <span className={`text-[10px] font-mono font-semibold ${lang === 'es' ? 'text-white' : 'text-zinc-600'}`}>ES</span>
            <span className="text-[10px] text-zinc-600 ml-auto">{lang === 'en' ? 'Español' : 'English'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

// ─── FLOATING NAV ─────────────────────────────────────────────────────────────

const FloatingNav: React.FC<{
  onPrev: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
  isCompleted: boolean;
  showQuiz: boolean;
  stepIndex: number;
  totalSteps: number;
  lang: 'en' | 'es';
}> = ({ onPrev, onNext, isFirst, isLast, isCompleted, showQuiz, stepIndex, totalSteps, lang }) => {
  const t = UI_STRINGS[lang];
  const showNext = !isCompleted && !(isLast && showQuiz);
  const nextLabel = isLast && !isCompleted && !showQuiz ? t.takeQuiz : t.continue;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: isFirst ? 0 : 1, y: 0 }}
        onClick={onPrev}
        disabled={isFirst}
        className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#1a1a1a] border border-white/[0.1] text-zinc-400 hover:text-white hover:border-white/[0.2] text-xs font-medium transition-all disabled:pointer-events-none shadow-lg shadow-black/40 backdrop-blur-sm"
      >
        <ChevronLeft size={13} /> {t.previous}
      </motion.button>
      <div className="px-2.5 py-1.5 rounded-lg bg-[#111]/80 border border-white/[0.07] text-[10px] font-mono text-zinc-600 backdrop-blur-sm">
        {stepIndex + 1}/{totalSteps}
      </div>
      {isCompleted ? (
        <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          <CheckCircle2 size={13} /> {t.done}
        </div>
      ) : showNext ? (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onNext}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-100 transition-all shadow-lg shadow-black/40"
        >
          {nextLabel} <ChevronRight size={13} />
        </motion.button>
      ) : null}
    </div>
  );
};

// ─── MODULE CONTENT ───────────────────────────────────────────────────────────

const ModuleContent: React.FC<{
  module: Module;
  stepIndex: number;
  isCompleted: boolean;
  showQuiz: boolean;
  onNext: () => void;
  onPrev: () => void;
  onComplete: () => void;
  onSkipQuiz: () => void;
  lang: 'en' | 'es';
}> = ({ module, stepIndex, isCompleted, showQuiz, onNext, onPrev, onComplete, onSkipQuiz, lang }) => {
  const step = module.steps[stepIndex];
  const isLast  = stepIndex === module.steps.length - 1;
  const isFirst = stepIndex === 0;

  return (
    <div className="flex-1 overflow-y-auto">
      <FloatingNav
        onPrev={onPrev}
        onNext={onNext}
        isFirst={isFirst}
        isLast={isLast}
        isCompleted={isCompleted}
        showQuiz={showQuiz}
        stepIndex={stepIndex}
        totalSteps={module.steps.length}
        lang={lang}
      />
      <div className="max-w-2xl mx-auto px-8 py-0">
        <ModuleHeader module={module} stepIndex={stepIndex} isCompleted={isCompleted} lang={lang} />
        <AnimatePresence mode="wait">
          <motion.div key={`${module.id}-${stepIndex}`}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}>
            <h2 className="text-white font-semibold text-base mb-6">
              <span className="font-mono text-zinc-600 text-sm mr-2">{stepIndex + 1}.</span>{step.title}
            </h2>
            <div>
              {step.blocks.map((block, i) => <BlockRenderer key={i} block={block} />)}
            </div>

            {isLast && !isCompleted && showQuiz && (
              <QuizView quiz={module.quiz} onPass={onComplete} onSkip={onSkipQuiz} />
            )}

            {/* Bottom padding to avoid content hidden behind floating nav */}
            <div className="h-24" />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const GuiaPage: React.FC = () => {
  const routerNavigate = useRouterNavigate();
  const [progress, setProgress] = useState<Progress>(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); if (s) return JSON.parse(s); } catch {}
    return defaultProgress();
  });
  const [showWelcome, setShowWelcome]       = useState(true);
  const [showReset, setShowReset]           = useState(false);
  const [forwardTarget, setForwardTarget]   = useState<Module | null>(null);
  const [showQuiz, setShowQuiz]             = useState(false);
  const [language, setLanguage]             = useState<'en' | 'es'>(() => {
    try { return (localStorage.getItem(LANG_STORAGE_KEY) as 'en' | 'es') || 'en'; } catch { return 'en'; }
  });
  const toggleLanguage = useCallback(() => {
    setLanguage(l => {
      const next = l === 'en' ? 'es' : 'en';
      try { localStorage.setItem(LANG_STORAGE_KEY, next); } catch {}
      return next;
    });
  }, []);

  const hasStoredProgress = (() => {
    try { return !!localStorage.getItem(STORAGE_KEY); } catch { return false; }
  })();

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch {}
  }, [progress]);

  useEffect(() => { setShowQuiz(false); }, [progress.currentModuleId, progress.currentStepIndex]);

  const currentModule  = MODULES.find(m => m.id === progress.currentModuleId) || MODULES[0];
  const currentModIdx  = MODULES.findIndex(m => m.id === progress.currentModuleId);
  const isCompleted    = progress.completedModules.includes(currentModule.id);

  const navigate = useCallback((moduleId: string) => {
    const targetIdx  = MODULES.findIndex(m => m.id === moduleId);
    const done       = progress.completedModules.includes(moduleId);
    const isCurrent  = moduleId === progress.currentModuleId;
    if (isCurrent) return;
    if (targetIdx <= currentModIdx || done) {
      setProgress(p => ({ ...p, currentModuleId: moduleId, currentStepIndex: 0 }));
      setShowWelcome(false);
      return;
    }
    setForwardTarget(MODULES.find(m => m.id === moduleId)!);
  }, [progress.completedModules, progress.currentModuleId, currentModIdx]);

  const confirmForward = useCallback(() => {
    if (forwardTarget) {
      setProgress(p => ({ ...p, currentModuleId: forwardTarget.id, currentStepIndex: 0 }));
      setShowWelcome(false);
    }
    setForwardTarget(null);
  }, [forwardTarget]);

  const nextStep = useCallback(() => {
    const isLast = progress.currentStepIndex === currentModule.steps.length - 1;
    if (isLast && !isCompleted) { setShowQuiz(true); return; }
    setProgress(p => ({ ...p, currentStepIndex: p.currentStepIndex + 1 }));
  }, [progress.currentStepIndex, currentModule.steps.length, isCompleted]);

  const prevStep = useCallback(() => {
    if (progress.currentStepIndex > 0) {
      setProgress(p => ({ ...p, currentStepIndex: p.currentStepIndex - 1 }));
    }
  }, [progress.currentStepIndex]);

  const complete = useCallback(() => {
    const nextIdx = currentModIdx + 1;
    setProgress(p => ({
      ...p,
      completedModules: p.completedModules.includes(currentModule.id) ? p.completedModules : [...p.completedModules, currentModule.id],
      currentModuleId: nextIdx < MODULES.length ? MODULES[nextIdx].id : currentModule.id,
      currentStepIndex: 0,
    }));
    setShowQuiz(false);
  }, [currentModule.id, currentModIdx]);

  const skipQuiz = useCallback(() => {
    const nextIdx = currentModIdx + 1;
    setProgress(p => ({
      ...p,
      currentModuleId: nextIdx < MODULES.length ? MODULES[nextIdx].id : currentModule.id,
      currentStepIndex: 0,
    }));
    setShowQuiz(false);
  }, [currentModule.id, currentModIdx]);

  const reset = useCallback(() => {
    setProgress(defaultProgress());
    setShowReset(false);
    setShowWelcome(true);
    setShowQuiz(false);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return (
    <div className="w-full h-screen flex flex-col bg-[#0a0a0a] text-white overflow-hidden"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {showReset    && <ResetModal onConfirm={reset} onCancel={() => setShowReset(false)} />}
      {forwardTarget && <ForwardWarningModal target={forwardTarget} onConfirm={confirmForward} onCancel={() => setForwardTarget(null)} />}

      <div className="flex-1 flex overflow-hidden">
        {!showWelcome && (
          <Sidebar
            progress={progress}
            onNavigate={navigate}
            onReset={() => setShowReset(true)}
            onHome={() => setShowWelcome(true)}
            onBackToGuides={() => routerNavigate('/guides')}
            lang={language}
            onToggleLang={toggleLanguage}
          />
        )}

        {showWelcome ? (
          <WelcomeScreen
            onStart={() => { setProgress(defaultProgress()); setShowWelcome(false); }}
            hasProgress={hasStoredProgress && progress.completedModules.length > 0}
            onResume={() => setShowWelcome(false)}
            onBackToGuides={() => routerNavigate('/guides')}
          />
        ) : (
          <ModuleContent
            key={`${currentModule.id}-${progress.currentStepIndex}`}
            module={currentModule}
            stepIndex={progress.currentStepIndex}
            isCompleted={isCompleted}
            showQuiz={showQuiz}
            onNext={nextStep}
            onPrev={prevStep}
            onComplete={complete}
            onSkipQuiz={skipQuiz}
            lang={language}
          />
        )}
      </div>
    </div>
  );
};

export default GuiaPage;
