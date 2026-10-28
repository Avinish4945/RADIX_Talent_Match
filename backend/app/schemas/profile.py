from pydantic import BaseModel
from typing import List

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
    education: List[Education] = []
    skills: List[str] = []
    projects: List[Project] = []
    internships: List[str] = []
    certifications: List[str] = []
    preferred_roles: List[str] = []