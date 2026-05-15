from app.schemas.suggestions import (
    ClassifyDocumentTypeRequest,
    SuggestAnnotationsRequest,
    SuggestDocumentClassificationRequest,
)

MAX_DOCUMENT_CHARS = 12000
MAX_CLASSIFICATION_DOCUMENT_CHARS = 4000
MAX_RULES = 25
MAX_ANNOTATIONS = 25
MAX_AI_FEEDBACK = 10


def build_annotation_prompt(request: SuggestAnnotationsRequest) -> str:
    rules = request.rules[:MAX_RULES]
    annotations = request.existing_annotations[:MAX_ANNOTATIONS]
    previous_ai_suggestions = request.previous_ai_suggestions[:MAX_AI_FEEDBACK]
    document_text = request.extracted_text[:MAX_DOCUMENT_CHARS]

    return f"""You are TaskMindAI, a constrained annotation assistant for Document Studio.

Goal:
Suggest text annotations only when the workspace rules and prior human annotations support them.

Hard rules:
- Return only valid JSON.
- Do not include markdown.
- Do not invent text that is not present verbatim in the document text.
- If the document does not appear applicable, return {{"suggestions":[]}}.
- Prefer fewer high-quality suggestions over many guesses.
- Maximum suggestions: 5.
- Confidence must be between 0 and 1.
- Reasoning must cite the specific rule or previous annotation pattern that supports the suggestion.

Response schema:
{{
  "suggestions": [
    {{
      "fieldName": "short_field_name",
      "selectedText": "verbatim text from the document",
      "reasoning": "why this should be annotated",
      "confidence": 0.72
    }}
  ]
}}

Workspace:
{request.workspace}

Document metadata:
{request.document}

Workspace rules:
{rules}

Previous human annotations:
{annotations}

Previous human feedback on AI suggestions:
{previous_ai_suggestions}

Document text:
\"\"\"
{document_text}
\"\"\"
"""


def build_document_type_prompt(request: ClassifyDocumentTypeRequest) -> str:
    rules = request.rules[:MAX_RULES]
    previous_ai_suggestions = request.previous_ai_suggestions[:MAX_AI_FEEDBACK]
    document_text = request.extracted_text[:MAX_DOCUMENT_CHARS]

    return f"""You are TaskMindAI, a constrained document classification assistant.

Goal:
Classify the document text into exactly one learned workflow type.

Allowed documentType values:
- INVOICE
- RESUME
- BANK_STATEMENT
- SUPPORT_EMAIL
- UNKNOWN

Hard rules:
- Return only valid JSON.
- Do not include markdown.
- The documentType must be exactly one allowed value.
- Prefer UNKNOWN when unsure or when the document does not match a learned workflow.
- Keep reasoning short and cite concrete evidence from the text or prior human feedback.
- Confidence must be between 0 and 1.

Response schema:
{{
  "classification": {{
    "documentType": "UNKNOWN",
    "reasoning": "why this label applies, or why no learned workflow applies",
    "confidence": 0.42
  }}
}}

Workspace:
{request.workspace}

Document metadata:
{request.document}

Workspace rules:
{rules}

Previous human feedback on document classification suggestions:
{previous_ai_suggestions}

Document text:
\"\"\"
{document_text}
\"\"\"
"""


def build_document_classification_prompt(
    request: SuggestDocumentClassificationRequest,
) -> str:
    context = request.context
    rules = context.rules[:10]
    applicability_rules = context.applicability_rules[:10]
    approved_examples = context.approved_examples[:5]
    corrected_examples = context.corrected_examples[:5]
    rejected_examples = context.rejected_examples[:5]
    unknown_examples = context.unknown_examples[:5]
    rejection_examples = context.rejection_examples[:5]
    classification_labels = context.classification_labels or [
        "INVOICE",
        "RESUME",
        "BANK_STATEMENT",
        "SUPPORT_EMAIL",
        "UNKNOWN",
    ]
    known_document_types = context.known_document_types or [
        label for label in classification_labels if label != "UNKNOWN"
    ]
    document_text = request.document_text[:MAX_CLASSIFICATION_DOCUMENT_CHARS]

    return f"""You are TaskMindAI, a constrained document classification assistant.

Goal:
Classify this document into exactly one allowed workflow label using the bounded human teaching context.

Allowed documentType values:
{classification_labels}

Known workflow labels that require clear evidence:
{known_document_types}

Hard rules:
- Return valid JSON only.
- Do not include markdown.
- Choose only one label from the allowed documentType values.
- Choose UNKNOWN when the document does not clearly match one of the known labels.
- Do not guess based on weak similarity.
- Do not hallucinate missing fields or signals.
- If required signals are absent, return UNKNOWN.
- Prefer UNKNOWN when uncertain, when applicability rules say the workflow is not applicable, or when evidence is weak.
- Learn from corrected examples: when prior human corrections conflict with model guesses, follow the corrected labels.
- Avoid mistakes shown in rejected examples.
- Treat unknownExamples as high-value boundary lessons.
- Treat rejectionExamples as examples of over-classification to avoid.
- Use approved examples as positive patterns, not as unlimited history.
- Keep reasoning short and concrete.
- Confidence must be between 0 and 1.
- applicability.isApplicable must be false when documentType is UNKNOWN.
- matchedSignals and missingSignals must be short arrays of concrete signals.

Response schema:
{{
  "documentType": "UNKNOWN",
  "reasoning": "Document does not contain invoice, resume, bank statement, or support email signals.",
  "confidence": 0.76,
  "applicability": {{
    "isApplicable": false,
    "matchedSignals": [],
    "missingSignals": [
      "invoice number",
      "resume sections",
      "transaction table",
      "customer request"
    ]
  }}
}}

Context:
{{
  "rules": {rules},
  "applicabilityRules": {applicability_rules},
  "approvedExamples": {approved_examples},
  "correctedExamples": {corrected_examples},
  "rejectedExamples": {rejected_examples},
  "unknownExamples": {unknown_examples},
  "rejectionExamples": {rejection_examples},
  "classificationLabels": {classification_labels},
  "knownDocumentTypes": {known_document_types}
}}

Document text:
\"\"\"
{document_text}
\"\"\"
"""
