from fastapi import APIRouter, Request, Depends, HTTPException, Response
import requests
from app.utils.jwt import get_current_user

router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)

AI_URL = "http://127.0.0.1:8000"

@router.api_route("/{path:path}",methods=["PUT", "DELETE","POST","GET"])
async def ai_proxy(
    path: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    body = await request.body()

    try:
        response = requests.request(
            method=request.method,
            url=f"{AI_URL}/{path}",
            params=request.query_params,
            headers={
                "content-type": request.headers.get(
                    "content-type",
                    "application/json"
                )
            },
            content=body,
            timeout=30
        )

    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503,
            detail="AI service is unavailable"
        )

    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=504,
            detail="AI service timed out"
        )

    return Response(
        content=response.content,
        status_code=response.status_code,
        media_type=response.headers.get("content-type")
    )