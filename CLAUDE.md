@AGENTS.md

<!-- CLAUDE-KNOWLEDGE-BLOCK:START (managed by ~/.claude/knowledge - do not edit by hand) -->

## Central knowledge (read this first)

This project does not hold its own copy of the working rules or the lessons
learned elsewhere. Those live in one place, shared by every project:

**`~/.claude/knowledge/`** (private repository `hamidjamil0420/claude-knowledge`)

Read before starting work here:

1. `~/.claude/knowledge/rules/portable-working-rules.md` - how to work with
   Hamid: communication, git and commits, code quality, testing, database.
2. `~/.claude/knowledge/learnings/cross-project.md` - dated lessons from every
   project, each with the reason it matters.
3. `~/.claude/knowledge/playbooks/web-app.md` - what is already known about
   building this kind of project.
4. `~/.claude/knowledge/projects/index.md` - what this project shares with the
   others, and therefore what a change here can break somewhere else.

Before publishing or releasing anything, walk
`~/.claude/knowledge/checklists/ship-readiness.md`. It is short, and skipping it
is how a real credential reached a published application once already.

**Write back the moment something is learned.** Do not leave it in this
conversation and do not batch it for the end. Decide where by asking whether it
would have helped a different project:

- Useful to any project: `~/.claude/knowledge/learnings/cross-project.md` and
  the Obsidian note `Claude - Learnings`.
- Useful to projects of this kind: the playbook above.
- Only true here: this file, below this block.

Announce it with the up arrow emoji when recording and the down arrow emoji when
applying, so the learning is visible and not just the result.

If `~/.claude/knowledge/` is missing on this machine, clone it:
`git clone https://github.com/hamidjamil0420/claude-knowledge.git ~/.claude/knowledge`

<!-- CLAUDE-KNOWLEDGE-BLOCK:END -->

## What this project is

BloomBites, an online shop for custom snack bouquets in Pakistan. Next.js App
Router (Next 16, React 19), Firebase Auth and Firestore through the client SDK
with committed `firestore.rules`, Cloudflare R2 for product images behind
admin-only presigned uploads, Genkit with Gemini for optional AI bouquet
descriptions, Zustand cart persisted in localStorage. Payment is cash on
delivery only. Roles are `customer` and `admin`, stored on `users/{uid}`; the
rules make the role immutable from the client, so promoting an admin is a
manual edit in the Firebase console.

## Commands

- `npm run dev` and `npm run start` both serve on port 9004.
- `npm run code:check` runs lint, prettier check and typecheck; CI runs the
  same plus `npm run build`.
- Local end-to-end work uses the Firebase emulators: set
  `NEXT_PUBLIC_FIREBASE_EMULATOR=1` in `.env.local` with the placeholder
  project `demo-bloombites`, then `npx firebase-tools emulators:start` (needs
  Java 21, `~/.jdks/jdk-21*` on megatron). Promote a test admin by patching
  `users/{uid}.role` through the emulator REST endpoint with
  `Authorization: Bearer owner`.
- On megatron, prefix node commands with `DD_INSTRUMENT_SERVICE_WITH_APM=false`
  to silence the host Datadog injection, and expect slow npm installs (the
  project `.npmrc` raises fetch timeouts and retries for that reason).

## Deployment

Push to `main` triggers `.github/workflows/deploy.yml`, which asks the Lahore
deploy webhook (`deploy-lahore.innovorix.com`) to pull and build on the server
and streams the log back. It needs the `DEPLOY_SECRET` repository secret and
the app registered on the server. The server holds the real `.env.local`; see
`.env.example` for every key. Firestore rules are deployed separately with
`firebase deploy --only firestore:rules` from a logged-in Firebase CLI.

## Things that are true only here

- `AGENTS.md` and the `@AGENTS.md` line above are written by `next dev`
  itself; keep them committed so the tree stays clean.
- Order documents use `userId` (null for guests) and start as `Pending`; the
  rules only allow admins to change `status` and nothing else on an order.
- Full-page Playwright screenshots of the storefront show blank bands below the
  hero: sections reveal on scroll. Use viewport screenshots at scroll offsets.
