"""Verify the documented Talent Check demo against a running local API."""

import argparse
import json
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import ProxyHandler, Request, build_opener


ROOT = Path(__file__).resolve().parents[2]
DATASET = ROOT / "data" / "talent_check_company_skillsets.json"
OPENER = build_opener(ProxyHandler({}))


def request_json(url, payload=None):
    body = json.dumps(payload).encode("utf-8") if payload is not None else None
    request = Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"} if body else {},
        method="POST" if body else "GET",
    )
    try:
        with OPENER.open(request, timeout=10) as response:
            return response.status, read_response(response)
    except HTTPError as error:
        return error.code, read_response(error)
    except (TimeoutError, URLError) as error:
        raise RuntimeError(
            f"Could not reach {url}. Start the backend before running this demo: {error}"
        ) from error


def read_response(response):
    content = response.read()
    if "application/json" in response.headers.get("Content-Type", ""):
        return json.loads(content)
    return content.decode("utf-8", errors="replace")


def verify(status, expected_status, body, step):
    if status != expected_status:
        raise AssertionError(
            f"{step}: expected HTTP {expected_status}, got HTTP {status}: {body}"
        )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--base-url",
        default="http://127.0.0.1:8000",
        help="FastAPI base URL (default: http://127.0.0.1:8000)",
    )
    base_url = parser.parse_args().base_url.rstrip("/")

    if not DATASET.is_file():
        raise RuntimeError(f"Company dataset not found: {DATASET}")

    metadata = json.loads(DATASET.read_text(encoding="utf-8")).get("_metadata", {})
    if metadata.get("official") is False:
        print(
            "NOTICE: The checked-in dataset identifies itself as synthetic "
            "development data, not official company requirements."
        )

    status, _ = request_json(f"{base_url}/docs")
    verify(status, 200, {}, "API documentation")
    print(f"PASS: API docs available at {base_url}/docs")

    status, company_response = request_json(
        f"{base_url}/api/talent-check/companies"
    )
    verify(status, 200, company_response, "Company list")
    companies = company_response.get("companies", [])
    company = "Example Company"
    if company not in companies:
        raise AssertionError(f"Demo company {company!r} is not in {companies!r}")

    status, candidate_response = request_json(
        f"{base_url}/api/talent-check/candidates"
    )
    verify(status, 200, candidate_response, "Candidate list")
    candidate_id = "demo-candidate"
    if candidate_id not in {
        candidate.get("id") for candidate in candidate_response.get("candidates", [])
    }:
        raise AssertionError(f"Demo candidate {candidate_id!r} is not available")

    status, result = request_json(
        f"{base_url}/api/talent-check/",
        {"candidate_id": candidate_id, "company": company},
    )
    verify(status, 200, result, "Valid assessment")
    expected_gaps = [
        ("COD", 7, 7, 0, False, "assessed"),
        ("DSA", 8, 5, 3, True, "assessed"),
        ("COMM", 6, 6, 0, False, "assessed"),
        ("SQL", 6, 6, 0, False, "assessed"),
    ]
    actual_gaps = [
        (
            skill["category_code"],
            skill["required_level"],
            skill["candidate_level"],
            skill["gap_size"],
            skill["gap"],
            skill["status"],
        )
        for skill in result["skillset_gap"]
        if skill["status"] == "assessed"
    ]
    if (
        result.get("readiness_score") != 89
        or result.get("coverage_percent") != 36
        or actual_gaps != expected_gaps
    ):
        raise AssertionError(
            "Valid assessment did not match the documented manual calculation: "
            f"{json.dumps(result, indent=2)}"
        )
    print(
        "PASS: Example Company scored 89/100 readiness with 36% coverage; "
        "the assessed gaps match the manual calculation."
    )
    print("      Assessed categories: COD meets, DSA gap 3, COMM meets, SQL meets.")

    status, unknown_company = request_json(
        f"{base_url}/api/talent-check/",
        {"candidate_id": candidate_id, "company": "Unknown Demo Company"},
    )
    verify(status, 404, unknown_company, "Unknown company")
    if "No company requirements found" not in unknown_company.get("detail", ""):
        raise AssertionError(f"Unexpected unknown-company response: {unknown_company}")
    print("PASS: Unknown company returns HTTP 404 with a clear detail.")

    status, unknown_candidate = request_json(
        f"{base_url}/api/talent-check/",
        {"candidate_id": "missing-demo-candidate", "company": company},
    )
    verify(status, 404, unknown_candidate, "Unknown candidate")
    if "Candidate 'missing-demo-candidate' not found" != unknown_candidate.get(
        "detail"
    ):
        raise AssertionError(
            f"Unexpected unknown-candidate response: {unknown_candidate}"
        )
    print("PASS: Unknown candidate returns HTTP 404 with a clear detail.")
    print("NEXT: Open http://127.0.0.1:5173/talent-check for the UI demonstration.")


if __name__ == "__main__":
    try:
        main()
    except (AssertionError, RuntimeError) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        sys.exit(1)
