from fastapi import FastAPI
from app.routes import jd_routes, resume_routes, talent_check_routes
app=FastAPI(title="RADIX Talent Match API")
app.include_router(jd_routes.router,prefix="/api/jd",tags=["JD Analytics"])
app.include_router(resume_routes.router,prefix="/api/resume",tags=["Resume Parsing"])
app.include_router(talent_check_routes.router,prefix="/api/talent-check",tags=["Talent Check"])
@app.get("/")
def home(): return {"message":"RADIX Talent Match API is running"}
@app.get("/api/health")
def health(): return {"status":"healthy"}
