from enum import Enum

from pydantic import BaseModel, Field, field_validator


class DocumentType(str, Enum):
    INVOICE = "INVOICE"
    RESUME = "RESUME"
    BANK_STATEMENT = "BANK_STATEMENT"
    SUPPORT_EMAIL = "SUPPORT_EMAIL"
    UNKNOWN = "UNKNOWN"


class PlaygroundIntent(str, Enum):
    BILLING = "BILLING"
    TECHNICAL_ISSUE = "TECHNICAL_ISSUE"
    CANCELLATION = "CANCELLATION"
    SALES_INQUIRY = "SALES_INQUIRY"
    GENERAL_SUPPORT = "GENERAL_SUPPORT"
    UNKNOWN = "UNKNOWN"


class PlaygroundPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


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


class ApplicabilityResult(BaseModel):
    is_applicable: bool = Field(alias="isApplicable")
    matched_signals: list[str] = Field(alias="matchedSignals", default_factory=list)
    missing_signals: list[str] = Field(alias="missingSignals", default_factory=list)

    @field_validator("matched_signals", "missing_signals")
    @classmethod
    def trim_signals(cls, value: list[str]) -> list[str]:
        return [signal.strip() for signal in value if signal.strip()]

    model_config = {"populate_by_name": True}


class DocumentTypeClassification(BaseModel):
    document_type: DocumentType = Field(alias="documentType")
    reasoning: str = Field(min_length=1)
    confidence: float = Field(ge=0, le=1)
    applicability: ApplicabilityResult | None = None

    @field_validator("reasoning")
    @classmethod
    def trim_reasoning(cls, value: str) -> str:
        return value.strip()

    model_config = {"populate_by_name": True}


class PlaygroundMessageClassification(BaseModel):
    intent: PlaygroundIntent
    priority: PlaygroundPriority
    reasoning: str = Field(min_length=1)
    confidence: float = Field(ge=0, le=1)

    @field_validator("reasoning")
    @classmethod
    def trim_reasoning(cls, value: str) -> str:
        return value.strip()

    model_config = {"populate_by_name": True}
