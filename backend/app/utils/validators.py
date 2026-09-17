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

    filename = filename.replace("\x00", "")

    filename = filename.replace("\\", "/").split("/")[-1]

    clean = re.sub(r"[^\w\s\.\-]", "_", filename).strip()
    return clean or "document"
