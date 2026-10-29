"""Regression tests for profile persistence updates."""
from types import SimpleNamespace
import pytest
from app.schemas.profile import CandidateProfile
from app.services import profile_service

class FakeQuery:
    def __init__(self, response_data):
        self.response_data = response_data
        self.operation = None
        self.payload = None
        self.filters = []
    def update(self, payload):
        self.operation, self.payload = "update", payload
        return self
    def insert(self, payload):
        self.operation, self.payload = "insert", payload
        return self
    def eq(self, key, value):
        self.filters.append((key, value))
        return self
    def execute(self):
        return SimpleNamespace(data=self.response_data)

class FakeTable:
    def __init__(self, responses):
        self.responses = iter(responses)
        self.queries = []
    def __call__(self, name):
        assert name == "profiles"
        query = FakeQuery(next(self.responses))
        self.queries.append(query)
        return query

def test_save_profile_with_id_updates_existing_record(monkeypatch):
    table = FakeTable([[{"id": "profile-123"}]])
    monkeypatch.setattr(profile_service.supabase, "table", table)
    profile = CandidateProfile(id="profile-123", name="Ada", skills=["Python"])
    saved_id = profile_service.save_profile(profile, profile_id=profile.id)
    assert saved_id == "profile-123"
    query = table.queries[0]
    assert query.operation == "update"
    assert query.filters == [("id", "profile-123")]
    assert query.payload["profile_data"]["name"] == "Ada"
    assert "id" not in query.payload["profile_data"]

def test_save_profile_with_stale_id_does_not_insert_duplicate(monkeypatch):
    table = FakeTable([[]])
    monkeypatch.setattr(profile_service.supabase, "table", table)
    profile = CandidateProfile(id="missing-id", name="Ada")
    with pytest.raises(LookupError, match="Profile ID was not found"):
        profile_service.save_profile(profile, profile_id=profile.id)
    assert len(table.queries) == 1
    assert table.queries[0].operation == "update"

def test_save_profile_without_id_inserts_new_record(monkeypatch):
    table = FakeTable([[{"id": "new-profile"}]])
    monkeypatch.setattr(profile_service.supabase, "table", table)
    profile = CandidateProfile(name="Ada")
    assert profile_service.save_profile(profile) == "new-profile"
    assert table.queries[0].operation == "insert"
