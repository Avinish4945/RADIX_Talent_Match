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
        lambda _profile, **_kwargs: "profile-123",
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
    def fail_to_save(_profile, **_kwargs):
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


<<<<<<< HEAD
def test_create_profile_with_existing_id_updates(monkeypatch):
    observed = {}
=======
<<<<<<< HEAD
def test_get_latest_profile_returns_saved_profile(monkeypatch):
    monkeypatch.setattr(
        profile_routes.profile_service,
        "get_latest_profile",
        lambda: {"id": "latest-123", "name": "Latest User", "skills": ["Python"]},
    )
>>>>>>> aeafd8b (api link)

    def fake_save(profile, profile_id=None):
        observed["profile_id"] = profile_id
        return profile_id or "profile-123"

    monkeypatch.setattr(profile_routes.profile_service, "save_profile", fake_save)

    response = CLIENT.post(
        "/api/profiles",
        json={"id": "existing-456", "name": "Existing User", "email": "user@example.test"},
    )

    assert response.status_code == 200
    assert response.json() == {"id": "existing-456", "message": "Profile saved successfully"}
    assert observed["profile_id"] == "existing-456"


def test_create_profile_with_stale_id_returns_404(monkeypatch):
    def fail_stale(_profile, profile_id=None):
        raise LookupError("Profile ID was not found; reload the profile before saving")

    monkeypatch.setattr(profile_routes.profile_service, "save_profile", fail_stale)

    response = CLIENT.post(
        "/api/profiles",
        json={"id": "stale-789", "name": "Stale User", "email": "stale@example.test"},
    )

    assert response.status_code == 404
<<<<<<< HEAD
    assert "Profile ID was not found" in response.json()["detail"]
=======
    assert response.json() == {"detail": "No profile found"}
=======
def test_update_profile_returns_success(monkeypatch):
    observed = {}

    def update(profile_id, profile):
        observed["profile_id"] = profile_id
        observed["skills"] = profile.skills
        return True

    monkeypatch.setattr(profile_routes.profile_service, "update_profile", update)
    response = CLIENT.put(
        "/api/profiles/profile-123",
        json={
            "name": "Test Candidate",
            "email": "candidate@example.test",
            "skills": ["Python"],
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "id": "profile-123",
        "message": "Profile updated successfully",
    }
    assert observed == {"profile_id": "profile-123", "skills": ["Python"]}


def test_update_profile_returns_404_when_profile_is_missing(monkeypatch):
    monkeypatch.setattr(
        profile_routes.profile_service,
        "update_profile",
        lambda _profile_id, _profile: False,
    )

    response = CLIENT.put(
        "/api/profiles/missing",
        json={"name": "Test Candidate", "email": "candidate@example.test"},
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Profile not found"}


def test_update_profile_does_not_expose_internal_errors(monkeypatch):
    def fail_to_update(_profile_id, _profile):
        raise RuntimeError("database credentials leaked")

    monkeypatch.setattr(
        profile_routes.profile_service,
        "update_profile",
        fail_to_update,
    )
    client = TestClient(TEST_APP, raise_server_exceptions=False)

    response = client.put(
        "/api/profiles/profile-123",
        json={"name": "Test Candidate", "email": "candidate@example.test"},
    )

    assert response.status_code == 500
    assert "database credentials leaked" not in response.text
>>>>>>> 8cf6984 (api link)
>>>>>>> aeafd8b (api link)
