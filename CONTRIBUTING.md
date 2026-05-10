# Contributing to TaskMindAI

Thank you for your interest in contributing to TaskMindAI! We are building a specialized platform for AI teaching, and we value high-quality, readable, and maintainable code.

## 🛠 Development Workflow

This repository uses [Nx](https://nx.dev). All tasks (build, test, lint, serve) should be run through the Nx CLI.

### Preferred Command Prefix
We prefer using the local Nx installation via `npm exec nx`.

```bash
# Serve the web app
npm exec nx serve web

# Run tests for a specific project
npm exec nx test api

# Lint all projects
npm exec nx run-many -t lint
```

## 📐 Coding Standards

### General Principles
- **Readability first**: Write code that is easy to understand before applying clever abstractions.
- **Incremental Implementation**: Build features in small, focused PRs with clear DTOs and services.
- **Explicit Boundaries**: Respect the folder structure and feature-first boundaries.

### Angular (Frontend)
- **Standalone Components**: All new components must be standalone.
- **Folder Structure**: Every component must live in its own folder with its `.ts`, `.html`, and `.scss` files.
- **Reactivity**: Prefer **Angular Signals** and the `resource()` API for async state. Avoid manual `subscribe()` calls unless necessary for specific integrations.
- **Styling**: Use Vanilla CSS/SCSS with BEM or component-specific styles. Avoid global utility-first frameworks unless explicitly requested.

### NestJS (Backend)
- **Documentation**: All API endpoints must have Swagger decorators and DTO metadata.
- **Validation**: Use `class-validator` and DTOs for all request payloads.
- **Persistence**: Use Prisma for all database interactions. Keep logic in Services, not Controllers.

### Prisma (Database)
- **Migrations**: Always use `npm exec nx migrate-dev api` to create migrations. Never modify the database schema manually.
- **Seeding**: Add test data to `prisma/seed.ts` to ensure a consistent development environment.

## 🌿 Branching & Commits

### Branch Naming
- `feat/feature-name`
- `fix/bug-description`
- `docs/topic-name`
- `refactor/area-name`

### Commit Messages
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat: add document parsing logic`
- `fix: resolve signals race condition in studio`
- `docs: update setup guide in readme`

## 🚀 Pull Request Process

1. **Self-Review**: Ensure your code passes linting and tests locally.
2. **Documentation**: Update any relevant `README.md` or API documentation.
3. **Screenshots**: If you've made UI changes, include screenshots or a short recording in the PR description.
4. **Description**: Clearly explain *what* changed and *why*.

---

By contributing to TaskMindAI, you agree to uphold our standards for code quality and professional collaboration.
