from app.core.database import SessionLocal, init_db
from app.core.security import get_password_hash
from app.models import (
    Firm,
    User,
    Client,
    Document,
    DocumentVersion,
    Review,
    AuditEvent,
    AIAnalysis,
)

REQUIRED_DOCUMENTS = [
    "Bank Statement",
    "Sales Register",
    "Purchase Register",
    "GST Return",
    "Expense Summary"
]


def seed_database():
    print("Initializing database tables...")
    init_db()
    db = SessionLocal()

    try:
        # Check if already seeded
        existing_firm = db.query(Firm).filter(Firm.name == "ABC & Co.").first()
        if existing_firm:
            print("Database already contains demo data. Resetting demo data for clean evaluation...")
            # Delete in cascade order (children first)
            db.query(AIAnalysis).delete()
            db.query(Review).delete()
            db.query(DocumentVersion).delete()
            db.query(AuditEvent).delete()
            db.query(Document).delete()
            db.query(Client).delete()
            db.query(User).delete()
            db.query(Firm).delete()
            db.commit()

        print("Seeding Firm A (ABC & Co.)...")
        firm_a = Firm(name="ABC & Co.")
        db.add(firm_a)
        db.flush()

        # Firm A Users
        rohit = User(
            firm_id=firm_a.id,
            name="Rohit",
            email="rohit@abc.com",
            password_hash=get_password_hash("password123"),
            role="STAFF"
        )
        aman = User(
            firm_id=firm_a.id,
            name="Aman",
            email="aman@abc.com",
            password_hash=get_password_hash("password123"),
            role="REVIEWER"
        )
        db.add_all([rohit, aman])
        db.flush()

        # Firm A Client
        client_a = Client(
            firm_id=firm_a.id,
            name="ABC Traders Pvt. Ltd."
        )
        db.add(client_a)
        db.flush()

        # Firm A Client Created Audit Event
        audit_client_a = AuditEvent(
            firm_id=firm_a.id,
            actor_id=rohit.id,
            action="CLIENT_CREATED",
            comment=f"Created client '{client_a.name}'",
            metadata_json={"client_name": client_a.name}
        )
        db.add(audit_client_a)

        # Firm A Documents
        for doc_name in REQUIRED_DOCUMENTS:
            doc = Document(
                firm_id=firm_a.id,
                client_id=client_a.id,
                name=doc_name,
                status="PENDING",
                version=1
            )
            db.add(doc)
            db.flush()

            db.add(AuditEvent(
                firm_id=firm_a.id,
                document_id=doc.id,
                actor_id=rohit.id,
                action="DOCUMENT_ADDED",
                comment=f"Required document '{doc_name}' added to compliance checklist",
                metadata_json={"document_name": doc_name, "status": "PENDING"}
            ))

        print("Seeding Firm B (XYZ & Co.)...")
        firm_b = Firm(name="XYZ & Co.")
        db.add(firm_b)
        db.flush()

        # Firm B Users
        rahul = User(
            firm_id=firm_b.id,
            name="Rahul",
            email="rahul@xyz.com",
            password_hash=get_password_hash("password123"),
            role="STAFF"
        )
        priya = User(
            firm_id=firm_b.id,
            name="Priya",
            email="priya@xyz.com",
            password_hash=get_password_hash("password123"),
            role="REVIEWER"
        )
        db.add_all([rahul, priya])
        db.flush()

        # Firm B Client
        client_b = Client(
            firm_id=firm_b.id,
            name="XYZ Manufacturing Ltd."
        )
        db.add(client_b)
        db.flush()

        # Firm B Client Created Audit Event
        audit_client_b = AuditEvent(
            firm_id=firm_b.id,
            actor_id=rahul.id,
            action="CLIENT_CREATED",
            comment=f"Created client '{client_b.name}'",
            metadata_json={"client_name": client_b.name}
        )
        db.add(audit_client_b)

        # Firm B Documents
        for doc_name in REQUIRED_DOCUMENTS:
            doc = Document(
                firm_id=firm_b.id,
                client_id=client_b.id,
                name=doc_name,
                status="PENDING",
                version=1
            )
            db.add(doc)
            db.flush()

            db.add(AuditEvent(
                firm_id=firm_b.id,
                document_id=doc.id,
                actor_id=rahul.id,
                action="DOCUMENT_ADDED",
                comment=f"Required document '{doc_name}' added to compliance checklist",
                metadata_json={"document_name": doc_name, "status": "PENDING"}
            ))

        db.commit()
        print("\nDemo Data Seeded Successfully!")
        print("=" * 60)
        print("FIRM A: ABC & Co.")
        print("  Staff:    rohit@abc.com / password123")
        print("  Reviewer: aman@abc.com  / password123")
        print("  Client:   ABC Traders Pvt. Ltd. (5 Audit Documents)")
        print("-" * 60)
        print("FIRM B: XYZ & Co. (Tenant Isolation Target)")
        print("  Staff:    rahul@xyz.com / password123")
        print("  Reviewer: priya@xyz.com / password123")
        print("  Client:   XYZ Manufacturing Ltd. (5 Audit Documents)")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
