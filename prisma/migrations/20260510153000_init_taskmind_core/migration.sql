-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "StudioType" AS ENUM ('DOCUMENT');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('UPLOADED', 'PARSING_PENDING', 'PARSED', 'FAILED');

-- CreateEnum
CREATE TYPE "ExtractedTextStatus" AS ENUM ('NOT_STARTED', 'PROCESSING', 'COMPLETED', 'FAILED', 'UNSUPPORTED');

-- CreateEnum
CREATE TYPE "RuleCategory" AS ENUM ('EXTRACTION', 'APPLICABILITY', 'FORMAT', 'VALIDATION', 'OTHER');

-- CreateEnum
CREATE TYPE "RuleSource" AS ENUM ('HUMAN', 'AI_SUGGESTED', 'SYSTEM');

-- CreateEnum
CREATE TYPE "FeedbackEventType" AS ENUM ('ANNOTATION_CREATED', 'ANNOTATION_UPDATED', 'ANNOTATION_DELETED', 'RULE_CREATED', 'DOCUMENT_UPLOADED', 'TEXT_EXTRACTED', 'CORRECTION_ADDED');

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "studioType" "StudioType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL,
    "extractedText" TEXT,
    "extractedTextStatus" "ExtractedTextStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "extractionError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Annotation" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "selectedText" TEXT NOT NULL,
    "explanation" TEXT,
    "startOffset" INTEGER,
    "endOffset" INTEGER,
    "contextBefore" TEXT,
    "contextAfter" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Annotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationalRule" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "ruleText" TEXT NOT NULL,
    "category" "RuleCategory" NOT NULL,
    "source" "RuleSource" NOT NULL DEFAULT 'HUMAN',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationalRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackEvent" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "documentId" TEXT,
    "annotationId" TEXT,
    "eventType" "FeedbackEventType" NOT NULL,
    "payloadJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Workspace_createdAt_idx" ON "Workspace"("createdAt");

-- CreateIndex
CREATE INDEX "Document_workspaceId_createdAt_idx" ON "Document"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "Annotation_workspaceId_createdAt_idx" ON "Annotation"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "Annotation_documentId_createdAt_idx" ON "Annotation"("documentId", "createdAt");

-- CreateIndex
CREATE INDEX "OperationalRule_workspaceId_createdAt_idx" ON "OperationalRule"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "FeedbackEvent_workspaceId_createdAt_idx" ON "FeedbackEvent"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "FeedbackEvent_documentId_createdAt_idx" ON "FeedbackEvent"("documentId", "createdAt");

-- CreateIndex
CREATE INDEX "FeedbackEvent_annotationId_createdAt_idx" ON "FeedbackEvent"("annotationId", "createdAt");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Annotation" ADD CONSTRAINT "Annotation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Annotation" ADD CONSTRAINT "Annotation_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationalRule" ADD CONSTRAINT "OperationalRule_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackEvent" ADD CONSTRAINT "FeedbackEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackEvent" ADD CONSTRAINT "FeedbackEvent_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackEvent" ADD CONSTRAINT "FeedbackEvent_annotationId_fkey" FOREIGN KEY ("annotationId") REFERENCES "Annotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
