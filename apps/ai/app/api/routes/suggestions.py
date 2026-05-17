import logging
import os

from fastapi import APIRouter, HTTPException

from app.schemas.suggestions import (
    ClassifyMessageIntentRequest,
    ClassifyMessageIntentResponse,
    ClassifyDocumentTypeRequest,
    ClassifyDocumentTypeResponse,
    SuggestAnnotationsRequest,
    SuggestAnnotationsResponse,
    SuggestDocumentClassificationRequest,
    SuggestDocumentClassificationResponse,
)
from app.services.ollama_service import OllamaService, OllamaServiceError
from app.services.prompt_builder import (
    build_annotation_prompt,
    build_document_classification_prompt,
    build_document_type_prompt,
    build_message_intent_prompt,
)

router = APIRouter(tags=["suggestions"])
ollama_service = OllamaService()
logger = logging.getLogger(__name__)


@router.post("/suggest-annotations", response_model=SuggestAnnotationsResponse)
async def suggest_annotations(
    request: SuggestAnnotationsRequest,
) -> SuggestAnnotationsResponse:
    prompt = build_annotation_prompt(request)

    try:
        return await ollama_service.suggest_annotations(prompt)
    except OllamaServiceError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error


@router.post("/classify-document-type", response_model=ClassifyDocumentTypeResponse)
async def classify_document_type(
    request: ClassifyDocumentTypeRequest,
) -> ClassifyDocumentTypeResponse:
    prompt = build_document_type_prompt(request)

    try:
        return await ollama_service.classify_document_type(prompt)
    except OllamaServiceError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error


@router.post(
    "/suggest-document-classification",
    response_model=SuggestDocumentClassificationResponse,
)
async def suggest_document_classification(
    request: SuggestDocumentClassificationRequest,
) -> SuggestDocumentClassificationResponse:
    prompt = build_document_classification_prompt(request)
    log_document_classification_prompt_summary(request)

    try:
        return await ollama_service.suggest_document_classification(prompt)
    except OllamaServiceError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error


@router.post(
    "/classify-message-intent",
    response_model=ClassifyMessageIntentResponse,
)
async def classify_message_intent(
    request: ClassifyMessageIntentRequest,
) -> ClassifyMessageIntentResponse:
    prompt = build_message_intent_prompt(request)

    try:
        return await ollama_service.classify_message_intent(prompt)
    except OllamaServiceError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error


def log_document_classification_prompt_summary(
    request: SuggestDocumentClassificationRequest,
) -> None:
    if os.getenv("ENVIRONMENT") != "development":
        return

    logger.info(
        "document classification prompt context",
        extra={
            "document_text_chars": min(len(request.document_text), 4000),
            "rules_used": len(request.context.rules),
            "applicability_rules_used": len(request.context.applicability_rules),
            "approved_examples_used": len(request.context.approved_examples),
            "corrected_examples_used": len(request.context.corrected_examples),
            "rejected_examples_used": len(request.context.rejected_examples),
            "unknown_examples_used": len(request.context.unknown_examples),
            "rejection_examples_used": len(request.context.rejection_examples),
            "classification_labels": request.context.classification_labels,
        },
    )
