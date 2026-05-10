import json
import os
import re
from typing import Any

import httpx
from pydantic import ValidationError

from app.schemas.suggestions import SuggestAnnotationsResponse


class OllamaServiceError(RuntimeError):
    pass


class OllamaService:
    def __init__(self) -> None:
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
        self.model = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")
        self.timeout_seconds = float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "4500"))

    async def suggest_annotations(self, prompt: str) -> SuggestAnnotationsResponse:
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
        parsed = self._parse_json_response(raw_response)

        try:
            return SuggestAnnotationsResponse.model_validate(parsed)
        except ValidationError:
            return SuggestAnnotationsResponse(suggestions=[])

    def _parse_json_response(self, raw_response: str) -> dict[str, Any]:
        try:
            parsed = json.loads(raw_response)
            return parsed if isinstance(parsed, dict) else {"suggestions": []}
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", raw_response, flags=re.DOTALL)
            if not match:
                return {"suggestions": []}

            try:
                parsed = json.loads(match.group(0))
                return parsed if isinstance(parsed, dict) else {"suggestions": []}
            except json.JSONDecodeError:
                return {"suggestions": []}
