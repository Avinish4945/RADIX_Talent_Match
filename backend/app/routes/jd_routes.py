
from pathlib import Path
from uuid import uuid4
from app.services.document_parser import extract_text

from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter()

# backend/uploads/
UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


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
