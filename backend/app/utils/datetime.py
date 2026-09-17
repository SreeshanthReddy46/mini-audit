from datetime import datetime, timezone
from typing import Optional


def utc_now() -> datetime:
    """Returns the current timezone-aware UTC datetime."""
    return datetime.now(timezone.utc)


def format_iso(dt: Optional[datetime]) -> Optional[str]:
    """Formats a datetime as ISO 8601 string with UTC indicator."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()
