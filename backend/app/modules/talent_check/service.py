"""Load official company requirements and run Talent Check."""
import json, os
from pathlib import Path
from collections.abc import Mapping
from .scoring import validate_requirements, TalentCheckValidationError, score_talent_check
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
