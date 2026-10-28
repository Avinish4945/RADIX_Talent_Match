from fastapi import APIRouter, UploadFile, File, HTTPException
# Using relative imports to prevent ModuleNotFoundError
from ...services.document_parser import extract_text_from_file
from .extractor import parse_resume_text

router = APIRouter()

@router.post("/parse")
async def parse_resume_endpoint(file: UploadFile = File(...)):
    """
    Upload a resume (PDF or DOCX) and extract structured profile data.
    """
    try:
        # 1. Extract raw text from the uploaded PDF/DOCX
        raw_text = extract_text_from_file(file)
        
        if not raw_text:
            raise HTTPException(status_code=400, detail="Could not extract text from document. It might be an image-based PDF.")
            
        # 2. Parse text with LLM using our extractor module
        parsed_data = parse_resume_text(raw_text, file.filename)
        
        # 3. Return the structured JSON to the frontend/Profile Builder
        return parsed_data
        
    except ValueError as ve:
        # Catches unsupported file formats
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        # Catches LLM API errors, parsing errors, etc.
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")