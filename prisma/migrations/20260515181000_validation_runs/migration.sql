ALTER TYPE "FeedbackEventType" ADD VALUE 'VALIDATION_RUN_CREATED';
ALTER TYPE "FeedbackEventType" ADD VALUE 'VALIDATION_RUN_COMPLETED';

CREATE TYPE "ValidationRunMode" AS ENUM (
    'DOCUMENT_CLASSIFICATION'
);

CREATE TYPE "ValidationRunStatus" AS ENUM (
    'DRAFT',
    'RUNNING',
    'COMPLETED',
    'CANCELLED'
);

CREATE TYPE "ValidationRunItemStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'EDITED'
);

CREATE TABLE "ValidationRun" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "mode" "ValidationRunMode" NOT NULL,
    "status" "ValidationRunStatus" NOT NULL DEFAULT 'DRAFT',
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "approvedCount" INTEGER NOT NULL DEFAULT 0,
    "rejectedCount" INTEGER NOT NULL DEFAULT 0,
    "editedCount" INTEGER NOT NULL DEFAULT 0,
    "correctionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "approvalRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ValidationRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ValidationRunItem" (
    "id" TEXT NOT NULL,
    "validationRunId" TEXT NOT NULL,
    "documentId" TEXT,
    "aiSuggestionId" TEXT,
    "expectedLabel" TEXT,
    "predictedLabel" TEXT,
    "finalLabel" TEXT,
    "status" "ValidationRunItemStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ValidationRunItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ValidationRun_workspaceId_createdAt_idx" ON "ValidationRun"("workspaceId", "createdAt");
CREATE INDEX "ValidationRun_status_createdAt_idx" ON "ValidationRun"("status", "createdAt");
CREATE INDEX "ValidationRunItem_validationRunId_createdAt_idx" ON "ValidationRunItem"("validationRunId", "createdAt");
CREATE INDEX "ValidationRunItem_documentId_createdAt_idx" ON "ValidationRunItem"("documentId", "createdAt");
CREATE INDEX "ValidationRunItem_aiSuggestionId_createdAt_idx" ON "ValidationRunItem"("aiSuggestionId", "createdAt");
CREATE INDEX "ValidationRunItem_status_createdAt_idx" ON "ValidationRunItem"("status", "createdAt");

ALTER TABLE "ValidationRun" ADD CONSTRAINT "ValidationRun_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ValidationRunItem" ADD CONSTRAINT "ValidationRunItem_validationRunId_fkey" FOREIGN KEY ("validationRunId") REFERENCES "ValidationRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ValidationRunItem" ADD CONSTRAINT "ValidationRunItem_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ValidationRunItem" ADD CONSTRAINT "ValidationRunItem_aiSuggestionId_fkey" FOREIGN KEY ("aiSuggestionId") REFERENCES "AiSuggestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
