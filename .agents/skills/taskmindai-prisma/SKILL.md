---
name: taskmindai-prisma
description: "TaskMindAI Prisma and PostgreSQL conventions. Use for schema design, migrations, seeds, teaching memory persistence, annotations, corrections, operational rules, applicability decisions, and future dataset export readiness."
---

# TaskMindAI Prisma

## Persistence Priorities

- Preserve teaching memory.
- Preserve human corrections.
- Preserve operational rules.
- Preserve applicability decisions.
- Keep data future-ready for dataset materialization and export.

## Core Entities

- Workspace.
- Document.
- ParsedDocumentText.
- TextSelection or TextRange.
- Annotation.
- OperationalRule.
- ExtractionSuggestion.
- HumanCorrection.
- TeachingMemoryItem.
- ApplicabilityDecision.

## Schema Rules

- Use clear relation names and explicit timestamps.
- Store enough context to understand why a correction or rule exists.
- Model graceful rejection/failure outcomes, not only successful extraction.
- Keep document text and annotations linked by stable offsets/ranges.
- Add indexes for workspace, document, and created-at lookup paths.

## Migration Rules

- Treat migrations as append-only once shared.
- Avoid destructive changes to teaching memory data.
- Check generated SQL before applying risky migrations.
- Add seeds only for local development reference data.
