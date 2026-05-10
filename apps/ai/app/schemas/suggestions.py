from typing import Any

from pydantic import BaseModel, Field

from app.models.suggestion import AnnotationSuggestion


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
