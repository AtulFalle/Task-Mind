-- CreateEnum
CREATE TYPE "TrainingCandidateType" AS ENUM ('EXTRACTION', 'APPLICABILITY_REJECTION', 'FORMAT_CORRECTION', 'VALIDATION_RULE', 'OTHER');

-- CreateEnum
CREATE TYPE "TrainingCandidateStatus" AS ENUM ('DRAFT', 'REVIEWED', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "FeedbackEventType" ADD VALUE 'TRAINING_CANDIDATE_CREATED';
ALTER TYPE "FeedbackEventType" ADD VALUE 'TRAINING_CANDIDATE_APPROVED';
ALTER TYPE "FeedbackEventType" ADD VALUE 'TRAINING_CANDIDATE_REJECTED';

-- CreateTable
CREATE TABLE "TrainingCandidate" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "documentId" TEXT,
    "annotationId" TEXT,
    "candidateType" "TrainingCandidateType" NOT NULL,
    "inputText" TEXT NOT NULL,
    "expectedOutput" JSONB NOT NULL,
    "instruction" TEXT NOT NULL,
    "reasoning" TEXT,
    "status" "TrainingCandidateStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainingCandidate_workspaceId_createdAt_idx" ON "TrainingCandidate"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "TrainingCandidate_documentId_createdAt_idx" ON "TrainingCandidate"("documentId", "createdAt");

-- CreateIndex
CREATE INDEX "TrainingCandidate_annotationId_createdAt_idx" ON "TrainingCandidate"("annotationId", "createdAt");

-- CreateIndex
CREATE INDEX "TrainingCandidate_status_createdAt_idx" ON "TrainingCandidate"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "TrainingCandidate" ADD CONSTRAINT "TrainingCandidate_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingCandidate" ADD CONSTRAINT "TrainingCandidate_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingCandidate" ADD CONSTRAINT "TrainingCandidate_annotationId_fkey" FOREIGN KEY ("annotationId") REFERENCES "Annotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
