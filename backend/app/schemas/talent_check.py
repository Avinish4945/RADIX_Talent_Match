<<<<<<< HEAD
from typing import Optional
=======
from typing import Literal
from uuid import UUID

>>>>>>> 8cf6984 (api link)
from pydantic import BaseModel, Field


class TalentCheckRequest(BaseModel):
    candidate_id: Optional[str] = None
    company: str = Field(min_length=1)
<<<<<<< HEAD
    profile: Optional[dict] = None
=======
    jd_id: UUID | None = None
>>>>>>> 8cf6984 (api link)


class SkillGapItem(BaseModel):
    category_code: str
<<<<<<< HEAD
    required_level: int = Field(ge=1, le=10)
    candidate_level: Optional[int] = Field(default=None, ge=0, le=10)
    gap_size: Optional[int] = Field(default=None, ge=0, le=10)
    gap: Optional[bool] = None
=======
    skill_name: str | None = None
    candidate_skill: str | None = None
    required_level: int | None = Field(default=None, ge=1, le=10)
    candidate_level: int | None = Field(default=None, ge=0, le=10)
    gap_size: int | None = Field(default=None, ge=0, le=10)
    gap: bool|None = None
>>>>>>> 8cf6984 (api link)
    status: str


class TalentCheckResponse(BaseModel):
    company: str
<<<<<<< HEAD
    readiness_score: Optional[int] = Field(default=None, ge=0, le=100)
=======
    assessment_type: Literal["proficiency", "skills_presence"] = "proficiency"
    readiness_score: int | None = Field(ge=0, le=100)
>>>>>>> 8cf6984 (api link)
    coverage_percent: int = Field(ge=0, le=100)
    skillset_gap: list[SkillGapItem]
