
import pymupdf
from docx import Document
from pathlib import Path


def extract_text(file_path: str) -> str:
    path = Path(file_path)
    extension = path.suffix.lower()

    if extension == ".pdf":
        with pymupdf.open(path) as pdf:
            text = "\n".join(
                page.get_text() for page in pdf
            )

    elif extension == ".docx":
        document = Document(path)
        text = "\n".join(
            paragraph.text
            for paragraph in document.paragraphs
        )

    else:
        raise ValueError("Unsupported file type")

    if not text.strip():
        raise ValueError(
            "No readable text found in the document. "
            "The file may be scanned or empty."
        )

    return text.strip()
