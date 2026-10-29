<<<<<<< HEAD
from typing import Literal, Optional
from uuid import UUID
=======
from typing import Literal
from uuid import UUID

>>>>>>> f47fe0f (fix)
from pydantic import BaseModel, Field


class TalentCheckRequest(BaseModel):
    candidate_id: str | None = Field(default=None, min_length=1)
    company: str = Field(min_length=1)
<<<<<<< HEAD
    profile: Optional[dict] = None
    jd_id: Optional[UUID] = None
=======
    profile: dict | None = None
    jd_id: UUID | None = None
>>>>>>> f47fe0f (fix)


class SkillGapItem(BaseModel):
    category_code: str
<<<<<<< HEAD
    skill_name: Optional[str] = None
    candidate_skill: Optional[str] = None
    required_level: Optional[int] = Field(default=None, ge=1, le=10)
    candidate_level: Optional[int] = Field(default=None, ge=0, le=10)
    gap_size: Optional[int] = Field(default=None, ge=0, le=10)
    gap: Optional[bool] = None
=======
    skill_name: str | None = None
    candidate_skill: str | None = None
    required_level: int | None = Field(default=None, ge=1, le=10)
    candidate_level: int | None = Field(default=None, ge=0, le=10)
    gap_size: int | None = Field(default=None, ge=0, le=10)
    gap: bool | None = None
>>>>>>> f47fe0f (fix)
    status: str


class TalentCheckResponse(BaseModel):
    company: str
    assessment_type: Literal["proficiency", "skills_presence"] = "proficiency"
<<<<<<< HEAD
    readiness_score: Optional[int] = Field(default=None, ge=0, le=100)
=======
    readiness_score: int | None = Field(default=None, ge=0, le=100)
>>>>>>> f47fe0f (fix)
    coverage_percent: int = Field(ge=0, le=100)
    skillset_gap: list[SkillGapItem]
