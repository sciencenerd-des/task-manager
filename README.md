# Task Manager

A full-stack task management application with Kanban board, list view, and user authentication.

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **Backend:** Convex (real-time database + serverless functions)
- **Authentication:** WorkOS AuthKit SDK
- **Drag & Drop:** @dnd-kit

## Features

- User authentication (email/password + OAuth via WorkOS)
- Real-time data synchronization across tabs/devices
- Project management (create, edit, archive, delete)
- Task management with Kanban board and list view
- Drag-and-drop task reordering
- Task filtering by status and priority
- Dashboard with task summaries and overdue tasks
- **AI-assisted task entry** — describe a task in plain English (e.g.
  *"urgent: submit the GST return by friday"*) and the form auto-fills title,
  priority, and due date for review before you create it.

### AI-assisted task entry

The "Describe it in plain English" box in the create-task dialog calls a Convex
action (`tasks.parseText`) that turns a natural-language note into structured
fields. It uses the **OpenAI API** when `OPENAI_API_KEY` is configured in your
Convex environment, and falls back to a deterministic local parser when it isn't —
so the feature works with or without a key (just more cleverly with one). The
parsed fields populate the form for you to review; nothing is created
automatically. The local parser is pure and unit-tested (`npm test`).

To enable the LLM path, set the key in your Convex deployment:

```bash
npx convex env set OPENAI_API_KEY sk-...
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Convex account (https://convex.dev)
- WorkOS account (https://workos.com)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example env file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Required variables:
- `NEXT_PUBLIC_CONVEX_URL` - From Convex dashboard
- `WORKOS_CLIENT_ID` - From WorkOS dashboard
- `WORKOS_API_KEY` - From WorkOS dashboard
- `WORKOS_COOKIE_PASSWORD` - 32+ character random string
- `NEXT_PUBLIC_WORKOS_REDIRECT_URI` - Your auth callback URL

### 3. Initialize Convex

```bash
npx convex dev
```

This will:
- Create your Convex project (if new)
- Deploy functions to Convex
- Generate TypeScript types

### 4. Configure WorkOS Webhooks

In your WorkOS Dashboard → Webhooks, add:
- **Endpoint:** `https://<your-convex-deployment>.convex.site/authkitEvent`
- **Events:** `user.created`, `user.updated`, `user.deleted`

### 5. Run Development Server

In two terminals:

```bash
# Terminal 1: Next.js frontend
npm run dev:frontend

# Terminal 2: Convex backend (if not already running)
npm run dev:backend
```

Or run both concurrently:

```bash
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/       # Protected dashboard pages
│   └── callback/          # WorkOS auth callback
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Header, Sidebar
│   ├── projects/          # Project components
│   ├── tasks/             # Task & Kanban components
│   └── dashboard/         # Dashboard widgets
├── convex/                # Convex backend
│   ├── schema.ts          # Database schema
│   ├── auth.ts            # User sync events
│   ├── users.ts           # User queries/mutations
│   ├── projects.ts        # Project CRUD
│   ├── tasks.ts           # Task CRUD
│   └── dashboard.ts       # Dashboard aggregations
├── lib/                   # Utilities
├── providers/             # React context providers
└── middleware.ts          # Auth middleware
```

## Deployment

### Automated CI/CD (GitHub Actions)

This project includes a CI/CD pipeline that:
- Runs linting and type checking on all PRs
- Deploys preview environments for PRs
- Deploys to production on merge to main

**Required GitHub Secrets:**
- `CONVEX_DEPLOY_KEY` - From Convex Dashboard → Settings → Deploy Keys
- `NEXT_PUBLIC_CONVEX_URL` - Your Convex deployment URL

### Manual Deployment

#### 1. Deploy Convex Backend

```bash
npx convex deploy
```

#### 2. Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables:
   - `CONVEX_DEPLOY_KEY`
   - `NEXT_PUBLIC_CONVEX_URL`
   - `WORKOS_CLIENT_ID`
   - `WORKOS_API_KEY`
   - `WORKOS_COOKIE_PASSWORD`
   - `NEXT_PUBLIC_WORKOS_REDIRECT_URI`
4. Deploy (build command is preconfigured in `vercel.json`)

### Environment Variables for Production

| Variable | Description |
|----------|-------------|
| `CONVEX_DEPLOY_KEY` | Deploy key from Convex dashboard |
| `NEXT_PUBLIC_CONVEX_URL` | Your Convex deployment URL |
| `WORKOS_CLIENT_ID` | WorkOS client ID |
| `WORKOS_API_KEY` | WorkOS API key |
| `WORKOS_COOKIE_PASSWORD` | 32+ char secret for session cookies |
| `NEXT_PUBLIC_WORKOS_REDIRECT_URI` | Production callback URL |

## Continuous integration

CI (`.github/workflows/ci.yml`) runs **lint + unit tests on every push** with no
secrets required. The Convex **typecheck/build/deploy** jobs are opt-in, because
they push functions to your Convex deployment and therefore need it fully
configured. To enable them:

1. Set the WorkOS env vars **on the Convex deployment** (not just in GitHub):
   ```bash
   npx convex env set WORKOS_CLIENT_ID <id>
   npx convex env set WORKOS_API_KEY <key>
   npx convex env set WORKOS_WEBHOOK_SECRET <secret>
   ```
2. Add repo **secrets** `CONVEX_DEPLOY_KEY` and `NEXT_PUBLIC_CONVEX_URL`
   (Settings → Secrets and variables → Actions).
3. Add a repo **variable** `CONVEX_DEPLOY` = `true` (same page, Variables tab).

Until step 3, the deploy-dependent jobs are skipped and CI stays green on tests.

## License

MIT

---

## Developer experience angle

This is a production-style full-stack app demonstrating how to add a small, reviewable OpenAI feature to an existing developer workflow.

## AI-assisted task parsing

The task creation dialog includes a natural-language input. A user can write:

> urgent: submit the GST return by Friday

The Convex action parses that text into structured task fields for review before creation. The app keeps the user in control: AI suggestions are reviewed before the task is created.

## Why this design

- The model assists, but does not silently mutate data.
- The app has a deterministic fallback when no OpenAI key is configured.
- Structured fields make the result inspectable and testable.

## Documentation

- [AI task parser](docs/ai-task-parser.md)
- [Deployment guide](docs/deployment.md)

