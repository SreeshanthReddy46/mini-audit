import hashlib


def calculate_sha256(content: bytes) -> str:
    """
    Computes cryptographic SHA-256 digest of binary content.
    Used for tamper-detection, duplicate detection, and immutable document version verification.
    """
    sha256 = hashlib.sha256()
    sha256.update(content)
    return sha256.hexdigest()


def verify_sha256(content: bytes, expected_hash: str) -> bool:
    """
    Verifies that binary content matches the expected SHA-256 hash.
    """
    return calculate_sha256(content).lower() == expected_hash.lower()
