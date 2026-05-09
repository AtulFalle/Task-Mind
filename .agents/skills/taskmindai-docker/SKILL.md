---
name: taskmindai-docker
description: "TaskMindAI Docker conventions. Use for Docker Compose, Postgres, Redis, local service containers, Dockerfiles, environment variables, and container workflows for the Nx Angular/NestJS/FastAPI repository."
---

# TaskMindAI Docker

## MVP Containers

- PostgreSQL for Prisma.
- Redis for future queues/cache, but do not build queue architecture until needed.
- API and web containers only when useful for local or CI workflows.
- Future AI service container for FastAPI/Ollama integration planning.

## Rules

- Put Docker assets in `docker/`.
- Use Compose for local dependencies first.
- Keep `.env.example` current.
- Never commit secrets.
- Add healthchecks for Postgres and Redis.
- Avoid Kubernetes and distributed-system patterns.

## Node Images

- Prefer multi-stage Dockerfiles.
- Build through Nx targets.
- Keep runtime images small and non-root where practical.
- Copy only required build output and production dependencies.

## Verification

- Validate Compose files for paths, ports, volumes, and env names.
- Run Docker only when available and relevant.
