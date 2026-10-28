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
    assert response.json() == {
        "filename": "mira-resume.pdf",
        "extracted_text": "Mira Shah\nProduct Designer\nFigma and user research",
    }
    assert not Path(observed["path"]).exists()


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
