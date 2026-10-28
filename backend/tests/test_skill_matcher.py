from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.modules.skill_matching.service import SkillMatchRequest, run_match
from app.routes import skill_match_routes


def sk(name, cat="COD", confidence="high"):
    return {"skill_name": name, "category_code": cat, "evidence": "test", "confidence": confidence}


def match(candidate, jd):
    return run_match(SkillMatchRequest(candidate_skills=candidate, jd_skills=jd))


def test_alias_and_exact_match():
    result = match([sk("JS"), sk("python")], [sk("JavaScript"), sk("Python")])
    assert result["match_score"] == 100.0
    assert result["summary"]["matched"] == 2
    assert result["summary"]["missing"] == 0


def test_different_candidates_get_different_scores():
    app = FastAPI()
    app.include_router(skill_match_routes.router, prefix="/api/skill-match")
    client = TestClient(app)
    jd = [sk("Python"), sk("SQL", "SQL"), sk("Docker", "CLOUD")]

    strong = client.post("/api/skill-match", json={
        "candidate_skills": [sk("Python"), sk("SQL", "SQL"), sk("Docker", "CLOUD")],
        "jd_skills": jd,
    }).json()
    weak = client.post("/api/skill-match", json={
        "candidate_skills": [sk("Python")],
        "jd_skills": jd,
    }).json()

    assert strong["match_score"] == 100.0
    assert weak["match_score"] < strong["match_score"]
    assert len(weak["missing_skills"]) == 2
    assert weak["missing_skills"][0]["recommendation_tag"].startswith("learn:")

    # empty jd_skills is rejected
    bad = client.post("/api/skill-match", json={"candidate_skills": [sk("Python")], "jd_skills": []})
    assert bad.status_code == 422


def test_empty_candidate_scores_zero():
    result = match([], [sk("Python"), sk("SQL", "SQL")])
    assert result["match_score"] == 0.0
    assert result["summary"]["missing"] == 2
    assert result["matched_skills"] == []


def test_short_names_are_not_fuzzed():
    # "sql" vs "sqls" would score ~86 with RapidFuzz; short names must be skipped
    result = match([sk("SQLs", "SQL")], [sk("SQL", "SQL")])
    assert result["match_score"] == 0.0
    assert result["summary"]["missing"] == 1


def test_react_vs_react_native_is_partial():
    result = match([sk("React")], [sk("React Native")])
    assert result["summary"]["partial"] == 1
    assert result["summary"]["matched"] == 0
    assert result["match_score"] == 50.0
