CREATE TYPE "SuggestionMode" AS ENUM (
    'EXTRACTION',
    'DOCUMENT_CLASSIFICATION'
);

ALTER TABLE "AiSuggestion"
ADD COLUMN "mode" "SuggestionMode" NOT NULL DEFAULT 'EXTRACTION',
ADD COLUMN "payloadJson" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN "correctedPayloadJson" JSONB;

CREATE INDEX "AiSuggestion_mode_createdAt_idx" ON "AiSuggestion"("mode", "createdAt");
