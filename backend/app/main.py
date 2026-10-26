
from fastapi import FastAPI
from app.routes import jd_routes

app = FastAPI()

app.include_router(
    jd_routes.router,
    prefix="/api/jd",
    tags=["JD Analytics"]
)

@app.get("/")
def home():
    return {"message": "JD Analytics Backend is running"}
