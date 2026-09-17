import os
import uuid
from pathlib import Path
from typing import Tuple
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings

ALLOWED_EXTENSIONS = {".pdf", ".csv", ".xlsx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def validate_file(file: UploadFile) -> str:
    """Validate file extension and return sanitized extension."""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is missing."
        )

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}."
        )
    return ext


def save_file_locally(firm_id: uuid.UUID, file: UploadFile) -> Tuple[str, int]:
    """
    Save uploaded file to private local filesystem storage scoped by firm_id.
    Returns: (storage_key, file_size)
    """
    ext = validate_file(file)

    storage_root = Path(settings.STORAGE_DIR).resolve()
    firm_dir = storage_root / str(firm_id)
    firm_dir.mkdir(parents=True, exist_ok=True)

    # Server-generated UUID identifier (never trust client filename for storage)
    file_uuid = uuid.uuid4()
    storage_filename = f"{file_uuid}{ext}"
    target_path = firm_dir / storage_filename

    # Read and validate size
    content = file.file.read()
    file_size = len(content)
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum size of 10MB ({file_size} bytes)."
        )

    with open(target_path, "wb") as f:
        f.write(content)

    return storage_filename, file_size


def get_file_path(firm_id: uuid.UUID, storage_filename: str) -> Path:
    """
    Retrieve absolute file path ensuring firm boundary and preventing path traversal.
    """
    storage_root = Path(settings.STORAGE_DIR).resolve()
    target_path = (storage_root / str(firm_id) / storage_filename).resolve()

    # Prevent directory traversal attacks
    firm_dir = (storage_root / str(firm_id)).resolve()
    if not str(target_path).startswith(str(firm_dir)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Illegal file path access attempt."
        )

    if not target_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on storage server."
        )

    return target_path
