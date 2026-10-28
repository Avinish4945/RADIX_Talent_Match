"""Regression tests for the shared Profile Builder / Talent Check contract."""
import json
from pathlib import Path

from app.modules.talent_check.scoring import candidate_levels
from app.schemas.common import SkillEvidence
from app.schemas.profile import CandidateProfile


def test_structured_profile_builder_skill_with_level_is_scoreable():
    profile = CandidateProfile(
        name="Test Candidate",
        email="candidate@example.test",
        skills=[
            {
                "skill_name": "Python",
                "category_code": "COD",
                "evidence": "Built a project",
                "confidence": "high",
                "level": 7,
            }
        ],
    )
    assert isinstance(profile.skills[0], SkillEvidence)
    assert candidate_levels({"skills": profile.skills}) == {"COD": 7}


def test_legacy_string_skill_is_accepted_but_not_guessed_as_proficiency():
    profile = CandidateProfile(
        name="Legacy Candidate",
        email="legacy@example.test",
        skills=["Python", "SQL"],
    )
    assert profile.skills == ["Python", "SQL"]
    assert candidate_levels({"skills": profile.skills}) == {}


def test_skill_without_explicit_level_is_unknown():
    skill = SkillEvidence(
        skill_name="Python",
        category_code="COD",
        evidence="Mentioned in resume",
    )
    assert candidate_levels({"skills": [skill]}) == {}


def test_synthetic_fixture_is_explicitly_non_official():
    root = Path(__file__).resolve().parents[2]
    fixture = root / "data" / "talent_check_company_skillsets.json"
    payload = json.loads(fixture.read_text(encoding="utf-8"))

    assert payload["_metadata"]["official"] is False
    assert "Example Company" in payload["companies"]
