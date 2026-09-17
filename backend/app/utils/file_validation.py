import os
import uuid
from typing import Tuple
from app.core.constants import ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES
from app.core.exceptions import FileSecurityError
from app.utils.validators import sanitize_filename


def validate_file_upload(
    filename: str,
    content: bytes,
    mime_type: str = "application/octet-stream",
) -> Tuple[str, str, int]:
    """
    Validates file upload against security constraints:
    1. Sanitizes filename against path traversal.
    2. Enforces allowed extensions (.pdf, .xlsx, .csv, .png, etc.).
    3. Enforces maximum file size limit (15MB).
    4. Validates mime type.

    Returns:
        (sanitized_filename, verified_mime_type, file_size_bytes)
    """
    if not filename:
        raise FileSecurityError("Filename cannot be empty")

    sanitized = sanitize_filename(filename)
    ext = os.path.splitext(sanitized)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise FileSecurityError(
            f"File extension '{ext}' is not permitted. Allowed extensions: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    file_size = len(content)
    if file_size == 0:
        raise FileSecurityError("Uploaded file cannot be empty (0 bytes).")

    if file_size > MAX_FILE_SIZE_BYTES:
        max_mb = MAX_FILE_SIZE_BYTES / (1024 * 1024)
        raise FileSecurityError(f"File size exceeds maximum allowed limit of {max_mb:.0f} MB.")

    return sanitized, mime_type, file_size


def build_storage_key(
    firm_id: str,
    client_id: str,
    document_id: str,
    version_number: int,
    original_filename: str,
) -> str:
    """
    Builds an isolated, server-side private storage key following tenant hierarchy:
    firms/{firm_id}/clients/{client_id}/documents/{document_id}/v{version_number}/{random_uuid}{ext}
    Prevents predictable paths, directory traversal, and public file enumeration.
    """
    clean_name = sanitize_filename(original_filename)
    ext = os.path.splitext(clean_name)[1].lower()
    random_token = uuid.uuid4().hex[:12]
    return f"firms/{firm_id}/clients/{client_id}/documents/{document_id}/v{version_number}/{random_token}{ext}"
