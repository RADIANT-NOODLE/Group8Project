from fastapi import FastAPI

app = FastAPI(title="VALORA API", description="Property Health Intelligence Platform")

@app.get("/health")
def health_check():
    return {"status": "ok", "environment": "development"}
