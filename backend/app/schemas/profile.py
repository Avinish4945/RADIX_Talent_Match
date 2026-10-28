"""Profile Builder API schema.

Structured skill evidence is preferred. Legacy string skills are accepted for
backwards compatibility with the current form, but cannot be scored by Talent
Check until they have a category and an explicit proficiency level.
"""
from typing import List, Union

from pydantic import BaseModel, Field

from app.schemas.common import SkillEvidence


class Education(BaseModel):
    degree: str
    university: str
    year: str


class Project(BaseModel):
    title: str
    description: str


class CandidateProfile(BaseModel):
    name: str
    email: str
    education: List[Education] = Field(default_factory=list)
    skills: List[Union[str, SkillEvidence]] = Field(default_factory=list)
    projects: List[Project] = Field(default_factory=list)
    internships: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    preferred_roles: List[str] = Field(default_factory=list)
