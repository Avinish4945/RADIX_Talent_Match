from dotenv import load_dotenv
load_dotenv()
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from app.routes import jd_routes, resume_routes, talent_check_routes, profile_routes

app = FastAPI(title="RADIX Talent Match API")

app.include_router(jd_routes.router, prefix="/api/jd", tags=["JD Analytics"])
app.include_router(resume_routes.router, prefix="/api/resume", tags=["Resume Parsing"])
app.include_router(talent_check_routes.router, prefix="/api/talent-check", tags=["Talent Check"])
app.include_router(profile_routes.router, tags=["Profile Builder"])

@app.get("/")
def home():
    return {"message": "RADIX Talent Match API is running"}

@app.get("/api/health")
def health():
    return {"status": "healthy"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    jd_routes.router,
    prefix="/api/jd",
    tags=["JD Analytics"],
)