import re
from typing import Dict, Any, Tuple
from app.schemas.ai import AIAnalysisStructuredOutput, FindingItem


PROMPT_INJECTION_PATTERNS = [
    r"(?i)ignore\s+(all\s+)?(previous|prior)\s+instructions",
    r"(?i)system\s+prompt\s*:\s*override",
    r"(?i)you\s+are\s+now\s+(in\s+developer\s+mode|an\s+administrator|root)",
    r"(?i)disregard\s+(all\s+)?guidelines",
    r"(?i)approve\s+this\s+(document|file)\s+automatically",
    r"(?i)grant\s+(admin|superuser)\s+access",
    r"(?i)execute\s+(sql|shell|bash|cmd)",
]


def detect_prompt_injection(text: str) -> Tuple[bool, str]:
    """
    Scans untrusted document content for prompt injection payloads or jailbreak phrases.
    Returns (is_suspicious, matched_pattern).
    """
    if not text:
        return False, ""

    for pattern in PROMPT_INJECTION_PATTERNS:
        match = re.search(pattern, text)
        if match:
            return True, match.group(0)

    return False, ""


def sanitize_untrusted_document(text: str) -> str:
    """
    Sanitizes untrusted text extracted from uploaded audit documents.
    1. Truncates overly large content (prevents context stuffing DoS).
    2. Encapsulates content in strict XML data boundary delimiters.
    """
    if not text:
        return "<UNTRUSTED_DOCUMENT_CONTENT>\n[Empty Document Content]\n</UNTRUSTED_DOCUMENT_CONTENT>"

    # Truncate at 100,000 characters for safety
    max_len = 100_000
    safe_text = text[:max_len]
    if len(text) > max_len:
        safe_text += "\n...[Content truncated at 100,000 characters]..."

    return f"<UNTRUSTED_DOCUMENT_CONTENT>\n{safe_text}\n</UNTRUSTED_DOCUMENT_CONTENT>"


def validate_agent_output(raw_output: Dict[str, Any]) -> AIAnalysisStructuredOutput:
    """
    Validates agent output with Pydantic model to guarantee strict structural adherence.
    The AI cannot return unvalidated or malicious JSON.
    """
    return AIAnalysisStructuredOutput.model_validate(raw_output)
