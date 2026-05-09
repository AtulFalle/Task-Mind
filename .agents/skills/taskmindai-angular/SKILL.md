---
name: taskmindai-angular
description: "TaskMindAI Angular frontend conventions. Use for apps/web, latest stable Angular, standalone components, Angular Material, signals, SCSS BEM, Document Studio UI, feature-first folder structure, and frontend code generation."
---

# TaskMindAI Angular

## Stack

- Latest stable Angular. Verify current Angular release status and installed `@angular/*` versions before version-specific work.
- Standalone components.
- Angular Material.
- Angular signals for local state.
- SCSS with BEM naming.
- Strict TypeScript.
- No Tailwind.
- No NgRx initially.

## Structure

- Put app code in `apps/web`.
- Use feature-first folders: `features/document-studio`, `features/workspaces`, `features/documents`.
- Put reusable generic UI in `libs/ui`.
- Keep feature-specific UI inside the feature.
- Put shared contracts in `libs/shared`, not inside Angular-only folders.

## Coding Rules

- Keep components small and readable.
- Use signals for local UI state and computed display state.
- Use services for API access and feature orchestration.
- Avoid broad frontend frameworks or reusable abstractions before repetition proves the need.
- Build Document Studio flows directly: upload, parsed text, selection, annotation, rules, correction review.

## UI Rules

- Use Angular Material theming.
- Use semantic HTML and accessible controls.
- Use BEM class names for custom SCSS.
- Keep page surfaces practical and work-focused; this is an operational tool, not a marketing site.
