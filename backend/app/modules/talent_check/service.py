"""Load official company requirements and run Talent Check."""
import json, os
from pathlib import Path
from collections.abc import Mapping
from .scoring import validate_requirements, TalentCheckValidationError, score_talent_check
from app.modules.skill_matching.service import SkillMatchRequest, run_match
from app.services.supabase_client import supabase
class CompanyDatasetError(ValueError): pass
class CompanyNotFoundError(LookupError): pass
ROOT=Path(__file__).resolve().parents[4]
def _load_company_entries(path=None):
    path=Path(path or os.getenv("RADIX_COMPANY_SKILLSETS_PATH",ROOT/"data"/"talent_check_company_skillsets.json"))
    if not path.is_file(): raise FileNotFoundError(f"Official company skillset dataset not found at {path}; add the organizer-provided JSON.")
    try: payload=json.loads(path.read_text(encoding="utf-8"))
    except (OSError,json.JSONDecodeError) as e: raise CompanyDatasetError(f"Could not read company JSON: {e}") from e
    companies=payload.get("companies") if isinstance(payload,Mapping) else None
    if isinstance(companies,Mapping): pairs=companies.items()
    elif isinstance(companies,list):
        pairs=[]
        for item in companies:
            if not isinstance(item,Mapping) or not isinstance(item.get("name"),str): raise CompanyDatasetError("Each company entry needs a name")
            pairs.append((item["name"],item.get("requirements",item.get("skills"))))
    else: raise CompanyDatasetError("Dataset needs a 'companies' object or list")
    entries=[]
    for name,rows in pairs:
        if not isinstance(name,str) or not name.strip(): raise CompanyDatasetError("Company names must be non-empty")
        entries.append((name.strip(),rows))
    return entries

def load_company_dataset(path=None):
    result={}
    for name,rows in _load_company_entries(path):
        try: result[name.casefold()]=validate_requirements(rows)
        except (TypeError,TalentCheckValidationError) as e: raise CompanyDatasetError(f"Invalid requirements for {name}: {e}") from e
    return result

def load_company_names(path=None):
    entries=_load_company_entries(path)
    for name,rows in entries:
        try: validate_requirements(rows)
        except (TypeError,TalentCheckValidationError) as e: raise CompanyDatasetError(f"Invalid requirements for {name}: {e}") from e
    return [name for name,_ in entries]

def run_talent_check(profile,company,dataset_path=None):
    companies=load_company_dataset(dataset_path)
    rows=companies.get(company.strip().casefold()) if isinstance(company,str) else None
    if rows is None: raise CompanyNotFoundError(f"No company requirements found for '{company}'")
    return score_talent_check(profile,company,rows)


def load_job_description(jd_id):
    response = (
        supabase.table("job_descriptions")
        .select("id, company, skills")
        .eq("id", str(jd_id))
        .limit(1)
        .execute()
    )
    return response.data[0] if response.data else None


def run_jd_presence_check(profile, company, jd_skills):
    candidate_skills = []
    for skill in profile.get("skills", []):
        if isinstance(skill, str):
            candidate_skills.append(
                {
                    "skill_name": skill,
                    "category_code": "OTHER",
                    "evidence": "Listed in candidate profile",
                    "confidence": "medium",
                }
            )
        else:
            candidate_skills.append(skill)

    match = run_match(
        SkillMatchRequest(
            candidate_skills=candidate_skills,
            jd_skills=jd_skills,
        )
    )
    matched = {
        item["skill_name"]: item
        for item in match["matched_skills"] + match["partial_matches"]
    }
    partial_names = {item["skill_name"] for item in match["partial_matches"]}
    missing_names = {item["skill_name"] for item in match["missing_skills"]}
    skillset_gap = []

    for skill in jd_skills:
        skill_name = skill["skill_name"]
        matched_skill = matched.get(skill_name)
        if skill_name in partial_names or (
            matched_skill
            and matched_skill.get("match_type") not in {"exact", "alias"}
        ):
            status = "partial"
        elif matched_skill:
            status = "present"
        elif skill_name in missing_names:
            status = "missing"
        else:
            continue
        skillset_gap.append(
            {
                "category_code": skill["category_code"],
                "skill_name": skill_name,
                "candidate_skill": (matched_skill or {}).get("candidate_skill"),
                "required_level": None,
                "candidate_level": None,
                "gap_size": None,
                "gap": status == "missing",
                "status": status,
            }
        )

    present_count = sum(skill["status"] == "present" for skill in skillset_gap)
    coverage = round(100 * present_count / len(skillset_gap)) if skillset_gap else 0
    return {
        "company": company.strip(),
        "assessment_type": "skills_presence",
        "readiness_score": None,
        "coverage_percent": coverage,
        "skillset_gap": skillset_gap,
    }
