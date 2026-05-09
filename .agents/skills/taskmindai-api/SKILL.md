---
name: taskmindai-api
description: "TaskMindAI NestJS API conventions. Use for apps/api, REST endpoints, modules/controllers/services, DTO validation, workspace/document/annotation/rule/correction APIs, clean errors, and backend code generation."
---

# TaskMindAI API

## Stack

- NestJS.
- REST APIs.
- Prisma/PostgreSQL.
- DTO validation.
- Module/controller/service architecture.

## Structure

- Put backend code in `apps/api`.
- Use explicit domain modules: workspaces, documents, annotations, operational-rules, teaching-memory.
- Keep controllers thin.
- Put business logic in services.
- Use Prisma only from services or dedicated data-access services.
- Share request/response contracts through `libs/shared` when Angular also needs them.

## API Rules

- Validate all request DTOs.
- Return clear domain errors for missing resources, invalid document state, and invalid applicability decisions.
- Do not expose Prisma models directly as public API contracts.
- Keep endpoints boring and explicit.
- Do not add auth in MVP 0.

## MVP Endpoints

- Workspaces: create/list/get.
- Documents: upload/list/get parsed text.
- Annotations: create/list/update/delete against text ranges.
- Operational rules: create/list/update/delete.
- Corrections: capture human correction and reason.
- Teaching memory: query stored examples/rules for a workspace or document.
