from fastapi import FastAPI
from sqlalchemy import text

from app.database.connection import engine


app = FastAPI(
    title="Elespa Intelligent Digital Twin",
    description="Digital Twin platform for connected hybrid electric vehicles",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "project": "Elespa Intelligent Digital Twin",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.get("/health/database")
def database_health():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            value = result.scalar()

        return {
            "database": "connected",
            "result": value
        }

    except Exception as e:
        return {
            "database": "error",
            "message": str(e)
        }