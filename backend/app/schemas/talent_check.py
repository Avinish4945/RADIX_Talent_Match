from pydantic import BaseModel, Field
class TalentCheckRequest(BaseModel):
    candidate_id: str = Field(min_length=1)
    company: str = Field(min_length=1)
class SkillGapItem(BaseModel):
    category_code: str
    required_level: int = Field(ge=1,le=10)
    candidate_level: int|None = Field(default=None,ge=0,le=10)
    gap_size: int|None = Field(default=None,ge=0,le=10)
    gap: bool|None = None
    status: str
class TalentCheckResponse(BaseModel):
    company: str
    readiness_score: int|None = Field(ge=0,le=100)
    coverage_percent: int = Field(ge=0,le=100)
    skillset_gap: list[SkillGapItem]
