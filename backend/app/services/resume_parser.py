"""Structured resume parser for RADIX Talent Match.

Extracts structured candidate profile data from resume text:
- Personal details (name, email)
- Education (degree, university, year)
- Skills with category_code, evidence, confidence, and proficiency level (0-10)
- Projects (title, description)
- Internships / Hackathons / Experience
- Certifications
- Preferred Roles
"""
import os
import re
from typing import Any, Dict, List, Optional

from app.schemas.common import SkillCategoryCode, SkillEvidence
from app.schemas.profile import CandidateProfile, Education, Project

# Canonical Skill Categories mapping
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
        # Skip section headings or labels
        lower = line.lower()
        if any(h in lower for h in ["resume", "curriculum vitae", "cv", "page", "contact"]):
            continue
        # Match "Name: John Doe"
        name_match = re.search(r"(?:name\s*[:\-]\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)", line, re.IGNORECASE)
        if name_match:
            return name_match.group(1).strip()
        # Direct name line like "Ananya Rao"
        if re.match(r"^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}$", line):
            return line
    return "Candidate"


def _extract_email(text: str, name: str) -> str:
    match = re.search(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", text)
    if match:
        return match.group(0).lower()
    # If no email is explicitly in resume, generate a valid deterministic email from candidate name
    safe_name = re.sub(r"[^a-zA-Z0-9]+", ".", name.strip().lower()).strip(".")
    return f"{safe_name}@example.test" if safe_name else "candidate@example.test"


def _extract_sections(text: str) -> Dict[str, str]:
    """Segment text into standard resume sections."""
    section_patterns = [
        ("education", r"(?:^|\n)\s*(?:education|academic qualifications?|academics)\s*(?:\n|:|\b)"),
        ("skills", r"(?:^|\n)\s*(?:technical skills|skills & expertise|skills|technologies)\s*(?:\n|:|\b)"),
        ("projects", r"(?:^|\n)\s*(?:projects|academic projects|key projects)\s*(?:\n|:|\b)"),
        ("experience", r"(?:^|\n)\s*(?:experience|work experience|hackathons\s*(?:/|&)?\s*internships|internships)\s*(?:\n|:|\b)"),
        ("certifications", r"(?:^|\n)\s*(?:certifications?|courses?)\s*(?:\n|:|\b)"),
        ("achievements", r"(?:^|\n)\s*(?:achievements?|honors?|awards?)\s*(?:\n|:|\b)"),
        ("preferred_roles", r"(?:^|\n)\s*(?:preferred roles?|target roles?|interested roles?)\s*(?:\n|:|\b)"),
    ]

    indices = []
    for sec_name, pattern in section_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            indices.append((match.start(), match.end(), sec_name))

    indices.sort()
    sections = {}
    for i, (start, end, sec_name) in enumerate(indices):
        next_start = indices[i + 1][0] if i + 1 < len(indices) else len(text)
        content = text[end:next_start].strip()
        sections[sec_name] = content

    return sections


def _extract_education(sec_text: str) -> List[Education]:
    results = []
    if not sec_text:
        return results

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
        # Split title and description if there is a colon or dash
        parts = re.split(r"[:—–-]\s+", line, maxsplit=1)
        if len(parts) == 2 and len(parts[0]) < 60:
            title = parts[0].strip()
            desc = parts[1].strip()
        else:
            # Use first few words as title
            words = line.split()
            title = " ".join(words[:5])
            desc = line
        results.append(Project(title=title, description=desc))
    return results


def _estimate_level(skill_norm: str, full_text: str) -> int:
    """Estimate a 0-10 proficiency level based on mentions and contextual evidence."""
    lower_text = full_text.lower()
    score = 6  # default solid working proficiency

    # Check for basic/intro mentions
    if re.search(rf"\b{re.escape(skill_norm)}\s*\((?:basic|exposure|elementary)\)", lower_text):
        return 4

    # High evidence indicators in projects/achievements
    if "finalist" in lower_text or "winner" in lower_text:
        score += 1
    if re.search(r"\b(?:350\+|500\+|competitive programming|capstone|production)\b", lower_text):
        score += 1
    if re.search(rf"\b(?:built|designed|implemented|shipped).*{re.escape(skill_norm)}", lower_text):
        score += 1

    return min(10, max(1, score))


def _extract_skills(sec_text: str, full_text: str) -> List[SkillEvidence]:
    skills: List[SkillEvidence] = []
    seen = set()

    source_text = sec_text if sec_text else full_text
    # Expand nested parentheses like Python (pandas, scikit-learn)
    parenthesized = re.findall(r"\(([^)]+)\)", source_text)
    expanded_text = source_text
    for p in parenthesized:
        expanded_text += f", {p}"

    # Clean out parenthetical blocks from main text so they don't break tokenization
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
            evidence = ev_match.group(0).strip() if ev_match else f"Demonstrated {clean} in coursework/projects"
            level = _estimate_level(norm, full_text)

            skills.append(SkillEvidence(
                skill_name=clean.strip(),
                category_code=cat,
                evidence=evidence[:150],
                confidence="high",
                level=level,
            ))

    # Also scan full text for core known skills if skills section was sparse
    if len(skills) < 3:
        for known_skill, cat in CATEGORY_MAP.items():
            if known_skill in seen:
                continue
            if re.search(rf"\b{re.escape(known_skill)}\b", full_text, re.IGNORECASE):
                seen.add(known_skill)
                ev_match = re.search(rf"[^\n.]*\b{re.escape(known_skill)}[^\n.]*", full_text, re.IGNORECASE)
                evidence = ev_match.group(0).strip() if ev_match else f"Mentioned {known_skill} in resume"
                level = _estimate_level(known_skill, full_text)
                skills.append(SkillEvidence(
                    skill_name=known_skill.title(),
                    category_code=cat,
                    evidence=evidence[:150],
                    confidence="medium",
                    level=level,
                ))

    return skills


def parse_resume_to_structured_profile(text: str, filename: Optional[str] = None) -> CandidateProfile:
    """Parse raw resume text into a fully validated CandidateProfile."""
    cleaned = _clean_text(text)
    lines = [l.strip() for l in cleaned.split("\n") if l.strip()]

    name = _extract_name(lines)
    # If filename contains candidate name, use it if name was ambiguous
    if filename and name == "Candidate":
        clean_file = re.sub(r"\.(?:pdf|docx|txt)$", "", filename, flags=re.IGNORECASE)
        clean_file = clean_file.replace("-", " ").replace("_", " ").strip()
        if clean_file and not clean_file.lower().startswith("resume"):
            name = clean_file

    email = _extract_email(cleaned, name)
    sections = _extract_sections(cleaned)

    education = _extract_education(sections.get("education", ""))
    projects = _extract_projects(sections.get("projects", ""))
    skills = _extract_skills(sections.get("skills", ""), cleaned)

    # Experience / internships
    internships = []
    if "experience" in sections:
        internships = [l.strip() for l in sections["experience"].split("\n") if l.strip()]

    # Certifications
    certifications = []
    if "certifications" in sections:
        for l in sections["certifications"].split("\n"):
            l = l.strip()
            if l and "none listed" not in l.lower():
                certifications.append(l)

    # Preferred roles
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
        internships=internships,
        certifications=certifications,
        preferred_roles=preferred_roles,
    )
