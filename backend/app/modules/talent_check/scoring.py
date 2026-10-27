"""Pure deterministic Talent Check scoring."""
from collections.abc import Mapping, Sequence

VALID = {"COD","DSA","OOD","APTI","COMM","AI","CLOUD","SQL","SWE","SYSD","NETW","OS","OTHER"}
class TalentCheckValidationError(ValueError): pass

def _level(v, field, minimum):
    if isinstance(v,bool) or not isinstance(v,(int,float)) or int(v)!=v or not minimum<=int(v)<=10:
        raise TalentCheckValidationError(f"{field} must be an integer from {minimum} to 10")
    return int(v)

def validate_requirements(rows):
    if not isinstance(rows,Sequence) or isinstance(rows,(str,bytes)): raise TalentCheckValidationError("Requirements must be a list")
    result=[]; seen=set()
    for i,row in enumerate(rows):
        if not isinstance(row,Mapping): raise TalentCheckValidationError(f"Requirement {i} must be an object")
        code=row.get("category_code")
        if not isinstance(code,str): raise TalentCheckValidationError(f"Requirement {i} needs category_code")
        code=code.strip().upper()
        if code not in VALID-{"OTHER"}: raise TalentCheckValidationError(f"Invalid company category: {code}")
        if code in seen: raise TalentCheckValidationError(f"Duplicate company category: {code}")
        seen.add(code); result.append({"category_code":code,"required_level":_level(row.get("required_level"),f"{code}.required_level",1)})
    if not result: raise TalentCheckValidationError("Company has no requirements")
    return result

def candidate_levels(profile):
    if not isinstance(profile,Mapping): raise TalentCheckValidationError("Profile must be an object")
    skills=profile.get("skills",[])
    if not isinstance(skills,list): raise TalentCheckValidationError("Profile skills must be a list")
    levels={}
    for i,skill in enumerate(skills):
        if not isinstance(skill,Mapping): raise TalentCheckValidationError(f"Skill {i} must be an object")
        code=skill.get("category_code")
        if not isinstance(code,str) or code.strip().upper() not in VALID: raise TalentCheckValidationError(f"Skill {i} has invalid category_code")
        code=code.strip().upper()
        if skill.get("level") is None: continue
        level=_level(skill["level"],f"skills[{i}].level",0)
        levels[code]=max(levels.get(code,0),level)
    return levels

def score_talent_check(profile,company,requirements):
    if not isinstance(company,str) or not company.strip(): raise TalentCheckValidationError("Company must be non-empty")
    reqs=validate_requirements(requirements); levels=candidate_levels(profile)
    total=sum(r["required_level"] for r in reqs); assessed=earned=0; gaps=[]
    for r in reqs:
        code,required=r["category_code"],r["required_level"]; current=levels.get(code)
        if current is None:
            gaps.append({"category_code":code,"required_level":required,"candidate_level":None,"gap_size":None,"gap":None,"status":"unknown"}); continue
        assessed+=required; earned+=min(current,required); gap=max(0,required-current)
        gaps.append({"category_code":code,"required_level":required,"candidate_level":current,"gap_size":gap,"gap":gap>0,"status":"assessed"})
    return {"company":company.strip(),"readiness_score":round(100*earned/assessed) if assessed else None,
            "coverage_percent":round(100*assessed/total) if total else 0,"skillset_gap":gaps}
