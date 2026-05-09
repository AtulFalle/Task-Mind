---
name: task-mind-tech-stack
description: "Router skill for TaskMindAI cross-stack implementation. Use when a task spans Angular, NestJS, Prisma, Docker, future FastAPI AI service, shared contracts, Nx repository structure, or MVP architecture decisions."
---

# TaskMindAI Stack Router

Use this skill after `nx-workspace` when a task crosses technology boundaries. Load the focused TaskMindAI skill for the actual implementation area.

## First Checks

- Read `AGENTS.md` and preserve the Nx managed block exactly.
- Use `nx-workspace` for project and target discovery; use `nx-generate` before scaffolding apps, libs, or project structure.
- Prefer the repo package manager. This workspace currently has `package-lock.json`; if `npm exec` is broken locally, use `node node_modules/nx/dist/bin/nx.js` as the fallback for Nx reads/runs and mention that fallback.
- Treat current app code as boilerplate unless it has been intentionally replaced.
- Target the intended repo shape: `apps/web`, `apps/api`, future `apps/ai`, `libs/shared`, `libs/ui`, `libs/config`, `prisma`, `docker`, `docs`.
- Target latest stable Angular for frontend work. Check the installed package versions and current Angular release status before migrations or new scaffolding.

## Skill Routing

- Product scope, domain model, workflows, teaching memory: use `taskmindai-product`.
- Angular UI, Material, signals, SCSS/BEM: use `taskmindai-angular`.
- NestJS REST modules, DTOs, services: use `taskmindai-api`.
- Prisma/PostgreSQL schema, migrations, persistence: use `taskmindai-prisma`.
- Docker Compose, Postgres/Redis containers: use `taskmindai-docker`.
- Future FastAPI/Ollama/RAG planning: use `taskmindai-ai-service`.

## Default Workflow

1. Confirm the request fits MVP 0 or call out scope creep.
2. Discover existing Nx projects and current boilerplate before editing.
3. Choose the smallest app/lib boundary that fits the feature.
4. Preserve teaching memory, corrections, rules, and applicability decisions.
5. Validate through Nx targets where available.
