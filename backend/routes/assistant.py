# ============================================================
# FinGuard AI
# GenAI Assistant API
# ============================================================

from fastapi import APIRouter, HTTPException

from backend.schemas.assistant import (
    AssistantRequest,
    AssistantResponse
)

from backend.services.assistant_service import (
    ask_assistant
)


router = APIRouter(
    prefix="/assistant",
    tags=["AI Assistant"]
)


@router.post(
    "/chat",
    response_model=AssistantResponse
)
def assistant_chat(
    request: AssistantRequest
):

    try:
        return ask_assistant(
            question=request.question,
            transaction_id=request.transaction_id
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Assistant error: {str(exc)}"
        )