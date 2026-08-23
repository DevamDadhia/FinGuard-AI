# ============================================================
# FinGuard AI
# FastAPI Application
# ============================================================

from fastapi import (
    FastAPI,
    HTTPException,
    Request,
)

from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database.database import Base, engine

from backend.routes.prediction import router as prediction_router
from backend.routes.transactions import router as transactions_router
from backend.routes.alerts import router as alerts_router
from backend.routes.analytics import router as analytics_router
from backend.routes.assistant import router as assistant_router


# ============================================================
# Database Initialization
# ============================================================

Base.metadata.create_all(
    bind=engine
)


# ============================================================
# FastAPI Application
# ============================================================

app = FastAPI(
    title="FinGuard AI",
    description="AI Financial Fraud Intelligence API",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Register Routers
# ============================================================

app.include_router(
    prediction_router
)

app.include_router(
    transactions_router
)

app.include_router(
    alerts_router
)

app.include_router(
    analytics_router
)

app.include_router(
    assistant_router
)


# ============================================================
# Health Check
# ============================================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy",
        "service": "FinGuard AI"
    }


# ============================================================
# HTTP Exception Handler
# ============================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(
    request: Request,
    exc: HTTPException
):

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": str(exc.detail)
        }
    )


# ============================================================
# Global Exception Handler
# ============================================================

@app.exception_handler(Exception)
async def general_exception_handler(
    request: Request,
    exc: Exception
):

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": (
                "An unexpected error occurred "
                "while processing the request."
            )
        }
    )