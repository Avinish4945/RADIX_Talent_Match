"""Temporary mock-backed Talent Check route; replace profile adapter after Profile Builder integration."""
import os
from fastapi import APIRouter, HTTPException
from app.schemas.talent_check import TalentCheckRequest, TalentCheckResponse
from app.modules.talent_check.scoring import TalentCheckValidationError
from app.modules.talent_check.service import CompanyDatasetError, CompanyNotFoundError, run_talent_check
router=APIRouter()
MOCK_PROFILES={"demo-candidate":{"id":"demo-candidate","name":"Demo Candidate","skills":[
 {"skill_name":"Python","category_code":"COD","level":7,"evidence":"Demo project"},
 {"skill_name":"DSA","category_code":"DSA","level":5,"evidence":"Practice"},
 {"skill_name":"SQL","category_code":"SQL","level":6,"evidence":"Coursework"},
 {"skill_name":"Communication","category_code":"COMM","level":6,"evidence":"Demo profile"}]}}
def get_candidate_profile(candidate_id):
    enabled=os.getenv("RADIX_USE_MOCK_PROFILES","true").lower() in {"1","true","yes"}
    if enabled and candidate_id in MOCK_PROFILES: return MOCK_PROFILES[candidate_id]
    raise KeyError(candidate_id)
@router.post("/",response_model=TalentCheckResponse)
def talent_check(payload:TalentCheckRequest):
    try: return run_talent_check(get_candidate_profile(payload.candidate_id),payload.company)
    except KeyError: raise HTTPException(404,detail=f"Candidate '{payload.candidate_id}' not found")
    except FileNotFoundError as e: raise HTTPException(503,detail=str(e))
    except CompanyNotFoundError as e: raise HTTPException(404,detail=str(e))
    except (CompanyDatasetError,TalentCheckValidationError) as e: raise HTTPException(422,detail=str(e))
