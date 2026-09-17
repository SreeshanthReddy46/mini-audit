import pytest
from app.utils.hashing import calculate_sha256, verify_sha256
from app.utils.validators import sanitize_filename, is_valid_uuid
from app.utils.file_validation import validate_file_upload, build_storage_key
from app.core.exceptions import FileSecurityError


def test_sha256_calculation_and_verification():
    content = b"Financial Audit Sample Document 2026"
    digest = calculate_sha256(content)
    assert len(digest) == 64
    assert verify_sha256(content, digest) is True
    assert verify_sha256(b"Tampered Content", digest) is False


def test_filename_sanitization_prevents_path_traversal():
    # Test path traversal attempts
    assert sanitize_filename("../../etc/passwd") == "passwd"
    assert sanitize_filename("..\\..\\Windows\\System32\\cmd.exe") == "cmd.exe"
    assert sanitize_filename("safe_report.pdf") == "safe_report.pdf"
    assert sanitize_filename("my\x00file.pdf") == "myfile.pdf"
    assert sanitize_filename("") == "unnamed_file"


def test_uuid_validator():
    assert is_valid_uuid("c8a9e4bb-1234-4567-89ab-cdef01234567") is True
    assert is_valid_uuid("invalid-uuid-string") is False
    assert is_valid_uuid("") is False


def test_file_validation_allowed_types():
    # Valid PDF
    clean_name, mime, size = validate_file_upload("report.pdf", b"%PDF-1.4 test content", "application/pdf")
    assert clean_name == "report.pdf"
    assert size > 0

    # Valid Excel
    clean_name, mime, size = validate_file_upload("tax_register.xlsx", b"dummy excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    assert clean_name == "tax_register.xlsx"


def test_file_validation_rejects_disallowed_extension():
    with pytest.raises(FileSecurityError) as exc_info:
        validate_file_upload("malicious_script.sh", b"#!/bin/bash echo hacked", "application/x-sh")
    assert "not permitted" in str(exc_info.value.message)

    with pytest.raises(FileSecurityError) as exc_info:
        validate_file_upload("trojan.exe", b"MZ...", "application/x-dosexec")
    assert "not permitted" in str(exc_info.value.message)


def test_file_validation_rejects_empty_file():
    with pytest.raises(FileSecurityError) as exc_info:
        validate_file_upload("empty.pdf", b"", "application/pdf")
    assert "0 bytes" in str(exc_info.value.message)


def test_storage_key_generation():
    key = build_storage_key(
        firm_id="firm-123",
        client_id="client-456",
        document_id="doc-789",
        version_number=2,
        original_filename="bank_statement.pdf",
    )
    assert key.startswith("firms/firm-123/clients/client-456/documents/doc-789/v2/")
    assert key.endswith(".pdf")
    assert ".." not in key
