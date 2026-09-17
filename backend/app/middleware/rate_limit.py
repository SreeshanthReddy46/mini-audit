import time
from collections import defaultdict
from typing import Dict, List, Tuple
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
from app.core.exceptions import format_error_response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    In-memory rate limiter using a sliding window algorithm.
    Protects API against brute-force and denial-of-service attempts without requiring Redis.
    Configurable request capacity and window duration in seconds.
    """

    def __init__(self, app, requests_per_minute: int = 300, window_seconds: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.window_seconds = window_seconds
        self.client_records: Dict[str, List[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        if request.url.path in ["/api/health", "/docs", "/openapi.json", "/redoc"]:
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown_ip"
        current_time = time.time()
        window_start = current_time - self.window_seconds

        timestamps = self.client_records[client_ip]
        self.client_records[client_ip] = [t for t in timestamps if t > window_start]

        if len(self.client_records[client_ip]) >= self.requests_per_minute:
            return format_error_response(
                request=request,
                status_code=429,
                code="RATE_LIMIT_EXCEEDED",
                message="Rate limit exceeded. Please wait a moment before retrying.",
            )

        self.client_records[client_ip].append(current_time)
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(
            max(0, self.requests_per_minute - len(self.client_records[client_ip]))
        )
        return response
