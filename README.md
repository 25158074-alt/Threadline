# Threadline
https://threadline-0dwp893.public.builtwithrocket.new/#testimonials
Threadline

Organizations lose track of their own decisions. A team reaches a call in a meeting, the reasoning lives in someone's memory for a week, and then it's gone — the owner has moved on, the deadline passes quietly, and the same debate gets re-litigated from scratch.

Threadline turns raw meeting notes into a living, accountable record:

Capture — paste meeting notes, a transcript, or a chat thread. Threadline extracts every concrete decision, along with its owner, deadline, and stated reasoning — no manual logging.
Track — each decision becomes a card on a visual thread timeline, color-coded by status (pending, overdue, resolved), so nothing falls through the cracks.
Recall — ask "why did we decide X?" and get an answer grounded only in the decisions actually on record — instant institutional memory instead of digging through old messages.
Stack
Next.js 16 (App Router, API routes)
PostgreSQL via Drizzle ORM
Tailwind CSS 4
TypeScript throughout
Getting started
1. Install dependencies
npm install
2. Set up the database

Threadline needs a running Postgres instance and a DATABASE_URL environment variable. Create a .env file in the project root:

DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db

(Adjust the credentials to match your local or hosted Postgres. drizzle.config.json uses the same default connection string, so a local Postgres on port 5432 with the app_db database works out of the box.)

Push the schema to your database:

npx drizzle-kit push
3. Run the dev server
npm run dev

Visit http://localhost:3000.

4. (Optional) Seed sample data

The app ships with an empty database. To load a few example meetings and decisions so the Track/Recall views aren't empty on first run:

curl -X POST http://localhost:3000/api/seed

This only seeds if the meetings table is empty — it won't create duplicates on repeat calls.

Scripts
npm run dev — Start the Next.js dev server
npm run build — Production build
npm run start — Run the production build
npm run lint — Lint with ESLint
npm run typecheck — Type-check with tsc --noEmit
Project structure
src/
  app/
    page.tsx                  # Landing page + dashboard
    layout.tsx
    globals.css
    api/
      meetings/                # POST: capture notes → extract & store decisions
      meetings/[id]/
      decisions/                # GET: list/filter tracked decisions
      decisions/[id]/
      recall/                   # POST: ask a question, get matching decisions
      seed/                     # POST: load example data (no-op if data exists)
      health/                   # GET: database connectivity check
  components/
    CaptureForm.tsx            # Paste-notes input
    Dashboard.tsx               # Top-level view switcher
    ThreadBoard.tsx             # Timeline of decision cards
    DecisionCard.tsx
    Recall.tsx                  # "Why did we decide X?" search
  db/
    schema.ts                   # `meetings` and `decisions` tables (Drizzle)
    index.ts                    # Postgres connection pool
  lib/
    extract.ts                   # Rule-based decision/owner/deadline/reasoning extractor
    status.ts                    # pending / overdue / resolved logic + display metadata
    types.ts
How extraction works

src/lib/extract.ts parses pasted text for decision-like sentences (e.g. "We decided to...", "Decision: ...", "Approved..."), then pulls the owner (Owner: Priya, "Dana will own it"), deadline (dates, weekdays, "end of week", "Q3", etc.), and a "because ..." reasoning clause out of the surrounding sentences. It's a deterministic, rule-based pass rather than a model call — no API key required to run it. Swap in a real LLM call here if you want extraction to handle looser or more ambiguous phrasing.

API overview
GET /api/meetings — List meetings with decision counts
POST /api/meetings — Submit raw notes (title, rawNote, source); extracts and stores decisions
GET /api/meetings/[id] / DELETE /api/meetings/[id] — Fetch or remove a single meeting
GET /api/decisions — List decisions, filterable by meetingId and status
GET /api/decisions/[id] / PATCH /api/decisions/[id] / DELETE /api/decisions/[id] — Read, update (e.g. mark resolved), or remove a decision
POST /api/recall — Submit { question }; returns decisions ranked by keyword relevance
POST /api/seed — Load example meetings/decisions if the database is empty
GET /api/health — Simple DB connectivity check
Status logic

A decision's status is derived, not just stored: computeStatus() in src/lib/status.ts marks a decision overdue once its deadline has passed unless it's already been marked resolved, otherwise it stays pending.

Deploying

Any platform that runs Next.js works (e.g. Vercel). You'll need:

A reachable Postgres database with DATABASE_URL set in your deployment environment.
Schema pushed via npx drizzle-kit push (run once against the production database).
npm run build as the build command, npm run start (or your platform's Next.js runtime) to serve it.



