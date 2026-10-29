"""Shared Pydantic contracts for RADIX Talent Match.

Keep these canonical fields aligned with the organizer brief. Module-specific
request/response schemas should live beside their module or in this schemas
package. Coordinate contract changes before merging.
"""
from typing import Literal, Optional

from pydantic import BaseModel, Field

SkillCategoryCode = Literal[
    "COD", "DSA", "OOD", "APTI", "COMM", "AI", "CLOUD",
    "SQL", "SWE", "SYSD", "NETW", "OS", "OTHER",
]

Confidence = Literal["low", "medium", "high"]


class SkillEvidence(BaseModel):
    """A categorized skill and its supporting evidence.

    `level` is optional because a skill mention alone does not establish
    proficiency. Talent Check only scores explicit levels from 0 through 10.
    Inferred skills from resume heuristics are flagged with `inferred=True`
    and require explicit candidate review/confirmation.
    """

    skill_name: str = Field(min_length=1)
    category_code: SkillCategoryCode
    evidence: str = ""
    confidence: Confidence = "medium"
    level: Optional[int] = Field(default=None, ge=0, le=10)
    inferred: bool = True
    confirmed_by_candidate: bool = False
    review_status: str = "pending_confirmation"


class CandidateProfile(BaseModel):
    id: str
    name: str
    education: list[dict] = Field(default_factory=list)
    skills: list[SkillEvidence] = Field(default_factory=list)
    hackathons: list[dict] = Field(default_factory=list)
    internships: list[dict] = Field(default_factory=list)
    certifications: list[dict] = Field(default_factory=list)
    preferred_roles: list[str] = Field(default_factory=list)
    cv_file: str | None = None
