"""Apply the two guarded README status updates for RADIX Talent Match."""
from pathlib import Path

README = Path(__file__).resolve().parent / "README.md"

OLD_INTRO = (
    "Current JD Analytics progress: The backend setup, local PDF/DOCX upload, "
    "and basic text extraction have been implemented. LLM-based skill extraction "
    "and mapping to the RADIX skill categories are still in progress."
)
NEW_INTRO = (
    "Current implementation status varies by module. Check each module's API and "
    "tests before treating a workflow as complete. Talent Check currently includes "
    "deterministic scoring, mock candidate support, and a clearly marked synthetic "
    "company fixture for local development; organizer-provided company requirements "
    "are still needed for an official demonstration."
)
OLD_STATUS = """Development status
· FastAPI app and routes
· Local PDF/DOCX upload
· Basic PDF/DOCX text extraction
· LLM-based JD skill extraction
· Validation against the shared RADIX skill schema
· Integration with the Skill Matching module
· Persistent database integration, if required"""
NEW_STATUS = """Development status
· FastAPI app and module routers (verify routes in `/docs`)
· Local PDF/DOCX upload and basic text extraction
· JD Analytics skill extraction and shared-schema integration: verify with its owner and tests
· Profile Builder API and persistence: structured skill evidence is supported; legacy string skills remain accepted but are not scoreable
· Talent Check deterministic scoring, API endpoints, tests, and synthetic local fixture
· Resume Parsing currently extracts document text; confirm whether structured extraction is required by the hackathon brief
· Skill Matching UI still needs verification against real candidate profiles and analyzed job descriptions
· End-to-end integration and official company dataset remain acceptance checks
"""

text = README.read_text(encoding="utf-8")
if OLD_INTRO not in text:
    raise SystemExit("README intro did not match the inspected version; no README changes made.")
if OLD_STATUS not in text:
    # Handle possible tab after bullet in README or CRLF
    alt_status = OLD_STATUS.replace("· ", "·\t")
    if alt_status in text:
        OLD_STATUS = alt_status
    elif OLD_STATUS.replace("\n", "\r\n") in text:
        OLD_STATUS = OLD_STATUS.replace("\n", "\r\n")
    elif alt_status.replace("\n", "\r\n") in text:
        OLD_STATUS = alt_status.replace("\n", "\r\n")
    else:
        raise SystemExit("README development-status block did not match; no README changes made.")
text = text.replace(OLD_INTRO, NEW_INTRO, 1).replace(OLD_STATUS, NEW_STATUS, 1)
README.write_text(text, encoding="utf-8")
print("Updated README module status.")
