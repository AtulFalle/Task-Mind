---
name: taskmindai-product
description: "TaskMindAI product and MVP constraints. Use for Document Studio workflows, teaching memory, annotations, operational rules, human corrections, applicability awareness, extraction failure behavior, product architecture, and deciding whether a requested feature belongs in MVP 0."
---

# TaskMindAI Product

TaskMindAI is a collaborative AI teaching and specialization platform. Humans teach operational workflows through interaction, annotations, corrections, rules, constraints, and reasoning explanations.

## Scope

- Build MVP 0: Document Studio only.
- Focus on workspace, documents, parsed text, highlights/selections, annotations, operational rules, corrections, and teaching memory.
- Keep AI behavior constrained, explainable, and applicability-aware.
- Reject generic chatbot, autonomous agent, AGI, no-code platform, and broad automation patterns.

## Product Workflow

1. Create workspace.
2. Upload document.
3. Parse text.
4. Highlight/select text.
5. Create annotations.
6. Define operational rules.
7. AI suggests extraction later.
8. Human corrects AI.
9. Store corrections as teaching memory.

## Applicability Awareness

- Store when a workflow should apply.
- Store when it should not apply.
- Model graceful rejection as a first-class outcome.
- Never hallucinate extraction for unrelated documents.

## MVP 0 Non-Goals

- No auth.
- No OCR.
- No RAG.
- No fine-tuning.
- No autonomous agents.
- No websocket architecture.
- No Kubernetes or distributed systems.
- No microservice split beyond planning for future `apps/ai`.
