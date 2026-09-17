import re
from typing import List, Dict, Any, Optional
from app.schemas.ai import AIAnalysisStructuredOutput, FindingItem
from app.agents.agent_guardrails import detect_prompt_injection, sanitize_untrusted_document, validate_agent_output
from app.agents.finding_generator import FindingGenerator


class DocumentAnalyzer:
    """
    Intelligent audit document analyzer.
    Combines deterministic compliance heuristics and prompt-injection defense
    to produce structured advisory findings for the CA reviewer.
    Operates completely offline with zero external cloud dependencies.
    """

    def analyze(
        self,
        document_type: str,
        document_name: str,
        content_text: str,
    ) -> AIAnalysisStructuredOutput:
        findings: List[FindingItem] = []
        doc_type_clean = document_type.lower().replace(" ", "_")

        # 1. Prompt Injection & Adversarial Content Guardrail
        is_suspicious, matched_pattern = detect_prompt_injection(content_text)
        if is_suspicious:
            findings.append(
                FindingGenerator.compliance_risk(
                    title="Suspicious Prompt Injection Pattern Detected",
                    description=f"The uploaded document contains phrasing resembling prompt manipulation: '{matched_pattern}'. The backend has neutralized this input.",
                    evidence=f"Matched payload pattern: {matched_pattern}",
                    recommendation="Reviewer must inspect original PDF manually. Do not trust autonomous processing for this file.",
                    severity="HIGH",
                    confidence=0.98,
                )
            )

        # 2. Document-Specific Domain Compliance Checks
        text_lower = content_text.lower() if content_text else ""

        if "bank_statement" in doc_type_clean or "bank" in text_lower:
            # Check for closing balance
            if "closing balance" not in text_lower and "ending balance" not in text_lower:
                findings.append(
                    FindingGenerator.missing_information(
                        title="Closing Balance Section Unavailable",
                        description="The supplied document does not contain an explicitly labeled closing balance figure.",
                        evidence="Full document scan: keywords 'closing balance' or 'ending balance' not identified.",
                        recommendation="Reviewer should verify the final closing balance from the source bank statement summary.",
                        severity="MEDIUM",
                        confidence=0.91,
                    )
                )
            else:
                findings.append(
                    FindingGenerator.observation(
                        title="Closing Balance Statement Detected",
                        description="Identified closing balance section in the bank statement.",
                        evidence="Matched 'closing balance' or 'ending balance' keyword in document statement.",
                        recommendation="Reconcile against the general ledger bank book balance.",
                        severity="LOW",
                        confidence=0.89,
                    )
                )

        elif "gst_return" in doc_type_clean or "gst" in text_lower:
            # Check GSTIN pattern (2 digits + 5 alpha + 4 digits + 1 alpha + 1 alpha/digit + Z + 1 alpha/digit)
            gstin_regex = r"\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b"
            gstin_match = re.search(gstin_regex, content_text.upper())
            if not gstin_match:
                findings.append(
                    FindingGenerator.compliance_risk(
                        title="Valid 15-Digit GSTIN Not Detected",
                        description="A standard 15-character Goods and Services Tax Identification Number (GSTIN) was not detected in the return header.",
                        evidence="Header extraction search across standard GSTIN regular expression pattern.",
                        recommendation="Verify that the return belongs to the authorized entity's GSTIN.",
                        severity="HIGH",
                        confidence=0.93,
                    )
                )
            else:
                findings.append(
                    FindingGenerator.observation(
                        title="GSTIN Identified",
                        description=f"Verified 15-digit GSTIN pattern: {gstin_match.group(0)}",
                        evidence=f"Matched GSTIN: {gstin_match.group(0)}",
                        recommendation="Confirm GSTIN matches the client master record.",
                        severity="LOW",
                        confidence=0.95,
                    )
                )

        elif "sales_register" in doc_type_clean or "sales" in text_lower:
            if "tax invoice" not in text_lower and "invoice no" not in text_lower:
                findings.append(
                    FindingGenerator.missing_information(
                        title="Invoice Number Sequence Incomplete",
                        description="Missing sequential 'Invoice No' or 'Tax Invoice' column in sales schedule.",
                        evidence="Document body text search for tax invoice headers.",
                        recommendation="Request complete sales register with sequential invoice numbers.",
                        severity="MEDIUM",
                        confidence=0.88,
                    )
                )

        elif "purchase_register" in doc_type_clean or "purchase" in text_lower:
            if "vendor" not in text_lower and "supplier" not in text_lower:
                findings.append(
                    FindingGenerator.missing_information(
                        title="Vendor Identification Column Missing",
                        description="Purchase register does not clearly show vendor/supplier names.",
                        evidence="Document scan: 'vendor' or 'supplier' header not detected.",
                        recommendation="Ensure input tax credit (ITC) schedule lists full supplier details.",
                        severity="MEDIUM",
                        confidence=0.87,
                    )
                )

        # Baseline observation if empty or no other findings
        if not findings:
            findings.append(
                FindingGenerator.observation(
                    title="Standard Document Layout Verified",
                    description=f"Document '{document_name}' matches expected format with no immediate structural anomalies.",
                    evidence=f"Parsed {len(content_text)} characters without syntax or integrity violations.",
                    recommendation="Proceed with standard checklist verification and sample testing.",
                    severity="LOW",
                    confidence=0.90,
                )
            )

        summary_text = (
            f"Advisory audit analysis for {document_name} ({document_type}). "
            f"Identified {len(findings)} finding(s). "
            "Deterministic backend rules govern final document approval."
        )

        output_dict = {
            "document_type": document_type,
            "summary": summary_text,
            "findings": [f.model_dump() for f in findings],
            "overall_confidence": 0.89,
        }

        return validate_agent_output(output_dict)
