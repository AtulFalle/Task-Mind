-- AlterEnum
ALTER TYPE "FeedbackEventType" ADD VALUE 'ANNOTATION_RULE_LINKED';
ALTER TYPE "FeedbackEventType" ADD VALUE 'ANNOTATION_RULE_UNLINKED';

-- CreateTable
CREATE TABLE "AnnotationRuleLink" (
    "id" TEXT NOT NULL,
    "annotationId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnnotationRuleLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnnotationRuleLink_annotationId_ruleId_key" ON "AnnotationRuleLink"("annotationId", "ruleId");

-- CreateIndex
CREATE INDEX "AnnotationRuleLink_workspaceId_createdAt_idx" ON "AnnotationRuleLink"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "AnnotationRuleLink_annotationId_createdAt_idx" ON "AnnotationRuleLink"("annotationId", "createdAt");

-- CreateIndex
CREATE INDEX "AnnotationRuleLink_ruleId_createdAt_idx" ON "AnnotationRuleLink"("ruleId", "createdAt");

-- AddForeignKey
ALTER TABLE "AnnotationRuleLink" ADD CONSTRAINT "AnnotationRuleLink_annotationId_fkey" FOREIGN KEY ("annotationId") REFERENCES "Annotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnotationRuleLink" ADD CONSTRAINT "AnnotationRuleLink_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "OperationalRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnotationRuleLink" ADD CONSTRAINT "AnnotationRuleLink_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
