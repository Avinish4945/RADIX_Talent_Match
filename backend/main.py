from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.modules.resume_parsing.router import router as resume_router
# from backend.modules.jd_analytics.router import router as jd_router  <-- Teammate will add this

app = FastAPI(title="RADIX Talent Match API")

# Allow React frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Change to localhost:5173 or 3000 for security in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(resume_router, prefix="/api/resume", tags=["Resume Parsing"])

@app.get("/")
def health_check():
    return {"status": "ok", "message": "RADIX Backend is running"}