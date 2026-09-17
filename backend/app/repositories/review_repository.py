from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.review import Review


class ReviewRepository:
    """
    Repository for Review decisions and feedback comments.
    Enforces tenant isolation by requiring firm_id on every operation.
    """

    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        firm_id: UUID,
        document_id: UUID,
        reviewer_id: UUID,
        decision: str,
        comment: Optional[str] = None,
    ) -> Review:
        """Records an official reviewer decision with rationale."""
        review = Review(
            firm_id=firm_id,
            document_id=document_id,
            reviewer_id=reviewer_id,
            decision=decision,
            comment=comment,
        )
        self.db.add(review)
        self.db.flush()
        return review

    def list_by_document(self, document_id: UUID, firm_id: UUID) -> List[Review]:
        """Lists historical reviewer decisions for a document in descending order."""
        return (
            self.db.query(Review)
            .filter(Review.document_id == document_id, Review.firm_id == firm_id)
            .order_by(Review.created_at.desc())
            .all()
        )

    def get_latest(self, document_id: UUID, firm_id: UUID) -> Optional[Review]:
        """Fetches the latest reviewer decision for a document."""
        return (
            self.db.query(Review)
            .filter(Review.document_id == document_id, Review.firm_id == firm_id)
            .order_by(Review.created_at.desc())
            .first()
        )
