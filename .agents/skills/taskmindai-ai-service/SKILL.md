---
name: taskmindai-ai-service
description: "TaskMindAI AI-service constraints. Use for future apps/ai FastAPI work, Ollama qwen2.5:3b integration, AI extraction suggestions, applicability-aware failure behavior, operational memory, RAG planning, and avoiding premature fine-tuning or autonomous agents."
---

# TaskMindAI AI Service

## Direction

- Future service lives in `apps/ai`.
- Use FastAPI when implementation begins.
- Use Ollama with `qwen2.5:3b` initially.
- Start with operational memory.
- Add RAG later.
- Do not fine-tune initially.

## AI Behavior Rules

- AI suggestions must be constrained by workflow rules and applicability context.
- Graceful rejection is a valid result.
- Do not hallucinate extraction for unrelated inputs.
- Store reasoning explanations when they teach future behavior.
- Treat human corrections as durable teaching data.

## Non-Goals

- No AGI framing.
- No autonomous agents.
- No generic chatbot behavior.
- No broad no-code workflow builder.
- No fine-tuning pipeline in MVP 0.

## Integration

- API owns product workflow and persistence.
- AI service may suggest extraction later, but human correction remains central.
- Keep contracts explicit and versionable through `libs/shared` or documented API schemas.
