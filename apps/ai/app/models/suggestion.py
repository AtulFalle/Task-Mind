from pydantic import BaseModel, Field, field_validator


class AnnotationSuggestion(BaseModel):
    field_name: str = Field(alias="fieldName", min_length=1, max_length=80)
    selected_text: str = Field(alias="selectedText", min_length=1)
    reasoning: str = Field(min_length=1)
    confidence: float = Field(ge=0, le=1)

    @field_validator("field_name", "selected_text", "reasoning")
    @classmethod
    def trim_text(cls, value: str) -> str:
        return value.strip()

    model_config = {"populate_by_name": True}
