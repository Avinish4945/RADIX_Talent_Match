
from app.utils.skill_categories import SKILL_CATEGORIES

ALLOWED_CONFIDENCE = {"high", "medium", "low"}


def validate_jd_analysis(analysis: dict) -> dict:
    if not isinstance(analysis, dict):
        raise ValueError("JD analysis must be a JSON object")

    for field in ("company", "role"):
        value = analysis.get(field)

        if value is not None and not isinstance(value, str):
            raise ValueError(f"{field} must be a string or null")

    skills = analysis.get("skills")

    if not isinstance(skills, list):
        raise ValueError("Skills must be a list")

    required_fields = {
        "skill_name",
        "category_code",
        "evidence",
        "confidence",
    }

    for index, skill in enumerate(skills):
        if not isinstance(skill, dict):
            raise ValueError(f"Skill at index {index} must be an object")

        if not required_fields.issubset(skill):
            raise ValueError(f"Skill at index {index} is missing required fields")

        if not isinstance(skill["skill_name"], str) or not skill["skill_name"].strip():
            raise ValueError(f"Skill at index {index} has an invalid name")

        if skill["category_code"] not in SKILL_CATEGORIES:
            raise ValueError(
                f"Invalid category code for skill: {skill['skill_name']}"
            )

        if not isinstance(skill["evidence"], str):
            raise ValueError(f"Invalid evidence for skill: {skill['skill_name']}")

        if skill["confidence"] not in ALLOWED_CONFIDENCE:
            raise ValueError(
                f"Invalid confidence for skill: {skill['skill_name']}"
            )

    return analysis
