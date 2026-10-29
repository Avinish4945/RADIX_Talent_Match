"""Profile Builder API schema.

Structured skill evidence is preferred. Legacy string skills are accepted for
backwards compatibility with the current form, but cannot be scored by Talent
Check until they have a category and an explicit proficiency level.
"""
from typing import Any, List, Optional, Union

from pydantic import BaseModel, Field, field_validator

from app.schemas.common import SkillEvidence


class Education(BaseModel):
    degree: str = ""
    university: str = ""
    year: str = ""


class Project(BaseModel):
    title: str = ""
    description: str = ""


class CandidateProfile(BaseModel):
    id: Optional[str] = None
    name: str = ""
    email: str = ""
    role: Optional[str] = ""
    education: List[Union[Education, dict, str]] = Field(default_factory=list)
    skills: List[Union[str, SkillEvidence]] = Field(default_factory=list)
    projects: List[Union[Project, dict]] = Field(default_factory=list)
    experience: List[Union[dict, str]] = Field(default_factory=list)
    internships: List[Union[dict, str]] = Field(default_factory=list)
    certifications: List[Union[dict, str]] = Field(default_factory=list)
    preferred_roles: List[str] = Field(default_factory=list)

    @field_validator("education", mode="before")
    @classmethod
    def normalize_education(cls, v: Any) -> Any:
        if isinstance(v, str):
            clean = v.strip()
            return [{"degree": clean, "university": "", "year": ""}] if clean else []
        if isinstance(v, dict):
            return [v]
        return v or []

    @field_validator("projects", mode="before")
    @classmethod
    def normalize_projects(cls, v: Any) -> Any:
        if isinstance(v, list):
            res = []
            for item in v:
                if isinstance(item, str):
                    res.append({"title": item, "description": ""})
                else:
                    res.append(item)
            return res
        return v or []
