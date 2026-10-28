from pathlib import Path
import uuid
from uuid import UUID
from fastapi import APIRouter, UploadFile, File, HTTPException
from starlette.concurrency import run_in_threadpool
from fastapi import Path as FastAPIPath
from app.schemas.jd_schema import JDResponse
from app.services.document_parser import extract_text
from app.services.jd_analyzer import analyze_jd_text
from app.utils.validate_jd import validate_jd_analysis
from app.services.supabase_client import supabase

router = APIRouter()

# backend/uploads/
UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def save_jd_analysis(analysis: dict, source_file: str) -> dict:
    record = {
        "source_type": "jd",
        "source_file": source_file,
        "company": analysis.get("company"),
        "role": analysis.get("role"),
        "skills": analysis["skills"],
    }

    response = (
        supabase
        .table("job_descriptions")
        .insert(record)
        .execute()
    )

    if not response.data:
        raise RuntimeError("Failed to save JD analysis to Supabase")

    saved_record = response.data[0]
    if not isinstance(saved_record, dict):
        raise RuntimeError("Supabase returned an invalid JD analysis record")

    return saved_record




@router.get("/")
async def get_jd(
    company: str | None = None,
    role: str | None = None,
    page: int = 1,
    page_size: int = 10,
):
    if page < 1:
        raise HTTPException(
            status_code=400,
            detail="Page must be at least 1."
        )

    if not 1 <= page_size <= 100:
        raise HTTPException(
            status_code=400,
            detail="Page size must be between 1 and 100."
        )

    try:
        def fetch_jds():
            query = supabase.table("job_descriptions").select(
                "*", count="exact"
            )

            if company and company.strip():
                query = query.ilike(
                    "company", f"%{company.strip()}%"
                )

            if role and role.strip():
                query = query.ilike(
                    "role", f"%{role.strip()}%"
                )

            start = (page - 1) * page_size
            end = start + page_size - 1

            return (
                query
                .order("created_at", desc=True)
                .range(start, end)
                .execute()
            )

        response = await run_in_threadpool(fetch_jds)

        total = response.count or 0

        return {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": (total + page_size - 1) // page_size,
            "count": len(response.data),
            "job_descriptions": response.data,
        }

    except Exception as exc:
        print(f"Failed to retrieve job descriptions: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve job descriptions."
        ) from exc


@router.post("/upload")
async def upload_jd(file: UploadFile = File(...)):
    extension = Path(file.filename or "").suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are allowed"
        )

    saved_name = f"{uuid.uuid4().hex}{extension}"
    saved_path = UPLOAD_DIR / saved_name
    size = 0

    try:
        with saved_path.open("wb") as output:
            while True:
                chunk = await file.read(1024 * 1024)

                if not chunk:
                    break

                size += len(chunk)

                if size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="File must be 10 MB or smaller"
                    )

                output.write(chunk)

        return {
            "message": "JD file saved successfully",
            "original_filename": file.filename,
            "saved_filename": saved_name,
            "size_bytes": size
        }

    except Exception:
        saved_path.unlink(missing_ok=True)
        raise

    finally:
        await file.close()


@router.post("/extract")
async def extract_jd_text(file: UploadFile = File(...)):
    extension = Path(file.filename or "").suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are allowed"
        )

    # Reuse your existing local-storage logic
    saved_name = f"{uuid.uuid4().hex}{extension}"
    saved_path = UPLOAD_DIR / saved_name
    size = 0

    try:
        with saved_path.open("wb") as output:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break

                size += len(chunk)
                if size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="File must be 10 MB or smaller"
                    )

                output.write(chunk)

        text = extract_text(str(saved_path))

        return {
            "message": "JD text extracted successfully",
            "filename": file.filename,
            "extracted_text": text
        }

    except HTTPException:
        saved_path.unlink(missing_ok=True)
        raise
    except Exception as exc:
        saved_path.unlink(missing_ok=True)
        if isinstance(exc, ValueError):
            raise HTTPException(status_code=422, detail=str(exc))
        raise HTTPException(
            status_code=500,
            detail="Failed to extract document text"
        )
    finally:
        await file.close()



@router.post("/analyze", response_model=JDResponse)
async def analyze_jd(file: UploadFile = File(...)):
    original_name = file.filename or "uploaded_jd"
    extension = Path(original_name).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are supported."
        )

    saved_path = UPLOAD_DIR / f"{uuid.uuid4().hex}{extension}"
    total_size = 0

    try:
        # 1. Save the uploaded file locally
        with saved_path.open("wb") as destination:
            while True:
                chunk = await file.read(1024 * 1024)

                if not chunk:
                    break

                total_size += len(chunk)

                if total_size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="File size must not exceed 10 MB."
                    )

                destination.write(chunk)

        # 2. Extract document text
        extracted_text = await run_in_threadpool(
            extract_text, str(saved_path)
        )

        if not extracted_text or not extracted_text.strip():
            raise HTTPException(
                status_code=422,
                detail="No readable text found in the document."
            )

        # 3. Analyze the JD with Groq
        analysis = await run_in_threadpool(
            analyze_jd_text, extracted_text
        )

        # 4. Validate the analysis
        analysis = validate_jd_analysis(analysis)

        # 5. Save the validated result in Supabase
        saved_record = await run_in_threadpool(
            save_jd_analysis,
            analysis,
            original_name,
        )

        # 6. Return the saved database record
        return {
            "id": saved_record["id"],
            "source_type": saved_record["source_type"],
            "source_file": saved_record["source_file"],
            "company": saved_record["company"],
            "role": saved_record["role"],
            "skills": saved_record["skills"],
            "created_at": saved_record["created_at"],
        }

    except HTTPException:
        saved_path.unlink(missing_ok=True)
        raise

    except ValueError as exc:
        saved_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=422,
            detail=str(exc)
        ) from exc

    except Exception as exc:
        saved_path.unlink(missing_ok=True)
        print(f"JD analysis failed: {exc}")
        raise HTTPException(
            status_code=500,
            detail="JD analysis failed. Check the backend terminal."
        ) from exc

    finally:
        await file.close()



    try:
        response = await run_in_threadpool(
            lambda: (
                supabase
                .table("job_descriptions")
                .select("*")
                .order("created_at", desc=True)
                .execute()
            )
        )

        return {
            "count": len(response.data),
            "job_descriptions": response.data,
        }

    except Exception as exc:
        print(f"Failed to retrieve job descriptions: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve job descriptions."
        ) from exc


@router.get("/{jd_id}", response_model=JDResponse)
async def get_jd_by_id(jd_id: UUID):
    try:
        response = await run_in_threadpool(
            lambda: (
                supabase
                .table("job_descriptions")
                .select("*")
                .eq("id", str(jd_id))
                .limit(1)
                .execute()
            )
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Job description not found."
            )

        return response.data[0]

    except HTTPException:
        raise

    except Exception as exc:
        print(f"Failed to retrieve JD: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve job description."
        ) from exc


@router.delete("/{jd_id}")
def delete_job_description(jd_id: UUID):
    try:
        response = (
            supabase.table("job_descriptions")
            .delete()
            .eq("id", str(jd_id))
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Job description not found.",
            )

        return {
            "message": "Job description deleted successfully.",
            "id": str(jd_id),
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Could not delete the job description.",
        ) from exc