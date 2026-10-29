"""Skill Matching (stateless): compare candidate skills against JD skills.

Matching order for each JD skill:
  exact -> alias dictionary -> RapidFuzz -> token containment.
Names of 4 characters or fewer are never fuzzed.

Credit: exact/alias 1.0, fuzzy 0.9, partial 0.5, missing 0.
A candidate skill with confidence "low" gets its credit x0.8.
match_score = average credit over unique JD skills, as a percentage.
"""
import re
from typing import Dict, List, Optional

from pydantic import BaseModel, Field, field_validator
try:
    from rapidfuzz import fuzz
except ImportError:
    import difflib

    class _FuzzFallback:
        @staticmethod
        def ratio(s1: str, s2: str) -> float:
            return difflib.SequenceMatcher(None, str(s1 or ""), str(s2 or "")).ratio() * 100.0

    fuzz = _FuzzFallback()

CATEGORY_CODES = {
    "COD", "DSA", "OOD", "APTI", "COMM", "AI", "CLOUD",
    "SQL", "SWE", "SYSD", "NETW", "OS", "OTHER",
}
CONFIDENCE_LEVELS = {"high", "medium", "low"}

CREDIT_EXACT = 1.0
CREDIT_FUZZY = 0.9
CREDIT_PARTIAL = 0.5
LOW_CONFIDENCE_FACTOR = 0.8


# ---------- models ----------
class Skill(BaseModel):
    skill_name: str
    category_code: str = "OTHER"
    evidence: str = ""
    confidence: str = "medium"

    @field_validator("category_code", mode="before")
    @classmethod
    def _clean_category(cls, v):
        v = str(v or "OTHER").strip().upper()
        return v if v in CATEGORY_CODES else "OTHER"

    @field_validator("confidence", mode="before")
    @classmethod
    def _clean_confidence(cls, v):
        v = str(v or "medium").strip().lower()
        return v if v in CONFIDENCE_LEVELS else "medium"

    @field_validator("evidence", mode="before")
    @classmethod
    def _clean_evidence(cls, v):
        return "" if v is None else str(v)


class SkillMatchRequest(BaseModel):
    candidate_skills: List[Skill] = Field(default_factory=list)
    jd_skills: List[Skill] = Field(default_factory=list)
    candidate_id: Optional[str] = None
    jd_source_file: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None


# ---------- normalisation + aliases ----------
def normalize(name: str) -> str:
    """Lowercase, remove most punctuation, keep + # . (c++, c#, node.js)."""
    s = (name or "").lower().strip()
    s = s.replace("&", " and ")
    s = re.sub(r"[\-_/\\,;:()\[\]]+", " ", s)
    s = re.sub(r"[^a-z0-9+#. ]", "", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s.rstrip(".")


# canonical name -> variants (all written in plain lowercase)
_ALIAS_SOURCE: Dict[str, List[str]] = {
    "javascript": ["js", "java script", "ecmascript", "es6"],
    "typescript": ["ts"],
    "python": ["py", "python3", "python 3"],
    "node.js": ["nodejs", "node js", "node"],
    "react": ["reactjs", "react.js", "react js"],
    "react native": ["reactnative"],
    "c++": ["cpp", "cplusplus"],
    "c#": ["csharp", "c sharp"],
    "sql": ["structured query language"],
    "postgresql": ["postgres", "psql"],
    "mongodb": ["mongo", "mongo db"],
    "machine learning": ["ml"],
    "deep learning": ["dl"],
    "artificial intelligence": ["ai"],
    "natural language processing": ["nlp"],
    "data structures and algorithms": ["dsa", "data structures", "ds and algo", "ds algo"],
    "object oriented programming": ["oop", "oops", "ood", "object oriented design"],
    "amazon web services": ["aws"],
    "google cloud platform": ["gcp", "google cloud"],
    "microsoft azure": ["azure"],
    "kubernetes": ["k8s"],
    "continuous integration": ["ci", "ci cd", "cicd"],
    "operating systems": ["os", "operating system"],
    "computer networks": ["networking", "computer networking", "cn"],
    "system design": ["sysd", "hld", "high level design"],
    "communication": ["communication skills", "verbal communication"],
    "aptitude": ["apti", "quantitative aptitude"],
    "problem solving": ["problem solving skills"],
    "html": ["html5"],
    "css": ["css3"],
    "rest api": ["restful api", "rest apis", "restful apis", "rest"],
    "fastapi": ["fast api"],
    "scikit learn": ["sklearn"],
    "version control": ["git"],
}

ALIASES: Dict[str, str] = {}
for _canon, _variants in _ALIAS_SOURCE.items():
    _c = normalize(_canon)
    ALIASES[_c] = _c
    for _v in _variants:
        ALIASES[normalize(_v)] = _c


def canonical(norm_name: str) -> str:
    return ALIASES.get(norm_name, norm_name)


# ---------- matching ----------
def _score_pair(jd_norm: str, cand_norm: str):
    """Return (match_type, credit) for one JD/candidate pair, or None."""
    if jd_norm == cand_norm:
        return ("exact", CREDIT_EXACT)

    jd_c, cand_c = canonical(jd_norm), canonical(cand_norm)
    if jd_c == cand_c:
        return ("alias", CREDIT_EXACT)

    options = []

    # RapidFuzz - never for names of 4 characters or fewer
    if len(jd_c) > 4 and len(cand_c) > 4:
        ratio = fuzz.ratio(jd_c, cand_c)
        if ratio >= 90:
            options.append(("fuzzy", CREDIT_FUZZY))
        elif ratio >= 75:
            options.append(("partial", CREDIT_PARTIAL))

    # Token containment ("react" inside "react native")
    jd_tokens, cand_tokens = set(jd_c.split()), set(cand_c.split())
    if jd_tokens < cand_tokens and not _tiny(jd_tokens):
        options.append(("fuzzy", CREDIT_FUZZY))      # candidate more specific
    elif cand_tokens < jd_tokens and not _tiny(cand_tokens):
        options.append(("partial", CREDIT_PARTIAL))  # candidate broader

    if not options:
        return None
    return max(options, key=lambda o: o[1])


def _tiny(tokens) -> bool:
    """A single token of 2 characters or fewer is too weak to count."""
    return len(tokens) == 1 and len(next(iter(tokens))) <= 2


def _best_match(jd_skill: Skill, candidate_skills: List[Skill]) -> Optional[dict]:
    jd_norm = normalize(jd_skill.skill_name)
    best = None
    for cand in candidate_skills:
        cand_norm = normalize(cand.skill_name)
        if not cand_norm:
            continue
        result = _score_pair(jd_norm, cand_norm)
        if result is None:
            continue
        match_type, credit = result
        if cand.confidence == "low":
            credit *= LOW_CONFIDENCE_FACTOR
        if best is None or credit > best["credit"]:
            best = {"candidate": cand, "match_type": match_type, "credit": credit}
    return best


def _unique_jd_skills(jd_skills: List[Skill]) -> List[Skill]:
    seen, unique = set(), []
    for s in jd_skills:
        key = canonical(normalize(s.skill_name))
        if not key or key in seen:
            continue
        seen.add(key)
        unique.append(s)
    return unique


def run_match(req: SkillMatchRequest) -> dict:
    jd_list = _unique_jd_skills(req.jd_skills)
    matched, partial, missing = [], [], []
    total_credit = 0.0
    breakdown: Dict[str, dict] = {}

    for jd in jd_list:
        cat = breakdown.setdefault(
            jd.category_code,
            {"total": 0, "matched": 0, "partial": 0, "missing": 0, "_credit": 0.0},
        )
        cat["total"] += 1
        best = _best_match(jd, req.candidate_skills)

        if best is None:
            cat["missing"] += 1
            missing.append({
                "skill_name": jd.skill_name,
                "category_code": jd.category_code,
                "priority": jd.confidence,
                "recommendation_tag": f"learn:{jd.category_code}",
            })
            continue

        credit = best["credit"]
        total_credit += credit
        cat["_credit"] += credit
        entry = {
            "skill_name": jd.skill_name,
            "category_code": jd.category_code,
            "candidate_skill": best["candidate"].skill_name,
            "match_type": best["match_type"],
            "credit": round(credit, 2),
            "evidence": best["candidate"].evidence,
            "candidate_confidence": best["candidate"].confidence,
        }
        if best["match_type"] == "partial":
            cat["partial"] += 1
            partial.append(entry)
        else:
            cat["matched"] += 1
            matched.append(entry)

    for cat in breakdown.values():
        credit = cat.pop("_credit")
        cat["score"] = round(credit / cat["total"] * 100, 1) if cat["total"] else 0.0

    count = len(jd_list)
    match_score = round(total_credit / count * 100, 1) if count else 0.0

    return {
        "candidate_id": req.candidate_id,
        "jd_source_file": req.jd_source_file,
        "company": req.company,
        "role": req.role,
        "match_score": match_score,
        "matched_skills": matched,
        "missing_skills": missing,
        "partial_matches": partial,
        "summary": {
            "jd_skill_count": count,
            "candidate_skill_count": len(req.candidate_skills),
            "matched": len(matched),
            "partial": len(partial),
            "missing": len(missing),
        },
        "category_breakdown": breakdown,
        "notes": [
            "'Missing' means the skill was not found in the candidate's "
            "evidence. It is not proof the candidate lacks the skill.",
            "Credit: exact/alias 1.0, fuzzy 0.9, partial 0.5; x0.8 when the "
            "candidate skill has low confidence.",
        ],
    }
