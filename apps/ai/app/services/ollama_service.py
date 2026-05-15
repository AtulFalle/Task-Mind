import json
import os
import re
from typing import Any

import httpx
from pydantic import ValidationError

from app.models.suggestion import DocumentType, DocumentTypeClassification
from app.schemas.suggestions import (
    ClassifyDocumentTypeResponse,
    SuggestAnnotationsResponse,
    SuggestDocumentClassificationResponse,
)


class OllamaServiceError(RuntimeError):
    pass


class OllamaService:
    def __init__(self) -> None:
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
        self.model = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")
        self.timeout_seconds = float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "4500"))

    async def suggest_annotations(self, prompt: str) -> SuggestAnnotationsResponse:
        parsed = await self._generate_json(prompt, {"suggestions": []})

        try:
            return SuggestAnnotationsResponse.model_validate(parsed)
        except ValidationError:
            return SuggestAnnotationsResponse(suggestions=[])

    async def classify_document_type(
        self,
        prompt: str,
    ) -> ClassifyDocumentTypeResponse:
        fallback = {
            "classification": {
                "documentType": DocumentType.UNKNOWN.value,
                "reasoning": "The model did not return a valid classification.",
                "confidence": 0,
                "applicability": {
                    "isApplicable": False,
                    "matchedSignals": [],
                    "missingSignals": ["valid model classification"],
                },
            },
        }
        parsed = await self._generate_json(prompt, fallback)

        try:
            return ClassifyDocumentTypeResponse.model_validate(parsed)
        except ValidationError:
            return ClassifyDocumentTypeResponse(
                classification=DocumentTypeClassification(
                    documentType=DocumentType.UNKNOWN,
                    reasoning="The model did not return a valid classification.",
                    confidence=0,
                    applicability={
                        "isApplicable": False,
                        "matchedSignals": [],
                        "missingSignals": ["valid model classification"],
                    },
                ),
            )

    async def suggest_document_classification(
        self,
        prompt: str,
    ) -> SuggestDocumentClassificationResponse:
        fallback = {
            "documentType": DocumentType.UNKNOWN.value,
            "reasoning": "The model did not return a valid classification.",
            "confidence": 0,
            "applicability": {
                "isApplicable": False,
                "matchedSignals": [],
                "missingSignals": ["valid model classification"],
            },
        }
        parsed = await self._generate_json(prompt, fallback)

        try:
            return SuggestDocumentClassificationResponse.model_validate(parsed)
        except ValidationError:
            return SuggestDocumentClassificationResponse(
                documentType=DocumentType.UNKNOWN,
                reasoning="The model did not return a valid classification.",
                confidence=0,
                applicability={
                    "isApplicable": False,
                    "matchedSignals": [],
                    "missingSignals": ["valid model classification"],
                },
            )

    async def _generate_json(
        self,
        prompt: str,
        fallback: dict[str, Any],
    ) -> dict[str, Any]:
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0,
                "top_p": 0.8,
                "num_ctx": 8192,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json=payload,
                )
                response.raise_for_status()
        except httpx.HTTPError as error:
            raise OllamaServiceError(
                "Ollama is unavailable or did not respond in time.",
            ) from error

        raw_response = response.json().get("response", "")
        return self._parse_json_response(raw_response, fallback)

    def _parse_json_response(
        self,
        raw_response: str,
        fallback: dict[str, Any],
    ) -> dict[str, Any]:
        try:
            parsed = json.loads(raw_response)
            return parsed if isinstance(parsed, dict) else fallback
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", raw_response, flags=re.DOTALL)
            if not match:
                return fallback

            try:
                parsed = json.loads(match.group(0))
                return parsed if isinstance(parsed, dict) else fallback
            except json.JSONDecodeError:
                return fallback
