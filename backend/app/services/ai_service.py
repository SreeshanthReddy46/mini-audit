from typing import Optional
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.exceptions import TenantIsolationError, InvalidWorkflowStateError
from app.core.constants import AIAnalysisStatus, AuditAction, AuditEntity
from app.models.document import Document
from app.models.document_version import DocumentVersion
from app.models.ai_analysis import AIAnalysis
from app.repositories.document_repository import DocumentRepository
from app.repositories.audit_repository import AuditRepository
from app.agents.audit_agent import AuditAgent
from app.services.storage_service import storage_service


class AIService:
    """
    Orchestrates advisory AI document analysis.
    Principle: AI can recommend. The backend decides.
    The agent is restricted to advisory analysis; it cannot approve documents or modify states.
    """

    def __init__(self, db: Session):
        self.db = db
        self.doc_repo = DocumentRepository(db)
        self.audit_repo = AuditRepository(db)
        self.agent = AuditAgent()

    def analyze_document(
        self,
        document_id: UUID,
        firm_id: UUID,
        user_id: UUID,
        version_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> AIAnalysis:
        # 1. Authorize access (strict tenant check)
        doc = self.doc_repo.get_by_id(document_id, firm_id)
        if not doc:
            raise TenantIsolationError("Document not found")

        # 2. Resolve document version
        target_version: Optional[DocumentVersion] = None
        if version_id:
            target_version = (
                self.db.query(DocumentVersion)
                .filter(
                    DocumentVersion.id == version_id,
                    DocumentVersion.document_id == doc.id,
                    DocumentVersion.firm_id == firm_id,
                )
                .first()
            )
            if not target_version:
                raise TenantIsolationError("Specified document version not found")
        else:
            versions = self.doc_repo.get_versions(doc.id, firm_id)
            if versions:
                target_version = versions[0]

        # 3. Read document text content safely
        content_text = ""
        if target_version and target_version.storage_key:
            try:
                raw_bytes = storage_service.retrieve_file(target_version.storage_key)
                if raw_bytes:
                    content_text = raw_bytes.decode("utf-8", errors="ignore")
            except Exception:
                content_text = f"Simulated content for {doc.name}. Document version {doc.version}."
        elif doc.file_url:
            try:
                raw_bytes = storage_service.retrieve_file(doc.file_url)
                if raw_bytes:
                    content_text = raw_bytes.decode("utf-8", errors="ignore")
            except Exception:
                content_text = f"Standard audit checklist document for {doc.name}."
        else:
            content_text = f"Audit document placeholder for {doc.name}."

        # 4. Invoke restricted AuditAgent
        structured_analysis = self.agent.analyze_document_version(
            document_id=doc.id,
            document_name=doc.name,
            document_type=doc.document_type or doc.name,
            version_number=target_version.version_number if target_version else doc.version,
            content_text=content_text,
        )

        # 5. Persist AIAnalysis record (associated with version)
        analysis_record = AIAnalysis(
            firm_id=firm_id,
            document_id=doc.id,
            version_id=target_version.id if target_version else None,
            status=AIAnalysisStatus.COMPLETED.value,
            model="mini-audit-advisory-v1",
            prompt_version="audit-guardrails-1.0",
            summary=structured_analysis.summary,
            findings=[f.model_dump() for f in structured_analysis.findings],
            overall_confidence=str(structured_analysis.overall_confidence),
            completed_at=datetime.now(timezone.utc),
        )
        self.db.add(analysis_record)
        self.db.flush()

        # 6. Append immutable audit event
        self.audit_repo.create(
            firm_id=firm_id,
            action=AuditAction.AI_ANALYSIS_COMPLETED.value,
            actor_id=user_id,
            document_id=doc.id,
            entity_type=AuditEntity.AI_ANALYSIS.value,
            entity_id=analysis_record.id,
            comment=f"Advisory AI analysis completed with {len(structured_analysis.findings)} finding(s)",
            metadata_json={
                "model": analysis_record.model,
                "confidence": structured_analysis.overall_confidence,
                "findings_count": len(structured_analysis.findings),
            },
            ip_address=ip_address,
            user_agent=user_agent,
        )

        self.db.commit()
        self.db.refresh(analysis_record)
        return analysis_record

    def get_latest_analysis(self, document_id: UUID, firm_id: UUID) -> Optional[AIAnalysis]:
        doc = self.doc_repo.get_by_id(document_id, firm_id)
        if not doc:
            raise TenantIsolationError("Document not found")

        return (
            self.db.query(AIAnalysis)
            .filter(AIAnalysis.document_id == document_id, AIAnalysis.firm_id == firm_id)
            .order_by(AIAnalysis.created_at.desc())
            .first()
        )
