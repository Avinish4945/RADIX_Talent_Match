import tempfile
import zipfile
from pathlib import Path

import pymupdf
from docx.opc.exceptions import PackageNotFoundError
from fastapi import APIRouter, File, HTTPException, UploadFile
from starlette.concurrency import run_in_threadpool

from app.services.document_parser import extract_text
from app.services.resume_parser import parse_resume_to_structured_profile

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024


@router.post("/parse")
async def parse_resume(file: UploadFile = File(...)):
    try:
        filename = Path(file.filename or "").name
        extension = Path(filename).suffix.lower()
        if extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail="Only PDF and DOCX resumes are supported.",
            )

        content = await file.read(MAX_FILE_SIZE + 1)
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="Resume must be 10 MB or smaller.",
            )

        with tempfile.TemporaryDirectory(prefix="radix-resume-") as directory:
            path = Path(directory) / f"resume{extension}"
            path.write_bytes(content)
            try:
                extracted_text = await run_in_threadpool(
                    extract_text,
                    str(path),
                )
            except (
                ValueError,
                zipfile.BadZipFile,
                PackageNotFoundError,
                pymupdf.FileDataError,
            ) as error:
                raise HTTPException(
                    status_code=422,
                    detail="Unable to extract readable text from this resume.",
                ) from error

        structured_profile = await run_in_threadpool(
            parse_resume_to_structured_profile,
            extracted_text,
            filename,
        )

        return {
            "filename": filename,
            "extracted_text": extracted_text,
            "profile": structured_profile.model_dump(),
        }
    finally:
        await file.close()
