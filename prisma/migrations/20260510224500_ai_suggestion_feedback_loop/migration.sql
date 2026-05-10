ALTER TYPE "FeedbackEventType" ADD VALUE IF NOT EXISTS 'AI_SUGGESTION_CREATED';
ALTER TYPE "FeedbackEventType" ADD VALUE IF NOT EXISTS 'AI_SUGGESTION_CONVERTED_TO_ANNOTATION';

CREATE TYPE "AiSuggestionStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'EDITED',
    'CONVERTED_TO_ANNOTATION'
);

CREATE TABLE "AiSuggestion" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "annotationId" TEXT,
    "fieldName" TEXT NOT NULL,
    "selectedText" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "status" "AiSuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "correctedFieldName" TEXT,
    "correctedSelectedText" TEXT,
    "correctedReasoning" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiSuggestion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AiSuggestion_workspaceId_createdAt_idx" ON "AiSuggestion"("workspaceId", "createdAt");
CREATE INDEX "AiSuggestion_documentId_createdAt_idx" ON "AiSuggestion"("documentId", "createdAt");
CREATE INDEX "AiSuggestion_status_createdAt_idx" ON "AiSuggestion"("status", "createdAt");

ALTER TABLE "AiSuggestion" ADD CONSTRAINT "AiSuggestion_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiSuggestion" ADD CONSTRAINT "AiSuggestion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiSuggestion" ADD CONSTRAINT "AiSuggestion_annotationId_fkey" FOREIGN KEY ("annotationId") REFERENCES "Annotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
