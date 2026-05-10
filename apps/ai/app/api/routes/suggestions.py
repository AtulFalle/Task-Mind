from fastapi import APIRouter, HTTPException

from app.schemas.suggestions import (
    SuggestAnnotationsRequest,
    SuggestAnnotationsResponse,
)
from app.services.ollama_service import OllamaService, OllamaServiceError
from app.services.prompt_builder import build_annotation_prompt

router = APIRouter(tags=["suggestions"])
ollama_service = OllamaService()


@router.post("/suggest-annotations", response_model=SuggestAnnotationsResponse)
async def suggest_annotations(
    request: SuggestAnnotationsRequest,
) -> SuggestAnnotationsResponse:
    prompt = build_annotation_prompt(request)

    try:
        return await ollama_service.suggest_annotations(prompt)
    except OllamaServiceError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
