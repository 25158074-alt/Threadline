# Threadline

Threadline turns meeting notes into a living, accountable record of decisions: what was decided, who owns it, when it is due, and why.

## Live site

[Open Threadline on GitHub Pages](https://25158074-alt.github.io/Threadline/)

## What was fixed

The original repository contained the application only inside uploaded ZIP files and expected a PostgreSQL-backed Next.js server. GitHub Pages cannot run server routes or a database, so the repository is now a real, buildable Next.js project configured for static export. Capture, tracking, resolve actions, delete actions, and recall search run in browser `localStorage`, with a sample decision thread available on first visit.

## Development

```bash
npm ci
npm run typecheck
npm run lint
npm run build
```

The production site is emitted to `out/`. Pushes to `main` automatically deploy it through `.github/workflows/deploy-pages.yml`.
