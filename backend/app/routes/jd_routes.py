from pathlib import Path
import uuid

from fastapi import APIRouter, UploadFile, File, HTTPException
from starlette.concurrency import run_in_threadpool

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

    return response.data[0]


@router.get("/")
def get_jd():
    return {"message": "JD route working"}


@router.post("/upload")
async def upload_jd(file: UploadFile = File(...)):
    extension = Path(file.filename or "").suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are allowed"
        )

    saved_name = f"{uuid4().hex}{extension}"
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
    saved_name = f"{uuid4().hex}{extension}"
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



@router.post("/analyze")
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
