"""Structured resume parser for RADIX Talent Match.

Extracts structured candidate profile data from resume text using the same
LLM-extraction pattern as JD Analytics, with fallback to deterministic regex heuristics:
- Personal details (name, email)
- Education (degree, university, year)
- Skills with category_code, evidence, confidence, and proficiency level (0-10)
  Inferred levels and confidences are clearly marked as unconfirmed estimates
  requiring candidate review/confirmation before verified benchmarking.
- Projects (title, description)
- Internships / Experience
- Hackathons / Competitions
- Certifications
- Preferred Roles
"""
import json
import logging
import os
import re
from typing import Any, Dict, List, Optional, Tuple

from dotenv import load_dotenv

from app.schemas.common import SkillCategoryCode, SkillEvidence
from app.schemas.profile import CandidateProfile, Education, Project
from app.utils.skill_categories import SKILL_CATEGORIES, is_valid_category

load_dotenv()
logger = logging.getLogger(__name__)

# Canonical Skill Categories mapping for regex fallback
CATEGORY_MAP: Dict[str, SkillCategoryCode] = {
    # COD
    "python": "COD", "c++": "COD", "cpp": "COD", "java": "COD", "c": "COD",
    "javascript": "COD", "typescript": "COD", "c#": "COD", "golang": "COD",
    "go": "COD", "rust": "COD", "coding": "COD", "programming": "COD",
    # DSA
    "data structures & algorithms": "DSA", "data structures and algorithms": "DSA",
    "data structures": "DSA", "algorithms": "DSA", "dsa": "DSA",
    "competitive programming": "DSA",
    # OOD
    "object-oriented design": "OOD", "object-oriented programming": "OOD",
    "ood": "OOD", "oop": "OOD", "design patterns": "OOD",
    # APTI
    "aptitude": "APTI", "quantitative aptitude": "APTI", "reasoning": "APTI",
    "problem solving": "APTI", "probability & statistics": "APTI",
    "statistics": "APTI", "mathematics": "APTI", "analytical reasoning": "APTI",
    # COMM
    "communication": "COMM", "written communication": "COMM", "verbal communication": "COMM",
    "presentation": "COMM", "client support": "COMM", "technical writing": "COMM",
    # AI
    "machine learning": "AI", "ml": "AI", "deep learning": "AI",
    "artificial intelligence": "AI", "ai": "AI", "nlp": "AI",
    "data science": "AI", "scikit-learn": "AI", "tensorflow": "AI", "pytorch": "AI",
    "pandas": "AI", "data visualization": "AI", "matplotlib": "AI",
    # CLOUD
    "aws": "CLOUD", "azure": "CLOUD", "gcp": "CLOUD", "google cloud": "CLOUD",
    "cloud": "CLOUD", "docker": "CLOUD", "kubernetes": "CLOUD", "k8s": "CLOUD",
    # SQL
    "sql": "SQL", "mysql": "SQL", "postgresql": "SQL", "postgres": "SQL",
    "database": "SQL", "relational database": "SQL", "mongodb": "SQL", "redis": "SQL",
    # SWE
    "git": "SWE", "software engineering": "SWE", "ci/cd": "SWE", "agile": "SWE",
    "unit testing": "SWE", "code review": "SWE", "sdlc": "SWE", "testing": "SWE",
    # SYSD
    "system design": "SYSD", "distributed systems": "SYSD", "microservices": "SYSD",
    "scalability": "SYSD", "api design": "SYSD", "rest api": "SYSD",
    # NETW
    "computer networks": "NETW", "networking": "NETW", "tcp/ip": "NETW",
    "http": "NETW", "dns": "NETW", "cisco": "NETW",
    # OS
    "operating systems": "OS", "os": "OS", "linux": "OS", "unix": "OS",
    "multithreading": "OS", "concurrency": "OS", "process management": "OS",
}


def _clean_text(text: str) -> str:
    return re.sub(r"\r\n|\r", "\n", text).strip()


def _extract_name(lines: List[str]) -> str:
    for line in lines[:5]:
        line = line.strip()
        if not line:
            continue
        lower = line.lower()
        if any(h in lower for h in ["resume", "curriculum vitae", "cv", "page", "contact"]):
            continue
        name_match = re.search(r"(?:name\s*[:\-]\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)", line, re.IGNORECASE)
        if name_match:
            return name_match.group(1).strip()
        if re.match(r"^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}$", line):
            return line
    return "Candidate"


def _extract_email(text: str, name: str) -> str:
    match = re.search(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", text)
    if match:
        return match.group(0).lower()
    safe_name = re.sub(r"[^a-zA-Z0-9]+", ".", name.strip().lower()).strip(".")
    return f"{safe_name}@example.test" if safe_name else "candidate@example.test"


def _extract_sections(text: str) -> Dict[str, str]:
    section_patterns = [
        ("education", r"(?:^|\n)\s*(?:education|academic qualifications?|academics)\s*(?:\n|:|\b)"),
        ("skills", r"(?:^|\n)\s*(?:technical skills|skills & expertise|skills|core competencies|technologies)\s*(?:\n|:|\b)"),
        ("projects", r"(?:^|\n)\s*(?:projects|key projects|academic projects)\s*(?:\n|:|\b)"),
        ("experience", r"(?:^|\n)\s*(?:work experience|experience|internships?|employment history)\s*(?:\n|:|\b)"),
        ("hackathons", r"(?:^|\n)\s*(?:hackathons?|competitions?|achievements?|contests?)\s*(?:\n|:|\b)"),
        ("certifications", r"(?:^|\n)\s*(?:certifications?|certificates?|licenses?)\s*(?:\n|:|\b)"),
        ("preferred_roles", r"(?:^|\n)\s*(?:preferred roles?|target roles?|objective|career objective)\s*(?:\n|:|\b)"),
    ]

    matches = []
    for sec_name, pattern in section_patterns:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            matches.append((match.start(), match.end(), sec_name))

    matches.sort(key=lambda x: x[0])
    sections: Dict[str, str] = {}
    for i, (start, end, sec_name) in enumerate(matches):
        next_start = matches[i + 1][0] if i + 1 < len(matches) else len(text)
        content = text[end:next_start].strip()
        if sec_name not in sections or len(content) > len(sections[sec_name]):
            sections[sec_name] = content

    return sections


def _extract_education(sec_text: str) -> List[Education]:
    results = []
    if not sec_text:
        return [
            Education(
                degree="B.Tech, Computer Science and Engineering",
                university="Engineering Institute",
                year="2026",
            )
        ]

    lines = [l.strip() for l in sec_text.split("\n") if l.strip()]
    for line in lines:
        degree_match = re.search(r"(B\.?Tech|B\.?E\.?|B\.?S\.?|B\.?Sc|M\.?Tech|M\.?S\.?|BCA|MCA)[^—–\-,]*", line, re.IGNORECASE)
        degree = degree_match.group(0).strip() if degree_match else line[:40]

        year_match = re.search(r"\b(20\d\d)\b", line)
        year = year_match.group(1) if year_match else "2026"

        univ_match = re.search(r"(?:at|,|—|–|-)\s*([A-Za-z\s]+(?:University|Institute|College|Academy))", line, re.IGNORECASE)
        university = univ_match.group(1).strip() if univ_match else "Institute of Technology"

        results.append(Education(
            degree=degree,
            university=university,
            year=year,
        ))

    if not results:
        results.append(Education(
            degree="B.Tech, Computer Science and Engineering",
            university="Engineering Institute",
            year="2026",
        ))
    return results


def _extract_projects(sec_text: str) -> List[Project]:
    results = []
    if not sec_text:
        return results

    lines = [l.strip() for l in sec_text.split("\n") if l.strip()]
    for line in lines:
        if len(line) < 5:
            continue
        parts = re.split(r"[:—–-]\s+", line, maxsplit=1)
        if len(parts) == 2 and len(parts[0]) < 60:
            title = parts[0].strip()
            desc = parts[1].strip()
        else:
            words = line.split()
            title = " ".join(words[:5])
            desc = line
        results.append(Project(title=title, description=desc))
    return results


def _estimate_level(skill_norm: str, full_text: str) -> Tuple[int, str, str]:
    lower_text = full_text.lower()
    has_elementary = bool(re.search(rf"\b{re.escape(skill_norm)}\s*\((?:basic|exposure|elementary|beginner)\)", lower_text))
    has_project_evidence = bool(re.search(rf"\b(?:built|designed|implemented|shipped|developed|created).*{re.escape(skill_norm)}", lower_text))
    has_competitive_or_prod = bool(re.search(r"\b(?:350\+|500\+|competitive programming|capstone|production|winner|finalist)\b", lower_text))

    if has_elementary:
        return 4, "low", f"Basic exposure to {skill_norm} in coursework [Estimate: unconfirmed]"
    if has_project_evidence and has_competitive_or_prod:
        return 7, "medium", f"Applied in production/competitive project [Estimate: review required]"
    if has_project_evidence:
        return 6, "medium", f"Demonstrated in project/coursework [Estimate: review required]"

    return 5, "low", f"Listed in resume [Estimate: review required]"


def _extract_skills_regex(sec_text: str, full_text: str) -> List[SkillEvidence]:
    skills: List[SkillEvidence] = []
    seen = set()

    source_text = sec_text if sec_text else full_text
    parenthesized = re.findall(r"\(([^)]+)\)", source_text)
    expanded_text = source_text
    for p in parenthesized:
        expanded_text += f", {p}"

    clean_source = re.sub(r"\([^)]*\)", "", expanded_text)
    raw_tokens = re.split(r"[,;\n•·|]+", clean_source)

    for token in raw_tokens:
        clean = token.strip()
        if not clean or len(clean) > 45 or len(clean) < 2:
            continue

        norm = clean.lower().strip()
        if norm in seen:
            continue

        cat = CATEGORY_MAP.get(norm)
        if not cat:
            for k, c in CATEGORY_MAP.items():
                if k == norm or f" {k} " in f" {norm} " or norm.startswith(k) or k.startswith(norm):
                    cat = c
                    break

        if cat:
            seen.add(norm)
            ev_match = re.search(rf"[^\n.]*\b{re.escape(clean)}[^\n.]*", full_text, re.IGNORECASE)
            level, confidence, note = _estimate_level(norm, full_text)
            evidence = ev_match.group(0).strip() if ev_match else note

            skills.append(SkillEvidence(
                skill_name=clean.strip(),
                category_code=cat,
                evidence=evidence[:150],
                confidence=confidence,  # "medium" or "low", never claiming unverified "high"
                level=level,
                inferred=True,
                confirmed_by_candidate=False,
                review_status="pending_confirmation",
            ))

    if len(skills) < 3:
        for known_skill, cat in CATEGORY_MAP.items():
            if known_skill in seen:
                continue
            if re.search(rf"\b{re.escape(known_skill)}\b", full_text, re.IGNORECASE):
                seen.add(known_skill)
                ev_match = re.search(rf"[^\n.]*\b{re.escape(known_skill)}[^\n.]*", full_text, re.IGNORECASE)
                level, _, note = _estimate_level(known_skill, full_text)
                evidence = ev_match.group(0).strip() if ev_match else note
                skills.append(SkillEvidence(
                    skill_name=known_skill.title(),
                    category_code=cat,
                    evidence=evidence[:150],
                    confidence="low",
                    level=level,
                    inferred=True,
                    confirmed_by_candidate=False,
                    review_status="pending_confirmation",
                ))

    return skills


def parse_resume_with_llm(text: str) -> Optional[CandidateProfile]:
    """Extract structured resume profile using Groq LLM (Component 02)."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None

    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        model = os.getenv("RADIX_LLM_MODEL", "openai/gpt-oss-120b")

        prompt = f"""
Analyze the following candidate resume text.

Extract:
1. Candidate full name.
2. Candidate email address.
3. Education: list of objects with degree, university, year.
4. Skills: list of technical skills and technologies found in the resume.
   Assign exactly one category_code to each skill:
   {json.dumps(SKILL_CATEGORIES)}
   Include:
   - skill_name
   - category_code: (COD, DSA, OOD, APTI, COMM, AI, CLOUD, SQL, SWE, SYSD, NETW, OS, or OTHER)
   - evidence: short quotation or context sentence from the resume
   - confidence: "medium" or "low" (do not use "high" because resume extraction is provisional)
   - level: integer proficiency estimate from 1 to 10 based on projects/experience (e.g. 8 for capstone/production, 6 for project, 5 for mention)
5. Projects: list of objects with title and description.
6. Experience / Internships: list of strings or objects.
7. Hackathons: list of hackathons, competitions, or awards.
8. Certifications: list of certification titles.
9. Preferred roles: list of target roles.

Return only valid JSON with this structure:
{{
  "name": "Candidate Name",
  "email": "candidate@example.com",
  "education": [
    {{"degree": "Degree", "university": "University", "year": "2026"}}
  ],
  "skills": [
    {{
      "skill_name": "Python",
      "category_code": "COD",
      "evidence": "Evidence quote from resume",
      "confidence": "medium",
      "level": 7
    }}
  ],
  "projects": [
    {{"title": "Project Title", "description": "Project description"}}
  ],
  "internships": ["Internship or experience"],
  "hackathons": ["Hackathon achievement"],
  "certifications": ["Certification name"],
  "preferred_roles": ["Software Engineer"]
}}

RESUME TEXT:
{text}
"""
        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert technical resume parser for RADIX Talent Match. "
                        "Extract structured candidate information precisely according to the JSON format."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0,
            response_format={"type": "json_object"},
        )

        data = json.loads(response.choices[0].message.content)
        name = data.get("name") or "Candidate"
        email = data.get("email") or _extract_email(text, name)

        education_raw = data.get("education") or []
        education: List[Education] = []
        for ed in education_raw:
            if isinstance(ed, dict):
                education.append(
                    Education(
                        degree=str(ed.get("degree") or ""),
                        university=str(ed.get("university") or ""),
                        year=str(ed.get("year") or ""),
                    )
                )

        skills_raw = data.get("skills") or []
        skills: List[SkillEvidence] = []
        seen_skills = set()
        for s in skills_raw:
            if not isinstance(s, dict):
                continue
            s_name = str(s.get("skill_name") or s.get("name") or "").strip()
            if not s_name:
                continue
            norm_name = s_name.lower()
            if norm_name in seen_skills:
                continue
            seen_skills.add(norm_name)

            cat_code = str(s.get("category_code") or "").upper().strip()
            if not is_valid_category(cat_code):
                cat_code = CATEGORY_MAP.get(norm_name, "OTHER")

            try:
                lvl = int(s.get("level", 6))
                lvl = max(1, min(10, lvl))
            except (ValueError, TypeError):
                lvl = 6

            # Per audit, inferred resume skills must not claim unconfirmed high confidence
            raw_conf = str(s.get("confidence", "medium")).lower()
            conf = "low" if raw_conf == "low" else "medium"

            skills.append(
                SkillEvidence(
                    skill_name=s_name,
                    category_code=cat_code,
                    evidence=str(s.get("evidence") or f"Extracted from resume")[:150],
                    confidence=conf,
                    level=lvl,
                    inferred=True,
                    confirmed_by_candidate=False,
                    review_status="pending_confirmation",
                )
            )

        projects_raw = data.get("projects") or []
        projects: List[Project] = []
        for pr in projects_raw:
            if isinstance(pr, dict):
                projects.append(
                    Project(
                        title=str(pr.get("title") or "Project"),
                        description=str(pr.get("description") or ""),
                    )
                )
            elif isinstance(pr, str) and pr.strip():
                projects.append(Project(title=pr.strip()[:40], description=pr.strip()))

        internships = [str(i) for i in (data.get("internships") or data.get("experience") or []) if i]
        hackathons = [str(h) for h in (data.get("hackathons") or []) if h]
        certifications = [str(c) for c in (data.get("certifications") or []) if c]
        preferred_roles = [str(r) for r in (data.get("preferred_roles") or ["Software Engineer"]) if r]

        if not skills:
            return None

        return CandidateProfile(
            name=name,
            email=email,
            education=education or _extract_education(""),
            skills=skills,
            projects=projects,
            experience=internships,
            internships=internships,
            hackathons=hackathons,
            certifications=certifications,
            preferred_roles=preferred_roles or ["Software Engineer"],
        )
    except Exception as exc:
        logger.warning("LLM resume extraction failed or timed out; falling back to regex: %s", exc)
        return None


def _parse_resume_regex(text: str, filename: Optional[str] = None) -> CandidateProfile:
    """Deterministic regex heuristic fallback for resume parsing."""
    cleaned = _clean_text(text)
    lines = [l.strip() for l in cleaned.split("\n") if l.strip()]

    name = _extract_name(lines)
    if filename and name == "Candidate":
        clean_file = re.sub(r"\.(?:pdf|docx|txt)$", "", filename, flags=re.IGNORECASE)
        clean_file = clean_file.replace("-", " ").replace("_", " ").strip()
        if clean_file and not clean_file.lower().startswith("resume"):
            name = clean_file

    email = _extract_email(cleaned, name)
    sections = _extract_sections(cleaned)

    education = _extract_education(sections.get("education", ""))
    projects = _extract_projects(sections.get("projects", ""))
    skills = _extract_skills_regex(sections.get("skills", ""), cleaned)

    internships = []
    if "experience" in sections:
        internships = [l.strip() for l in sections["experience"].split("\n") if l.strip()]

    hackathons = []
    if "hackathons" in sections:
        hackathons = [l.strip() for l in sections["hackathons"].split("\n") if l.strip()]

    certifications = []
    if "certifications" in sections:
        for l in sections["certifications"].split("\n"):
            l = l.strip()
            if l and "none listed" not in l.lower():
                certifications.append(l)

    preferred_roles = []
    if "preferred_roles" in sections:
        raw_roles = re.split(r"[,;\n•·|/]+", sections["preferred_roles"])
        preferred_roles = [r.strip() for r in raw_roles if r.strip()]
    if not preferred_roles:
        preferred_roles = ["Software Engineer"]

    return CandidateProfile(
        name=name,
        email=email,
        education=education,
        skills=skills,
        projects=projects,
        experience=internships,
        internships=internships,
        hackathons=hackathons,
        certifications=certifications,
        preferred_roles=preferred_roles,
    )


def parse_resume_to_structured_profile(text: str, filename: Optional[str] = None) -> CandidateProfile:
    """Parse raw resume text into a CandidateProfile with reviewable inferred skills.

    Attempts Groq LLM extraction first (mirroring JD Analytics), and falls back
    to deterministic regex heuristics if the LLM is unconfigured, offline, or errors.
    """
    # Allow tests to force regex-only via env
    force_regex = os.getenv("RADIX_RESUME_FORCE_REGEX", "false").lower() in {"1", "true", "yes"}
    if not force_regex and os.getenv("GROQ_API_KEY"):
        llm_profile = parse_resume_with_llm(text)
        if llm_profile:
            return llm_profile

    return _parse_resume_regex(text, filename)
