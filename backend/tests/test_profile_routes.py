import os
from unittest.mock import patch

from fastapi import FastAPI
from fastapi.testclient import TestClient

with patch.dict(
    os.environ,
    {
        "SUPABASE_URL": "https://example.supabase.co",
        "SUPABASE_KEY": "test-key",
    },
):
    from app.routes import profile_routes


TEST_APP = FastAPI()
TEST_APP.include_router(profile_routes.router)
CLIENT = TestClient(TEST_APP)


def test_create_profile_returns_saved_id(monkeypatch):
    monkeypatch.setattr(
        profile_routes.profile_service,
        "save_profile",
        lambda _profile: "profile-123",
    )

    response = CLIENT.post(
        "/api/profiles",
        json={"name": "Test Candidate", "email": "candidate@example.test"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "id": "profile-123",
        "message": "Profile saved successfully",
    }


def test_create_profile_does_not_expose_internal_errors(monkeypatch):
    def fail_to_save(_profile):
        raise RuntimeError("database credentials leaked")

    monkeypatch.setattr(profile_routes.profile_service, "save_profile", fail_to_save)
    client = TestClient(TEST_APP, raise_server_exceptions=False)

    response = client.post(
        "/api/profiles",
        json={"name": "Test Candidate", "email": "candidate@example.test"},
    )

    assert response.status_code == 500
    assert "database credentials leaked" not in response.text


def test_get_profile_returns_404_when_profile_is_missing(monkeypatch):
    monkeypatch.setattr(
        profile_routes.profile_service,
        "get_profile_by_id",
        lambda _profile_id: None,
    )

    response = CLIENT.get("/api/profiles/missing")

    assert response.status_code == 404
    assert response.json() == {"detail": "Profile not found"}


def test_get_latest_profile_returns_saved_profile(monkeypatch):
    monkeypatch.setattr(
        profile_routes.profile_service,
        "get_latest_profile",
        lambda: {"id": "latest-123", "name": "Latest User", "skills": ["Python"]},
    )

    response = CLIENT.get("/api/profiles/latest")

    assert response.status_code == 200
    assert response.json() == {
        "id": "latest-123",
        "name": "Latest User",
        "skills": ["Python"],
    }


def test_get_latest_profile_returns_404_when_none_exists(monkeypatch):
    monkeypatch.setattr(
        profile_routes.profile_service,
        "get_latest_profile",
        lambda: None,
    )

    response = CLIENT.get("/api/profiles/latest")

    assert response.status_code == 404
    assert response.json() == {"detail": "No profile found"}
