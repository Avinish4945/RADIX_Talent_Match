from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.routes import resume_routes


TEST_APP = FastAPI()
TEST_APP.include_router(resume_routes.router, prefix="/api/resume")
CLIENT = TestClient(TEST_APP)


def test_resume_parse_returns_text_from_uploaded_file(monkeypatch):
    observed = {}

    def fake_extract_text(path):
        observed["path"] = path
        return "Mira Shah\nProduct Designer\nFigma and user research"

    monkeypatch.setattr(resume_routes, "extract_text", fake_extract_text)

    response = CLIENT.post(
        "/api/resume/parse",
        files={
            "file": (
                "mira-resume.pdf",
                b"%PDF-1.4 fixture",
                "application/pdf",
            )
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "mira-resume.pdf"
    assert data["extracted_text"] == "Mira Shah\nProduct Designer\nFigma and user research"
    assert "profile" in data
    assert data["profile"]["name"] == "Mira Shah"
    assert not Path(observed["path"]).exists()


def test_resume_parse_returns_structured_profile(monkeypatch):
    def sample_resume(_path):
        return (
            "Ananya Rao\n"
            "Education\n"
            "B.Tech, Computer Science and Engineering, Class of 2026\n"
            "Technical Skills\n"
            "Python, C++, Data Structures & Algorithms, SQL\n"
            "Projects\n"
            "Distributed URL Shortener: Built scalable service\n"
            "Preferred Roles\n"
            "Software Engineer\n"
        )

    monkeypatch.setattr(resume_routes, "extract_text", sample_resume)

    response = CLIENT.post(
        "/api/resume/parse",
        files={"file": ("ananya.pdf", b"pdf content", "application/pdf")},
    )

    assert response.status_code == 200
    profile = response.json()["profile"]
    assert profile["name"] == "Ananya Rao"
    assert len(profile["skills"]) >= 3
    skill_names = [s["skill_name"] for s in profile["skills"]]
    assert any("Python" in s for s in skill_names)
    assert any("Data Structures" in s for s in skill_names)
    for skill in profile["skills"]:
        assert skill["inferred"] is True
        assert skill["confirmed_by_candidate"] is False
        assert skill["confidence"] in {"low", "medium"}


def test_resume_parse_rejects_unsupported_extension():
    response = CLIENT.post(
        "/api/resume/parse",
        files={"file": ("resume.txt", b"resume", "text/plain")},
    )

    assert response.status_code == 400
    assert "PDF and DOCX" in response.json()["detail"]


def test_resume_parse_rejects_oversized_file():
    response = CLIENT.post(
        "/api/resume/parse",
        files={
            "file": (
                "resume.pdf",
                b"x" * (resume_routes.MAX_FILE_SIZE + 1),
                "application/pdf",
            )
        },
    )

    assert response.status_code == 413
    assert "10 MB or smaller" in response.json()["detail"]


def test_resume_parse_reports_unreadable_document(monkeypatch):
    def unreadable(_path):
        raise ValueError("No readable text")

    monkeypatch.setattr(resume_routes, "extract_text", unreadable)
    response = CLIENT.post(
        "/api/resume/parse",
        files={"file": ("resume.pdf", b"invalid", "application/pdf")},
    )

    assert response.status_code == 422
    assert "Unable to extract readable text" in response.json()["detail"]


def test_resume_parse_with_llm_extractor(monkeypatch):
    import json
    from unittest.mock import MagicMock, patch
    from app.services import resume_parser

    mock_llm_output = {
        "name": "Ananya Rao",
        "email": "ananya@example.test",
        "education": [{"degree": "B.Tech CSE", "university": "IIT", "year": "2026"}],
        "skills": [
            {"skill_name": "C++", "category_code": "COD", "evidence": "Job scheduler in C++", "confidence": "high", "level": 8},
            {"skill_name": "System Design", "category_code": "SYSD", "evidence": "Scalable service", "confidence": "medium", "level": 7},
        ],
        "projects": [{"title": "Job Scheduler", "description": "Built in C++"}],
        "internships": ["SWE Intern"],
        "hackathons": ["National Hackathon Finalist"],
        "certifications": ["AWS Certified"],
        "preferred_roles": ["Systems Engineer"],
    }

    mock_client = MagicMock()
    mock_resp = MagicMock()
    mock_resp.choices = [MagicMock(message=MagicMock(content=json.dumps(mock_llm_output)))]
    mock_client.chat.completions.create.return_value = mock_resp

    monkeypatch.setenv("GROQ_API_KEY", "test-groq-key")
    monkeypatch.delenv("RADIX_RESUME_FORCE_REGEX", raising=False)

    with patch("groq.Groq", return_value=mock_client):
        profile = resume_parser.parse_resume_with_llm("Resume text for Ananya Rao")

    assert profile is not None
    assert profile.name == "Ananya Rao"
    assert len(profile.skills) == 2
    assert profile.skills[0].skill_name == "C++"
    assert profile.skills[0].category_code == "COD"
    assert profile.skills[0].level == 8
    assert profile.skills[0].confidence == "medium"
    assert profile.skills[0].inferred is True
    assert profile.skills[0].confirmed_by_candidate is False
    assert "National Hackathon Finalist" in profile.hackathons
