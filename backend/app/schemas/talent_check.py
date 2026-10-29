from typing import Literal, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class TalentCheckRequest(BaseModel):
    candidate_id: Optional[str] = None
    company: str = Field(min_length=1)
    profile: Optional[dict] = None
    jd_id: Optional[UUID] = None


class SkillGapItem(BaseModel):
    category_code: str
    skill_name: Optional[str] = None
    candidate_skill: Optional[str] = None
    required_level: Optional[int] = Field(default=None, ge=1, le=10)
    candidate_level: Optional[int] = Field(default=None, ge=0, le=10)
    gap_size: Optional[int] = Field(default=None, ge=0, le=10)
    gap: Optional[bool] = None
    status: str


class TalentCheckResponse(BaseModel):
    company: str
    assessment_type: Literal["proficiency", "skills_presence"] = "proficiency"
    readiness_score: Optional[int] = Field(default=None, ge=0, le=100)
    coverage_percent: int = Field(ge=0, le=100)
    skillset_gap: list[SkillGapItem]
