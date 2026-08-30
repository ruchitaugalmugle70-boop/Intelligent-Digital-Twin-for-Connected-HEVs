from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database.connection import engine
from app.api import telemetry, vehicles, websocket, simulation

app = FastAPI(
    title="Elespa Intelligent Digital Twin",
    description="Digital Twin platform for connected hybrid electric vehicles",
    version="1.0.0"
)

# ─────────────────────────────────────────────────────────────
# CORS — allow the frontend (any origin during development)
# ─────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────
# Routers
# ─────────────────────────────────────────────────────────────
app.include_router(telemetry.router)
app.include_router(vehicles.router)
app.include_router(simulation.router)
app.include_router(websocket.router)


# ─────────────────────────────────────────────────────────────
# Root & Health endpoints
# ─────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {
        "project": "Elespa Intelligent Digital Twin",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}


@app.get("/health/database", tags=["Health"])
def database_health():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            value = result.scalar()
        return {"database": "connected", "result": value}
    except Exception as e:
        return {"database": "error", "message": str(e)}