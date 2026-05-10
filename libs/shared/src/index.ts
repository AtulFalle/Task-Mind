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

export type UpdateAnnotationRequest = CreateAnnotationRequest;

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

export interface CreateOperationalRuleRequest {
  title: string;
  ruleText: string;
  category: RuleCategory;
}

export const FeedbackEventType = {
  ANNOTATION_CREATED: 'ANNOTATION_CREATED',
  ANNOTATION_UPDATED: 'ANNOTATION_UPDATED',
  ANNOTATION_DELETED: 'ANNOTATION_DELETED',
  RULE_CREATED: 'RULE_CREATED',
  RULE_DELETED: 'RULE_DELETED',
  DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
  TEXT_EXTRACTED: 'TEXT_EXTRACTED',
  CORRECTION_ADDED: 'CORRECTION_ADDED',
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
