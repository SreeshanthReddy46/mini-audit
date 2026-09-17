from typing import Optional
from app.schemas.ai import FindingItem


class FindingGenerator:
    """
    Factory for producing strongly-typed, standardized audit findings.
    Ensures that every finding has:
    - category
    - severity
    - title & description
    - verbatim evidence quote
    - calibrated confidence score
    - actionable recommendation for the human reviewer
    """

    @staticmethod
    def missing_information(
        title: str,
        description: str,
        evidence: str,
        recommendation: str,
        severity: str = "MEDIUM",
        confidence: float = 0.90,
    ) -> FindingItem:
        return FindingItem(
            category="MISSING_INFORMATION",
            severity=severity,
            title=title,
            description=description,
            evidence=evidence,
            confidence=confidence,
            recommendation=recommendation,
        )

    @staticmethod
    def calculation_mismatch(
        title: str,
        description: str,
        evidence: str,
        recommendation: str,
        severity: str = "HIGH",
        confidence: float = 0.95,
    ) -> FindingItem:
        return FindingItem(
            category="CALCULATION_MISMATCH",
            severity=severity,
            title=title,
            description=description,
            evidence=evidence,
            confidence=confidence,
            recommendation=recommendation,
        )

    @staticmethod
    def compliance_risk(
        title: str,
        description: str,
        evidence: str,
        recommendation: str,
        severity: str = "HIGH",
        confidence: float = 0.88,
    ) -> FindingItem:
        return FindingItem(
            category="COMPLIANCE_RISK",
            severity=severity,
            title=title,
            description=description,
            evidence=evidence,
            confidence=confidence,
            recommendation=recommendation,
        )

    @staticmethod
    def observation(
        title: str,
        description: str,
        evidence: str,
        recommendation: str,
        severity: str = "LOW",
        confidence: float = 0.85,
    ) -> FindingItem:
        return FindingItem(
            category="OBSERVATION",
            severity=severity,
            title=title,
            description=description,
            evidence=evidence,
            confidence=confidence,
            recommendation=recommendation,
        )
