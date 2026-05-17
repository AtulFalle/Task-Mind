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

export interface WorkspaceValidationMetrics {
  workspaceId: string;
  totalSuggestions: number;
  approvedSuggestions: number;
  rejectedSuggestions: number;
  editedSuggestions: number;
  convertedToAnnotations: number;
  unknownPredictions: number;
  unknownCorrections: number;
  forcedClassificationErrors: number;
  approvalRate: number;
  correctionRate: number;
  rejectionRate: number;
  applicabilityRejectionRate: number;
  totalAnnotations: number;
  totalRules: number;
  totalTrainingCandidates: number;
}

export interface WorkspaceValidationReadiness {
  hasDocuments: boolean;
  hasRules: boolean;
  hasAiSuggestions: boolean;
  hasHumanFeedback: boolean;
  aiServiceReachable: boolean;
  latestContextStats: AiContextStats;
}

export const PlaygroundIntent = {
  BILLING: 'BILLING',
  TECHNICAL_ISSUE: 'TECHNICAL_ISSUE',
  CANCELLATION: 'CANCELLATION',
  SALES_INQUIRY: 'SALES_INQUIRY',
  GENERAL_SUPPORT: 'GENERAL_SUPPORT',
  UNKNOWN: 'UNKNOWN',
} as const;

export type PlaygroundIntent =
  (typeof PlaygroundIntent)[keyof typeof PlaygroundIntent];

export const PlaygroundPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export type PlaygroundPriority =
  (typeof PlaygroundPriority)[keyof typeof PlaygroundPriority];

export const PlaygroundExampleStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  CORRECTED: 'CORRECTED',
  REJECTED: 'REJECTED',
} as const;

export type PlaygroundExampleStatus =
  (typeof PlaygroundExampleStatus)[keyof typeof PlaygroundExampleStatus];

export interface PlaygroundExample {
  id: string;
  workspaceId: string;
  inputText: string;
  predictedIntent: PlaygroundIntent;
  predictedPriority: PlaygroundPriority;
  predictedReasoning: string;
  predictedConfidence: number;
  finalIntent?: PlaygroundIntent;
  finalPriority?: PlaygroundPriority;
  correctionReason?: string;
  status: PlaygroundExampleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PlaygroundClassificationRequest {
  inputText: string;
}

export interface PlaygroundClassificationResponse {
  exampleId: string;
  intent: PlaygroundIntent;
  priority: PlaygroundPriority;
  reasoning: string;
  confidence: number;
  contextStats: AiContextStats;
}

export interface PlaygroundCorrectionRequest {
  finalIntent: PlaygroundIntent;
  finalPriority: PlaygroundPriority;
  correctionReason: string;
}

export interface PlaygroundMetrics {
  workspaceId: string;
  totalPredictions: number;
  approved: number;
  corrected: number;
  correctionRate: number;
}

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

export const DocumentType = {
  INVOICE: 'INVOICE',
  RESUME: 'RESUME',
  BANK_STATEMENT: 'BANK_STATEMENT',
  SUPPORT_EMAIL: 'SUPPORT_EMAIL',
  UNKNOWN: 'UNKNOWN',
} as const;

export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

export const SuggestionMode = {
  EXTRACTION: 'EXTRACTION',
  DOCUMENT_CLASSIFICATION: 'DOCUMENT_CLASSIFICATION',
} as const;

export type SuggestionMode =
  (typeof SuggestionMode)[keyof typeof SuggestionMode];

export interface AiAnnotationSuggestion {
  fieldName: string;
  selectedText: string;
  reasoning: string;
  confidence: number;
}

export interface DocumentTypeClassification {
  documentType: DocumentType;
  reasoning: string;
  confidence: number;
  applicability?: ApplicabilityResult;
}

export interface ApplicabilityResult {
  isApplicable: boolean;
  matchedSignals: string[];
  missingSignals: string[];
}

export interface DocumentClassificationRuleContext {
  id: string;
  title: string;
  ruleText: string;
  category: RuleCategory;
  source: RuleSource;
  confidence: number;
}

export interface DocumentClassificationExample {
  source: 'AI_SUGGESTION' | 'VALIDATION_RUN';
  documentId?: string;
  documentName?: string;
  documentExcerpt?: string;
  predictedLabel?: DocumentType;
  approvedLabel?: DocumentType;
  correctedLabel?: DocumentType;
  rejectedLabel?: DocumentType;
  expectedLabel?: DocumentType;
  finalLabel?: DocumentType;
  reasoning?: string;
  correctionReasoning?: string;
  confidence?: number;
  createdAt: string;
}

export interface DocumentClassificationContext {
  rules: DocumentClassificationRuleContext[];
  applicabilityRules: DocumentClassificationRuleContext[];
  approvedExamples: DocumentClassificationExample[];
  correctedExamples: DocumentClassificationExample[];
  rejectedExamples: DocumentClassificationExample[];
  unknownExamples: DocumentClassificationExample[];
  rejectionExamples: DocumentClassificationExample[];
  classificationLabels: DocumentType[];
  knownDocumentTypes: DocumentType[];
}

export interface AiContextStats {
  rulesUsed: number;
  approvedExamplesUsed: number;
  correctedExamplesUsed: number;
  rejectedExamplesUsed: number;
  applicabilityRulesUsed?: number;
  unknownExamplesUsed?: number;
  rejectionExamplesUsed?: number;
}

export interface DocumentTypeValidationSample {
  id: string;
  title: string;
  text: string;
  expectedType: DocumentType;
  reason: string;
}

export interface DocumentTypeValidationSamplesResponse {
  samples: DocumentTypeValidationSample[];
}

export const ValidationRunMode = {
  DOCUMENT_CLASSIFICATION: 'DOCUMENT_CLASSIFICATION',
} as const;

export type ValidationRunMode =
  (typeof ValidationRunMode)[keyof typeof ValidationRunMode];

export const ValidationRunStatus = {
  DRAFT: 'DRAFT',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type ValidationRunStatus =
  (typeof ValidationRunStatus)[keyof typeof ValidationRunStatus];

export const ValidationRunItemStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EDITED: 'EDITED',
} as const;

export type ValidationRunItemStatus =
  (typeof ValidationRunItemStatus)[keyof typeof ValidationRunItemStatus];

export interface ValidationRunItem {
  id: string;
  validationRunId: string;
  documentId?: string;
  aiSuggestionId?: string;
  expectedLabel?: string;
  predictedLabel?: string;
  finalLabel?: string;
  status: ValidationRunItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ValidationRun {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  mode: ValidationRunMode;
  status: ValidationRunStatus;
  totalItems: number;
  approvedCount: number;
  rejectedCount: number;
  editedCount: number;
  correctionRate: number;
  approvalRate: number;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  items?: ValidationRunItem[];
}

export interface CreateValidationRunRequest {
  name: string;
  description?: string;
  mode: ValidationRunMode;
}

export interface AddValidationRunItemRequest {
  documentId?: string;
  aiSuggestionId?: string;
  expectedLabel?: string;
  predictedLabel?: string;
  finalLabel?: string;
  status: ValidationRunItemStatus;
}

export interface AiAnnotationSuggestionsResponse {
  suggestions: AiSuggestion[];
  contextStats?: AiContextStats;
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
  mode: SuggestionMode;
  payloadJson: Record<string, unknown>;
  status: AiSuggestionStatus;
  correctedFieldName?: string;
  correctedSelectedText?: string;
  correctedReasoning?: string;
  correctedPayloadJson?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AiSuggestionRequest {
  mode?: SuggestionMode;
}

export interface UpdateAiSuggestionRequest {
  correctedFieldName?: string;
  correctedSelectedText?: string;
  correctedReasoning?: string;
  correctedDocumentType?: DocumentType;
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
  VALIDATION_RUN_CREATED: 'VALIDATION_RUN_CREATED',
  VALIDATION_RUN_COMPLETED: 'VALIDATION_RUN_COMPLETED',
  PLAYGROUND_EXAMPLE_CREATED: 'PLAYGROUND_EXAMPLE_CREATED',
  PLAYGROUND_EXAMPLE_APPROVED: 'PLAYGROUND_EXAMPLE_APPROVED',
  PLAYGROUND_EXAMPLE_CORRECTED: 'PLAYGROUND_EXAMPLE_CORRECTED',
  PLAYGROUND_EXAMPLE_REJECTED: 'PLAYGROUND_EXAMPLE_REJECTED',
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
