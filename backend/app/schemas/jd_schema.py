
from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


SkillCategory = Literal[
    "COD", "DSA", "OOD", "APTI", "COMM", "AI",
    "CLOUD", "SQL", "SWE", "SYSD", "NETW", "OS", "OTHER"
]

ConfidenceLevel = Literal["high", "medium", "low"]


class Skill(BaseModel):
    skill_name: str
    category_code: SkillCategory
    evidence: str
    confidence: ConfidenceLevel


class JDResponse(BaseModel):
    id: UUID
    source_type: Literal["jd"] = "jd"
    source_file: str
    company: str | None = None
    role: str | None = None
    skills: list[Skill] = Field(default_factory=list)
    created_at: datetime
