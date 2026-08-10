from fastapi import FastAPI

app=FastAPI(
    title="Elespa Intelligent Digital Twin",
    description="Digital Twin platform for connected hybrid electric vehicles",
    version="1.0.0"
)
@app.get("/")
def root():
    return{
        "project":"Elespa Intelligent Digital Twin",
        "status":"running",
        "version":"1.0.0"
    }
@app.get("/health")
def health_check():
    return {
        "status":"healthy"
 }

