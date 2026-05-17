from typing import Any

from pydantic import BaseModel, Field

from app.models.suggestion import AnnotationSuggestion
from app.models.suggestion import DocumentTypeClassification
from app.models.suggestion import PlaygroundMessageClassification


class SuggestAnnotationsRequest(BaseModel):
    workspace: dict[str, Any] = Field(default_factory=dict)
    document: dict[str, Any] = Field(default_factory=dict)
    extracted_text: str = Field(alias="extractedText", default="")
    rules: list[dict[str, Any]] = Field(default_factory=list)
    existing_annotations: list[dict[str, Any]] = Field(
        alias="existingAnnotations",
        default_factory=list,
    )
    previous_ai_suggestions: list[dict[str, Any]] = Field(
        alias="previousAiSuggestions",
        default_factory=list,
    )

    model_config = {"populate_by_name": True}


class SuggestAnnotationsResponse(BaseModel):
    suggestions: list[AnnotationSuggestion] = Field(default_factory=list)

    model_config = {"populate_by_name": True}


class ClassifyDocumentTypeRequest(BaseModel):
    workspace: dict[str, Any] = Field(default_factory=dict)
    document: dict[str, Any] = Field(default_factory=dict)
    extracted_text: str = Field(alias="extractedText", default="")
    rules: list[dict[str, Any]] = Field(default_factory=list)
    previous_ai_suggestions: list[dict[str, Any]] = Field(
        alias="previousAiSuggestions",
        default_factory=list,
    )

    model_config = {"populate_by_name": True}


class ClassifyDocumentTypeResponse(BaseModel):
    classification: DocumentTypeClassification

    model_config = {"populate_by_name": True}


class DocumentClassificationContext(BaseModel):
    rules: list[dict[str, Any]] = Field(default_factory=list)
    applicability_rules: list[dict[str, Any]] = Field(
        alias="applicabilityRules",
        default_factory=list,
    )
    approved_examples: list[dict[str, Any]] = Field(
        alias="approvedExamples",
        default_factory=list,
    )
    corrected_examples: list[dict[str, Any]] = Field(
        alias="correctedExamples",
        default_factory=list,
    )
    rejected_examples: list[dict[str, Any]] = Field(
        alias="rejectedExamples",
        default_factory=list,
    )
    unknown_examples: list[dict[str, Any]] = Field(
        alias="unknownExamples",
        default_factory=list,
    )
    rejection_examples: list[dict[str, Any]] = Field(
        alias="rejectionExamples",
        default_factory=list,
    )
    classification_labels: list[str] = Field(
        alias="classificationLabels",
        default_factory=list,
    )
    known_document_types: list[str] = Field(
        alias="knownDocumentTypes",
        default_factory=list,
    )

    model_config = {"populate_by_name": True}


class SuggestDocumentClassificationRequest(BaseModel):
    document_text: str = Field(alias="documentText", default="")
    context: DocumentClassificationContext = Field(
        default_factory=DocumentClassificationContext,
    )

    model_config = {"populate_by_name": True}


class SuggestDocumentClassificationResponse(DocumentTypeClassification):
    pass


class PlaygroundContext(BaseModel):
    rules: list[dict[str, Any]] = Field(default_factory=list)
    approved_examples: list[dict[str, Any]] = Field(
        alias="approvedExamples",
        default_factory=list,
    )
    corrected_examples: list[dict[str, Any]] = Field(
        alias="correctedExamples",
        default_factory=list,
    )
    rejected_examples: list[dict[str, Any]] = Field(
        alias="rejectedExamples",
        default_factory=list,
    )
    allowed_intents: list[str] = Field(
        alias="allowedIntents",
        default_factory=list,
    )
    allowed_priorities: list[str] = Field(
        alias="allowedPriorities",
        default_factory=list,
    )

    model_config = {"populate_by_name": True}


class ClassifyMessageIntentRequest(BaseModel):
    input_text: str = Field(alias="inputText", min_length=1)
    context: PlaygroundContext = Field(default_factory=PlaygroundContext)

    model_config = {"populate_by_name": True}


class ClassifyMessageIntentResponse(PlaygroundMessageClassification):
    pass
