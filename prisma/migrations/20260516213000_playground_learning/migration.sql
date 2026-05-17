ALTER TYPE "FeedbackEventType" ADD VALUE 'PLAYGROUND_EXAMPLE_CREATED';
ALTER TYPE "FeedbackEventType" ADD VALUE 'PLAYGROUND_EXAMPLE_APPROVED';
ALTER TYPE "FeedbackEventType" ADD VALUE 'PLAYGROUND_EXAMPLE_CORRECTED';
ALTER TYPE "FeedbackEventType" ADD VALUE 'PLAYGROUND_EXAMPLE_REJECTED';

CREATE TYPE "PlaygroundIntent" AS ENUM (
    'BILLING',
    'TECHNICAL_ISSUE',
    'CANCELLATION',
    'SALES_INQUIRY',
    'GENERAL_SUPPORT',
    'UNKNOWN'
);

CREATE TYPE "PlaygroundPriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH'
);

CREATE TYPE "PlaygroundExampleStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'CORRECTED',
    'REJECTED'
);

CREATE TABLE "PlaygroundExample" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "inputText" TEXT NOT NULL,
    "predictedIntent" "PlaygroundIntent" NOT NULL,
    "predictedPriority" "PlaygroundPriority" NOT NULL,
    "predictedReasoning" TEXT NOT NULL,
    "predictedConfidence" DOUBLE PRECISION NOT NULL,
    "finalIntent" "PlaygroundIntent",
    "finalPriority" "PlaygroundPriority",
    "correctionReason" TEXT,
    "status" "PlaygroundExampleStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlaygroundExample_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PlaygroundExample_workspaceId_createdAt_idx" ON "PlaygroundExample"("workspaceId", "createdAt");
CREATE INDEX "PlaygroundExample_workspaceId_status_updatedAt_idx" ON "PlaygroundExample"("workspaceId", "status", "updatedAt");
CREATE INDEX "PlaygroundExample_status_createdAt_idx" ON "PlaygroundExample"("status", "createdAt");

ALTER TABLE "PlaygroundExample" ADD CONSTRAINT "PlaygroundExample_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
