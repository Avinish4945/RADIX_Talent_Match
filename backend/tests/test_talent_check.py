import json

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.modules.talent_check.scoring import (
    TalentCheckValidationError,
    score_talent_check,
)
from app.modules.talent_check.service import (
    CompanyDatasetError,
    CompanyNotFoundError,
    load_company_dataset,
    load_company_names,
    run_jd_presence_check,
    run_talent_check,
)
from app.routes import talent_check_routes


REQUIREMENTS = [
    {"category_code": "COD", "required_level": 8},
    {"category_code": "DSA", "required_level": 6},
    {"category_code": "SQL", "required_level": 4},
]
SAVED_CANDIDATE = {
    "id": "candidate-123",
    "name": "Saved Candidate",
    "skills": [
        {
            "skill_name": "Python",
            "category_code": "COD",
            "level": 7,
            "evidence": "Candidate project",
        },
        {
            "skill_name": "DSA",
            "category_code": "DSA",
            "level": 5,
            "evidence": "Candidate practice",
        },
        {
            "skill_name": "SQL",
            "category_code": "SQL",
            "level": 6,
            "evidence": "Candidate coursework",
        },
    ],
}
TEST_APP = FastAPI()
TEST_APP.include_router(talent_check_routes.router, prefix="/api/talent-check")
CLIENT = TestClient(TEST_APP)


@pytest.fixture(autouse=True)
def use_saved_candidate(monkeypatch):
    def get_profile(profile_id):
        if profile_id == SAVED_CANDIDATE["id"]:
            return SAVED_CANDIDATE
        return None

    monkeypatch.setattr(
        talent_check_routes.profile_service,
        "get_profile_by_id",
        get_profile,
    )


def write_dataset(path, companies):
    path.write_text(json.dumps({"companies": companies}), encoding="utf-8")
    return path


def post_check(company="Co"):
    return CLIENT.post(
        "/api/talent-check/",
        json={"candidate_id": SAVED_CANDIDATE["id"], "company": company},
    )


def test_company_and_candidate_selection_options(monkeypatch):
    monkeypatch.setattr(
        talent_check_routes, "load_company_names", lambda: ["Northstar Tech", "DataForge"]
    )
    monkeypatch.setattr(
        talent_check_routes.profile_service,
        "list_profiles",
        lambda: [{"id": SAVED_CANDIDATE["id"], "name": SAVED_CANDIDATE["name"]}],
    )

    companies = CLIENT.get("/api/talent-check/companies")
    candidates = CLIENT.get("/api/talent-check/candidates")

    assert companies.status_code == 200
    assert companies.json() == {"companies": ["Northstar Tech", "DataForge"]}
    assert candidates.status_code == 200
    assert candidates.json() == {
        "candidates": [
            {"id": SAVED_CANDIDATE["id"], "name": SAVED_CANDIDATE["name"]}
        ]
    }


def test_company_options_return_503_when_dataset_is_missing(monkeypatch):
    def missing_dataset():
        raise FileNotFoundError("official data is missing")

    monkeypatch.setattr(
        talent_check_routes,
        "load_company_names",
        missing_dataset,
    )

    response = CLIENT.get("/api/talent-check/companies")

    assert response.status_code == 503
    assert "official data is missing" in response.json()["detail"]


def test_candidate_meeting_all_assessed_requirements_gets_full_score():
    result = score_talent_check(
        {
            "skills": [
                {"category_code": "COD", "level": 8},
                {"category_code": "DSA", "level": 6},
                {"category_code": "SQL", "level": 7},
            ]
        },
        "Co",
        REQUIREMENTS,
    )

    assert result["readiness_score"] == 100
    assert result["coverage_percent"] == 100
    assert all(item["gap"] is False for item in result["skillset_gap"])


def test_candidate_below_requirements_reports_exact_gaps():
    result = score_talent_check(
        {
            "skills": [
                {"category_code": "COD", "level": 6},
                {"category_code": "DSA", "level": 3},
                {"category_code": "SQL", "level": 2},
            ]
        },
        "Co",
        REQUIREMENTS,
    )

    assert result["readiness_score"] == 61
    assert [
        (item["category_code"], item["gap_size"], item["gap"], item["status"])
        for item in result["skillset_gap"]
    ] == [
        ("COD", 2, True, "assessed"),
        ("DSA", 3, True, "assessed"),
        ("SQL", 2, True, "assessed"),
    ]


def test_missing_required_category_is_unknown_and_excluded_from_score():
    result = score_talent_check(
        {"skills": [{"category_code": "COD", "level": 8}]},
        "Co",
        REQUIREMENTS,
    )

    missing = next(
        item for item in result["skillset_gap"] if item["category_code"] == "DSA"
    )
    assert result["readiness_score"] == 100
    assert result["coverage_percent"] == 44
    assert missing == {
        "category_code": "DSA",
        "required_level": 6,
        "candidate_level": None,
        "gap_size": None,
        "gap": None,
        "status": "unknown",
    }


def test_no_assessed_levels_has_null_score_and_zero_coverage():
    result = score_talent_check({"skills": []}, "Co", REQUIREMENTS)

    assert result["readiness_score"] is None
    assert result["coverage_percent"] == 0


@pytest.mark.parametrize(
    "skill",
    [
        {"category_code": "BAD", "level": 2},
        {"category_code": "COD", "level": 11},
    ],
)
def test_invalid_candidate_data_is_rejected(skill):
    with pytest.raises(TalentCheckValidationError):
        score_talent_check({"skills": [skill]}, "Co", REQUIREMENTS)


@pytest.mark.parametrize(
    ("requirements", "message"),
    [
        (
            [{"category_code": "COD", "required_level": 0}],
            "COD.required_level must be an integer from 1 to 10",
        ),
        (
            [
                {"category_code": "COD", "required_level": 5},
                {"category_code": "COD", "required_level": 7},
            ],
            "Duplicate company category: COD",
        ),
    ],
)
def test_invalid_dataset_requirements_return_422(
    tmp_path, monkeypatch, requirements, message
):
    dataset = write_dataset(tmp_path / "companies.json", {"Co": requirements})
    monkeypatch.setattr(
        talent_check_routes,
        "run_talent_check",
        lambda profile, company: run_talent_check(profile, company, dataset),
    )

    response = post_check()

    assert response.status_code == 422
    assert message in response.json()["detail"]


def test_missing_company_returns_clear_404(tmp_path, monkeypatch):
    dataset = write_dataset(tmp_path / "companies.json", {"Co": REQUIREMENTS})
    monkeypatch.setattr(
        talent_check_routes,
        "run_talent_check",
        lambda profile, company: run_talent_check(profile, company, dataset),
    )

    response = post_check("Missing Company")

    assert response.status_code == 404
    assert "No company requirements found for 'Missing Company'" in response.json()[
        "detail"
    ]


def test_unknown_candidate_returns_clear_404(monkeypatch):
    response = CLIENT.post(
        "/api/talent-check/",
        json={"candidate_id": "missing-candidate", "company": "Co"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Candidate 'missing-candidate' not found"


def test_api_response_matches_manual_score_and_gaps(tmp_path, monkeypatch):
    dataset = write_dataset(tmp_path / "companies.json", {"Co": REQUIREMENTS})
    monkeypatch.setattr(
        talent_check_routes,
        "run_talent_check",
        lambda profile, company: run_talent_check(profile, company, dataset),
    )

    response = post_check()

    assert response.status_code == 200
    assert response.json() == {
        "company": "Co",
        "assessment_type": "proficiency",
        "readiness_score": 89,
        "coverage_percent": 100,
        "skillset_gap": [
            {
                "category_code": "COD",
                "skill_name": None,
                "candidate_skill": None,
                "required_level": 8,
                "candidate_level": 7,
                "gap_size": 1,
                "gap": True,
                "status": "assessed",
            },
            {
                "category_code": "DSA",
                "skill_name": None,
                "candidate_skill": None,
                "required_level": 6,
                "candidate_level": 5,
                "gap_size": 1,
                "gap": True,
                "status": "assessed",
            },
            {
                "category_code": "SQL",
                "skill_name": None,
                "candidate_skill": None,
                "required_level": 4,
                "candidate_level": 6,
                "gap_size": 0,
                "gap": False,
                "status": "assessed",
            },
        ],
    }


def test_jd_presence_check_does_not_invent_proficiency_levels():
    result = run_jd_presence_check(
        {
            "skills": [
                "React",
                {
                    "skill_name": "JavaScript",
                    "category_code": "COD",
                    "confidence": "high",
                },
            ]
        },
        "JD Company",
        [
            {
                "skill_name": "React",
                "category_code": "COD",
                "evidence": "Required",
                "confidence": "high",
            },
            {
                "skill_name": "JavaScript",
                "category_code": "COD",
                "evidence": "Required",
                "confidence": "high",
            },
            {
                "skill_name": "TypeScript",
                "category_code": "COD",
                "evidence": "Required",
                "confidence": "medium",
            },
            {
                "skill_name": "React Query",
                "category_code": "COD",
                "evidence": "Required",
                "confidence": "medium",
            },
        ],
    )

    assert result["assessment_type"] == "skills_presence"
    assert result["readiness_score"] is None
    assert result["coverage_percent"] == 50
    assert [(skill["skill_name"], skill["status"]) for skill in result["skillset_gap"]] == [
        ("React", "present"),
        ("JavaScript", "present"),
        ("TypeScript", "missing"),
        ("React Query", "partial"),
    ]
    assert all(skill["required_level"] is None for skill in result["skillset_gap"])


def test_jd_presence_endpoint_uses_saved_jd_skills(monkeypatch):
    jd_id = "00000000-0000-0000-0000-000000000001"
    monkeypatch.setattr(
        talent_check_routes,
        "load_job_description",
        lambda _jd_id: {
            "company": "JD Company",
            "skills": [
                {
                    "skill_name": "Python",
                    "category_code": "COD",
                    "evidence": "JD requirement",
                    "confidence": "high",
                }
            ],
        },
    )

    response = CLIENT.post(
        "/api/talent-check/",
        json={
            "candidate_id": SAVED_CANDIDATE["id"],
            "company": "JD Company",
            "jd_id": jd_id,
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["assessment_type"] == "skills_presence"
    assert body["readiness_score"] is None
    assert body["skillset_gap"][0]["skill_name"] == "Python"
    assert body["skillset_gap"][0]["status"] == "present"


def test_jd_presence_endpoint_rejects_jd_from_another_company(monkeypatch):
    monkeypatch.setattr(
        talent_check_routes,
        "load_job_description",
        lambda _jd_id: {"company": "Other Company", "skills": []},
    )

    response = CLIENT.post(
        "/api/talent-check/",
        json={
            "candidate_id": SAVED_CANDIDATE["id"],
            "company": "JD Company",
            "jd_id": "00000000-0000-0000-0000-000000000001",
        },
    )

    assert response.status_code == 422
    assert "does not belong to this company" in response.json()["detail"]


def test_jd_presence_endpoint_rejects_missing_jd(monkeypatch):
    monkeypatch.setattr(
        talent_check_routes,
        "load_job_description",
        lambda _jd_id: None,
    )

    response = CLIENT.post(
        "/api/talent-check/",
        json={
            "candidate_id": SAVED_CANDIDATE["id"],
            "company": "JD Company",
            "jd_id": "00000000-0000-0000-0000-000000000001",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Job description not found"


def test_jd_presence_endpoint_rejects_job_without_skills(monkeypatch):
    monkeypatch.setattr(
        talent_check_routes,
        "load_job_description",
        lambda _jd_id: {"company": "JD Company", "skills": []},
    )

    response = CLIENT.post(
        "/api/talent-check/",
        json={
            "candidate_id": SAVED_CANDIDATE["id"],
            "company": "JD Company",
            "jd_id": "00000000-0000-0000-0000-000000000001",
        },
    )

    assert response.status_code == 422
    assert (
        response.json()["detail"]
        == "Selected job description has no extracted skills"
    )


def test_talent_check_uses_saved_profile_api_data(tmp_path, monkeypatch):
    dataset = write_dataset(tmp_path / "companies.json", {"Co": REQUIREMENTS})
    observed = {}

    def run(profile, company):
        observed["profile"] = profile
        return run_talent_check(profile, company, dataset)

    monkeypatch.setattr(talent_check_routes, "run_talent_check", run)

    response = post_check()

    assert response.status_code == 200
    assert observed["profile"] == SAVED_CANDIDATE


def test_missing_dataset_returns_clear_503(tmp_path, monkeypatch):
    missing_dataset = tmp_path / "missing.json"
    monkeypatch.setattr(
        talent_check_routes,
        "run_talent_check",
        lambda profile, company: run_talent_check(
            profile, company, missing_dataset
        ),
    )

    response = post_check()

    assert response.status_code == 503
    assert "Official company skillset dataset not found" in response.json()["detail"]
    assert str(missing_dataset) in response.json()["detail"]


def test_bad_dataset_is_rejected(tmp_path):
    dataset = write_dataset(
        tmp_path / "companies.json",
        {"Co": [{"category_code": "BAD", "required_level": 2}]},
    )

    with pytest.raises(CompanyDatasetError):
        load_company_dataset(dataset)


def test_dataset_lookup_and_unknown_company(tmp_path):
    dataset = write_dataset(tmp_path / "companies.json", {"Co": REQUIREMENTS})

    result = run_talent_check({"skills": []}, "Co", dataset)
    assert result["readiness_score"] is None
    with pytest.raises(CompanyNotFoundError):
        run_talent_check({"skills": []}, "Missing", dataset)


def test_structured_profile_builder_skill_with_level_is_scoreable():
    from app.schemas.common import SkillEvidence
    from app.modules.talent_check.scoring import candidate_levels

    skill = SkillEvidence(
        skill_name="Python",
        category_code="COD",
        evidence="Built a project",
        confidence="high",
        level=7,
    )
    assert candidate_levels({"skills": [skill]}) == {"COD": 7}


def test_legacy_string_skill_is_not_guessed_as_proficiency():
    from app.modules.talent_check.scoring import candidate_levels

    assert candidate_levels({"skills": ["Python", "SQL"]}) == {}


def test_official_company_skillsets_fixture():
    from pathlib import Path

    root = Path(__file__).resolve().parents[2]
    fixture = root / "data" / "talent_check_company_skillsets.json"
    payload = json.loads(fixture.read_text(encoding="utf-8"))

    assert payload["_metadata"]["official"] is False
    assert payload["_metadata"]["status"] == "provisional_mapping_requires_human_verification"
    assert "Google LLC" in payload["companies"]
    assert "Microsoft" in payload["companies"]
    assert "Oracle" in payload["companies"]
    assert "Example Company" in payload["companies"]
    assert "Example Company" in payload["_metadata"]["synthetic_fixtures"]
    assert payload["_metadata"]["verified_benchmarks"] == []


def test_talent_check_with_direct_profile_payload(tmp_path, monkeypatch):
    dataset = write_dataset(tmp_path / "companies.json", {"Google LLC": REQUIREMENTS})
    monkeypatch.setattr(
        talent_check_routes,
        "run_talent_check",
        lambda profile, company: run_talent_check(profile, company, dataset),
    )

    response = CLIENT.post(
        "/api/talent-check/",
        json={
            "profile": {
                "skills": [
                    {"category_code": "COD", "level": 9},
                    {"category_code": "DSA", "level": 8},
                    {"category_code": "SQL", "level": 7},
                ]
            },
            "company": "Google LLC",
        },
    )

    assert response.status_code == 200
    assert response.json()["readiness_score"] == 100
    assert response.json()["company"] == "Google LLC"
