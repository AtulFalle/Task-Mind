export const StudioType = {
  DOCUMENT: 'DOCUMENT',
} as const;

export type StudioType = (typeof StudioType)[keyof typeof StudioType];

export const DocumentStatus = {
  UPLOADED: 'UPLOADED',
  PARSING_PENDING: 'PARSING_PENDING',
  PARSED: 'PARSED',
  FAILED: 'FAILED',
} as const;

export type DocumentStatus =
  (typeof DocumentStatus)[keyof typeof DocumentStatus];

export const ExtractedTextStatus = {
  NOT_STARTED: 'NOT_STARTED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  UNSUPPORTED: 'UNSUPPORTED',
} as const;

export type ExtractedTextStatus =
  (typeof ExtractedTextStatus)[keyof typeof ExtractedTextStatus];

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  studioType: StudioType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  studioType: StudioType;
}

export type UpdateWorkspaceRequest = CreateWorkspaceRequest;

export interface Document {
  id: string;
  workspaceId: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  filePath: string;
  status: DocumentStatus;
  extractedText: string | null;
  extractedTextStatus: ExtractedTextStatus;
  extractionError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentTextResponse {
  documentId: string;
  status: ExtractedTextStatus;
  text: string | null;
  error?: string;
}

export interface Annotation {
  id: string;
  documentId: string;
  workspaceId: string;
  fieldName: string;
  selectedText: string;
  explanation?: string;
  startOffset?: number;
  endOffset?: number;
  contextBefore?: string;
  contextAfter?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnotationRequest {
  fieldName: string;
  selectedText: string;
  explanation?: string;
  startOffset?: number;
  endOffset?: number;
}

export interface UpdateAnnotationRequest {
  fieldName: string;
  explanation?: string;
}

export const RuleCategory = {
  EXTRACTION: 'EXTRACTION',
  APPLICABILITY: 'APPLICABILITY',
  FORMAT: 'FORMAT',
  VALIDATION: 'VALIDATION',
  OTHER: 'OTHER',
} as const;

export type RuleCategory = (typeof RuleCategory)[keyof typeof RuleCategory];

export const RuleSource = {
  HUMAN: 'HUMAN',
  AI_SUGGESTED: 'AI_SUGGESTED',
  SYSTEM: 'SYSTEM',
} as const;

export type RuleSource = (typeof RuleSource)[keyof typeof RuleSource];

export interface OperationalRule {
  id: string;
  workspaceId: string;
  title: string;
  ruleText: string;
  category: RuleCategory;
  source: RuleSource;
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnnotationRuleLink {
  id: string;
  annotationId: string;
  ruleId: string;
  workspaceId: string;
  createdAt: string;
}

export interface LinkedOperationalRule extends OperationalRule {
  linkId: string;
  linkedAt: string;
}

export interface CreateOperationalRuleRequest {
  title: string;
  ruleText: string;
  category: RuleCategory;
}

export const TrainingCandidateType = {
  EXTRACTION: 'EXTRACTION',
  APPLICABILITY_REJECTION: 'APPLICABILITY_REJECTION',
  FORMAT_CORRECTION: 'FORMAT_CORRECTION',
  VALIDATION_RULE: 'VALIDATION_RULE',
  OTHER: 'OTHER',
} as const;

export type TrainingCandidateType =
  (typeof TrainingCandidateType)[keyof typeof TrainingCandidateType];

export const TrainingCandidateStatus = {
  DRAFT: 'DRAFT',
  REVIEWED: 'REVIEWED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type TrainingCandidateStatus =
  (typeof TrainingCandidateStatus)[keyof typeof TrainingCandidateStatus];

export interface TrainingCandidate {
  id: string;
  workspaceId: string;
  documentId?: string;
  annotationId?: string;
  candidateType: TrainingCandidateType;
  inputText: string;
  expectedOutput: Record<string, unknown>;
  instruction: string;
  reasoning?: string;
  status: TrainingCandidateStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrainingCandidateRequest {
  documentId?: string;
  annotationId?: string;
  candidateType: TrainingCandidateType;
  inputText: string;
  expectedOutput: Record<string, unknown>;
  instruction: string;
  reasoning?: string;
  status?: TrainingCandidateStatus;
}

export interface UpdateTrainingCandidateRequest {
  candidateType?: TrainingCandidateType;
  inputText?: string;
  expectedOutput?: Record<string, unknown>;
  instruction?: string;
  reasoning?: string;
  status?: TrainingCandidateStatus;
}

export interface AiAnnotationSuggestion {
  fieldName: string;
  selectedText: string;
  reasoning: string;
  confidence: number;
}

export interface AiAnnotationSuggestionsResponse {
  suggestions: AiSuggestion[];
}

export const AiSuggestionStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EDITED: 'EDITED',
  CONVERTED_TO_ANNOTATION: 'CONVERTED_TO_ANNOTATION',
} as const;

export type AiSuggestionStatus =
  (typeof AiSuggestionStatus)[keyof typeof AiSuggestionStatus];

export interface AiSuggestion extends AiAnnotationSuggestion {
  id: string;
  workspaceId: string;
  documentId: string;
  annotationId?: string;
  status: AiSuggestionStatus;
  correctedFieldName?: string;
  correctedSelectedText?: string;
  correctedReasoning?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAiSuggestionRequest {
  correctedFieldName: string;
  correctedSelectedText: string;
  correctedReasoning: string;
}

export interface RejectAiSuggestionRequest {
  reason?: string;
}

export const FeedbackEventType = {
  ANNOTATION_CREATED: 'ANNOTATION_CREATED',
  ANNOTATION_UPDATED: 'ANNOTATION_UPDATED',
  ANNOTATION_DELETED: 'ANNOTATION_DELETED',
  ANNOTATION_RULE_LINKED: 'ANNOTATION_RULE_LINKED',
  ANNOTATION_RULE_UNLINKED: 'ANNOTATION_RULE_UNLINKED',
  RULE_CREATED: 'RULE_CREATED',
  RULE_DELETED: 'RULE_DELETED',
  DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
  TEXT_EXTRACTED: 'TEXT_EXTRACTED',
  CORRECTION_ADDED: 'CORRECTION_ADDED',
  TRAINING_CANDIDATE_CREATED: 'TRAINING_CANDIDATE_CREATED',
  TRAINING_CANDIDATE_APPROVED: 'TRAINING_CANDIDATE_APPROVED',
  TRAINING_CANDIDATE_REJECTED: 'TRAINING_CANDIDATE_REJECTED',
  AI_SUGGESTION_CREATED: 'AI_SUGGESTION_CREATED',
  AI_SUGGESTION_APPROVED: 'AI_SUGGESTION_APPROVED',
  AI_SUGGESTION_REJECTED: 'AI_SUGGESTION_REJECTED',
  AI_SUGGESTION_EDITED: 'AI_SUGGESTION_EDITED',
  AI_SUGGESTION_CONVERTED_TO_ANNOTATION:
    'AI_SUGGESTION_CONVERTED_TO_ANNOTATION',
} as const;

export type FeedbackEventType =
  (typeof FeedbackEventType)[keyof typeof FeedbackEventType];

export interface FeedbackEvent {
  id: string;
  workspaceId: string;
  documentId?: string;
  annotationId?: string;
  eventType: FeedbackEventType;
  payloadJson: Record<string, unknown>;
  createdAt: string;
}
