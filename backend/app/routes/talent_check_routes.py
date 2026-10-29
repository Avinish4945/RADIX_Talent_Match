<<<<<<< HEAD
"""Talent Check route supporting shared candidate profiles and official benchmarks."""
import os
from typing import Any, Dict
=======
>>>>>>> f47fe0f (fix)
from fastapi import APIRouter, HTTPException

from app.modules.talent_check.scoring import TalentCheckValidationError
from app.modules.talent_check.service import (
    CompanyDatasetError,
    CompanyNotFoundError,
    load_company_names,
    load_job_description,
    run_jd_presence_check,
    run_talent_check,
)
from app.schemas.talent_check import TalentCheckRequest, TalentCheckResponse
from app.services import profile_service

router = APIRouter()

<<<<<<< HEAD
# Official organizer candidate profiles & demo profile
CANDIDATE_PROFILES: Dict[str, Dict[str, Any]] = {
    "demo-candidate": {
        "id": "demo-candidate",
        "name": "Demo Candidate",
        "skills": [
            {"skill_name": "Python", "category_code": "COD", "level": 7, "evidence": "Demo project"},
            {"skill_name": "DSA", "category_code": "DSA", "level": 5, "evidence": "Practice"},
            {"skill_name": "SQL", "category_code": "SQL", "level": 6, "evidence": "Coursework"},
            {"skill_name": "Communication", "category_code": "COMM", "level": 6, "evidence": "Demo profile"},
        ],
    },
    "ananya-rao": {
        "id": "ananya-rao",
        "name": "Ananya Rao (Systems-leaning SWE)",
        "skills": [
            {"skill_name": "C++", "category_code": "COD", "level": 9, "evidence": "Job scheduler in C++"},
            {"skill_name": "Python", "category_code": "COD", "level": 8, "evidence": "Systems capstone"},
            {"skill_name": "Java", "category_code": "COD", "level": 8, "evidence": "OOP parking system"},
            {"skill_name": "DSA", "category_code": "DSA", "level": 8, "evidence": "350+ CP problems"},
            {"skill_name": "Operating Systems", "category_code": "OS", "level": 8, "evidence": "Multithreaded scheduler"},
            {"skill_name": "Computer Networks", "category_code": "NETW", "level": 8, "evidence": "Real-time chat backend"},
            {"skill_name": "Object-Oriented Design", "category_code": "OOD", "level": 8, "evidence": "Factory/Strategy patterns"},
            {"skill_name": "Software Engineering", "category_code": "SWE", "level": 8, "evidence": "Production rate-limiter"},
        ],
    },
    "karthik-subramaniam": {
        "id": "karthik-subramaniam",
        "name": "Karthik Subramaniam (Data Analyst / Scientist)",
        "skills": [
            {"skill_name": "SQL", "category_code": "SQL", "level": 8, "evidence": "Complex query optimization"},
            {"skill_name": "Python", "category_code": "COD", "level": 7, "evidence": "Data pipelines & pandas"},
            {"skill_name": "Machine Learning", "category_code": "AI", "level": 7, "evidence": "Coursera ML Specialization"},
            {"skill_name": "Statistics & Aptitude", "category_code": "APTI", "level": 7, "evidence": "Probability & statistics"},
            {"skill_name": "Software Engineering", "category_code": "SWE", "level": 6, "evidence": "A/B testing basics"},
            {"skill_name": "Communication", "category_code": "COMM", "level": 7, "evidence": "Data storytelling"},
        ],
    },
    "priya-menon": {
        "id": "priya-menon",
        "name": "Priya Menon (Support & Enterprise Ops)",
        "skills": [
            {"skill_name": "SQL", "category_code": "SQL", "level": 5, "evidence": "Basic relational queries"},
            {"skill_name": "Java", "category_code": "COD", "level": 6, "evidence": "Student tracker project"},
            {"skill_name": "Linux basics", "category_code": "OS", "level": 6, "evidence": "Command line troubleshooting"},
            {"skill_name": "Networking fundamentals", "category_code": "NETW", "level": 6, "evidence": "Cisco course"},
            {"skill_name": "Communication", "category_code": "COMM", "level": 7, "evidence": "Client desk troubleshooting"},
            {"skill_name": "Aptitude", "category_code": "APTI", "level": 6, "evidence": "Problem resolution"},
        ],
    },
    "rohan-verma": {
        "id": "rohan-verma",
        "name": "Rohan Verma (Competitive SWE All-Rounder)",
        "skills": [
            {"skill_name": "C++", "category_code": "COD", "level": 9, "evidence": "500+ CP problems"},
            {"skill_name": "Python", "category_code": "COD", "level": 8, "evidence": "Open source contributor"},
            {"skill_name": "SQL", "category_code": "SQL", "level": 8, "evidence": "Schema design"},
            {"skill_name": "DSA", "category_code": "DSA", "level": 9, "evidence": "National hackathon winner"},
            {"skill_name": "System Design", "category_code": "SYSD", "level": 8, "evidence": "Scalable notification service"},
            {"skill_name": "Object-Oriented Design", "category_code": "OOD", "level": 8, "evidence": "Design patterns blog"},
            {"skill_name": "Operating Systems", "category_code": "OS", "level": 8, "evidence": "Linux systems internals"},
            {"skill_name": "Machine Learning", "category_code": "AI", "level": 7, "evidence": "Recommendation engine"},
            {"skill_name": "Software Engineering", "category_code": "SWE", "level": 8, "evidence": "Series-B startup intern"},
            {"skill_name": "Cloud / Docker", "category_code": "CLOUD", "level": 8, "evidence": "Containerized services"},
        ],
    },
}


def get_candidate_profile(candidate_id: str) -> Dict[str, Any]:
    try:
        saved = profile_service.get_profile_by_id(candidate_id)
        if saved:
            return saved
    except Exception:
        pass

    enabled = os.getenv("RADIX_USE_MOCK_PROFILES", "false").lower() in {"1", "true", "yes"}
    if enabled and candidate_id in CANDIDATE_PROFILES:
        return CANDIDATE_PROFILES[candidate_id]

    raise KeyError(candidate_id)
=======

def get_candidate_profile(candidate_id: str) -> dict:
    profile = profile_service.get_profile_by_id(candidate_id)
    if not profile:
        raise KeyError(candidate_id)
    return profile
>>>>>>> f47fe0f (fix)


@router.get("/companies")
def get_companies():
    try:
        return {"companies": load_company_names()}
    except FileNotFoundError as error:
        raise HTTPException(503, detail=str(error)) from error
    except CompanyDatasetError as error:
        raise HTTPException(422, detail=str(error)) from error


@router.get("/candidates")
def get_candidates():
<<<<<<< HEAD
    candidates = profile_service.list_profiles()
    enabled = os.getenv("RADIX_USE_MOCK_PROFILES", "false").lower() in {"1", "true", "yes"}
    if enabled:
        existing_ids = {p["id"] for p in candidates}
        for mid, mprof in CANDIDATE_PROFILES.items():
            if mid not in existing_ids:
                candidates.append({"id": mid, "name": mprof["name"]})
    return {"candidates": candidates}
=======
    return {"candidates": profile_service.list_profiles()}
>>>>>>> f47fe0f (fix)


@router.post("/", response_model=TalentCheckResponse)
def talent_check(payload: TalentCheckRequest):
<<<<<<< HEAD
    profile = None
=======
>>>>>>> f47fe0f (fix)
    if payload.profile:
        candidate = payload.profile
    elif payload.candidate_id:
        try:
<<<<<<< HEAD
            profile = get_candidate_profile(payload.candidate_id)
=======
            candidate = get_candidate_profile(payload.candidate_id)
>>>>>>> f47fe0f (fix)
        except KeyError as error:
            raise HTTPException(
                404,
                detail=f"Candidate '{payload.candidate_id}' not found",
            ) from error
    else:
        raise HTTPException(
            422,
            detail="Either candidate_id or profile must be provided",
        )

    try:
        if payload.jd_id:
            job_description = load_job_description(payload.jd_id)
            if not job_description:
                raise HTTPException(404, detail="Job description not found")
            jd_company = (job_description.get("company") or "").strip()
            if jd_company.casefold() != payload.company.strip().casefold():
                raise HTTPException(
                    422,
                    detail="Selected job description does not belong to this company",
                )
            jd_skills = job_description.get("skills") or []
            if not jd_skills:
                raise HTTPException(
                    422,
                    detail="Selected job description has no extracted skills",
                )
<<<<<<< HEAD
            return run_jd_presence_check(profile, payload.company, jd_skills)
        return run_talent_check(profile, payload.company)
=======
            return run_jd_presence_check(candidate, payload.company, jd_skills)
        return run_talent_check(candidate, payload.company)
>>>>>>> f47fe0f (fix)
    except FileNotFoundError as error:
        raise HTTPException(503, detail=str(error)) from error
    except CompanyNotFoundError as error:
        raise HTTPException(404, detail=str(error)) from error
    except (CompanyDatasetError, TalentCheckValidationError) as error:
        raise HTTPException(422, detail=str(error)) from error
