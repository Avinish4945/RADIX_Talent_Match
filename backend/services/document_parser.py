import pdfplumber
import docx
import io
from fastapi import UploadFile

def extract_text_from_file(file: UploadFile) -> str:
    """Extracts raw text from an uploaded PDF or DOCX file."""
    text = ""
    filename = file.filename.lower()
    
    # Read file into memory
    file_bytes = file.file.read()
    
    if filename.endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
                    
    elif filename.endswith(".docx"):
        doc = docx.Document(io.BytesIO(file_bytes))
        for para in doc.paragraphs:
            text += para.text + "\n"
            
    else:
        raise ValueError("Unsupported file format. Please upload PDF or DOCX.")
        
    return text.strip()