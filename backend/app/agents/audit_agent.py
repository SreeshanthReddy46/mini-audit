from typing import Optional, Dict, Any
from uuid import UUID
from app.schemas.ai import AIAnalysisStructuredOutput
from app.agents.document_analyzer import DocumentAnalyzer


class AuditAgent:
    """
    Restricted Advisory Agent implementing least-privilege allowlist:
    - ALLOWED: read_authorized_document_content()
    - ALLOWED: read_document_metadata()
    - ALLOWED: generate_advisory_findings()
    - FORBIDDEN: execute_sql()
    - FORBIDDEN: delete_document()
    - FORBIDDEN: approve_document()
    - FORBIDDEN: alter_workflow_state()
    - FORBIDDEN: access_cross_tenant_data()
    - FORBIDDEN: execute_shell()
    """

    def __init__(self):
        self.analyzer = DocumentAnalyzer()

    def analyze_document_version(
        self,
        document_id: UUID,
        document_name: str,
        document_type: str,
        version_number: int,
        content_text: str,
    ) -> AIAnalysisStructuredOutput:
        """
        Executes advisory analysis on the authorized document version supplied by backend.
        Never fetches data autonomously across tenant borders.
        """
        return self.analyzer.analyze(
            document_type=document_type,
            document_name=document_name,
            content_text=content_text,
        )
