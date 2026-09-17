import uuid
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Assigns a unique correlation ID (X-Request-ID) to every HTTP request.
    If the caller supplied an X-Request-ID header, it is validated and preserved.
    Otherwise, a new request ID is generated.
    The ID is attached to request.state.request_id and echoed back in the response headers.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        incoming_id = request.headers.get("X-Request-ID")
        if incoming_id and len(incoming_id) <= 64:
            request_id = incoming_id
        else:
            request_id = f"req_{uuid.uuid4().hex[:12]}"

        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response
