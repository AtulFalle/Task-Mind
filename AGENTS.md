<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

# TaskMindAI Product Guidance

TaskMindAI is a collaborative AI teaching and specialization platform. It is not a generic chatbot, AGI system, autonomous agent framework, or no-code AI platform. Build operationally specialized AI workflows where humans teach the system through annotations, corrections, rules, applicability constraints, and reasoning explanations.

## MVP 0 Scope

- Build Document Studio only: workspaces, document upload, text parsing, text selection/highlighting, annotations, operational rules, AI extraction suggestions later, human corrections, and teaching memory.
- Preserve applicability awareness: the system must know when extraction should apply and when it should fail gracefully.
- Do not implement authentication, RAG, OCR, fine-tuning, autonomous agents, websockets, microservices complexity, Kubernetes, or distributed systems for MVP 0.
- Prefer reliability, explainability, constrained behavior, and specialization over hype or broad AI claims.

## Intended Repository Shape

- `apps/web`: latest stable Angular frontend.
- `apps/api`: NestJS REST API.
- `apps/ai`: future FastAPI service.
- `libs/shared`: shared contracts and domain types.
- `libs/ui`: reusable Angular UI.
- `libs/config`: shared configuration helpers.
- `prisma/`: Prisma schema, migrations, and seeds.
- `docker/`: Dockerfiles and Compose support.
- `docs/`: product and architecture notes.

Current code is boilerplate and may be replaced as the repo evolves. Do not preserve boilerplate patterns unless they match the intended architecture.

## Required Skills

- Use `taskmindai-product` for product scope, MVP boundaries, teaching memory, and applicability decisions.
- Use `taskmindai-angular` for Angular UI work. Target the latest stable Angular release, not a pinned old major, unless the user explicitly asks for a specific version.
- Use `taskmindai-api` for NestJS API work.
- Use `taskmindai-prisma` for database and Prisma work.
- Use `taskmindai-docker` for Docker Compose and container work.
- Use `taskmindai-ai-service` for future FastAPI/Ollama/RAG planning or implementation.
- Use `task-mind-tech-stack` only as the stack router when a task spans multiple areas.

## Coding Rules

- Write readable code before clever abstractions.
- Implement incrementally with small focused components, services, DTOs, and modules.
- Keep folder boundaries explicit and feature-first.
- When adding or changing NestJS APIs in `apps/api`, add or update Swagger decorators, request DTO metadata, and response DTO documentation in the same change so `/api/docs` stays accurate.
- Avoid premature reusable frameworks, broad platform abstractions, and enterprise patterns before the MVP needs them.
- Use Nx generators for scaffolding, Nx targets for validation, and shared libraries only when code is truly shared.
- This repo uses `package-lock.json`; prefer `npm exec nx ...`. If the local npm shim fails, use `node node_modules/nx/dist/bin/nx.js ...` and mention the fallback.
