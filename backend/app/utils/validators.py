import re
import uuid
from typing import Optional


def is_valid_uuid(val: str) -> bool:
    """Validates if a string is a well-formed UUID."""
    try:
        uuid.UUID(str(val))
        return True
    except (ValueError, TypeError, AttributeError):
        return False


def sanitize_filename(filename: str) -> str:
    """
    Strips directory paths, null bytes, and hazardous characters from uploaded filenames
    to prevent path traversal attacks (e.g., ../../etc/passwd or %00).
    """
    if not filename:
        return "unnamed_file"

    # Remove null bytes
    filename = filename.replace("\x00", "")

    # Strip directory components regardless of OS slashes
    filename = filename.replace("\\", "/").split("/")[-1]

    # Only allow alphanumeric, dashes, underscores, dots, and spaces
    clean = re.sub(r"[^\w\s\.\-]", "_", filename).strip()
    return clean or "document"
