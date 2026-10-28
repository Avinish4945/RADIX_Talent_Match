from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import jd_routes, profile_routes, resume_routes, talent_check_routes,skill_match_routes

app = FastAPI(title="RADIX Talent Match API")

# Register each router exactly once; duplicate registration duplicates OpenAPI paths.
app.include_router(jd_routes.router, prefix="/api/jd", tags=["JD Analytics"])
app.include_router(resume_routes.router, prefix="/api/resume", tags=["Resume Parsing"])
app.include_router(talent_check_routes.router, prefix="/api/talent-check", tags=["Talent Check"])
app.include_router(profile_routes.router, tags=["Profile Builder"])
app.include_router(skill_match_routes.router, prefix="/api/skill-match", tags=["Skill Matching"])


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
