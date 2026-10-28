from pydantic import BaseModel, Field
from typing import List, Literal, Optional

# 12 RADIX Categories + OTHER
CategoryCode = Literal["COD", "DSA", "OOD", "APTI", "COMM", "AI", "CLOUD", "SQL", "SWE", "SYSD", "NETW", "OS", "OTHER"]

class Skill(BaseModel):
    skill_name: str = Field(description="The specific skill or technology (e.g., Python, React, Data Structures)")
    category_code: CategoryCode = Field(description="The RADIX category this skill belongs to")
    evidence: str = Field(description="A short quote or reason from the resume showing this skill")
    confidence: Literal["high", "medium", "low"] = Field(description="How confident are you that the candidate has this skill")

class ResumeExtraction(BaseModel):
    source_type: Literal["resume"] = "resume"
    source_file: str
    skills: List[Skill]
    education: Optional[str] = Field(default="", description="Summary of education history")
    projects: Optional[str] = Field(default="", description="Summary of projects")
    experience: Optional[str] = Field(default="", description="Summary of work experience/internships")