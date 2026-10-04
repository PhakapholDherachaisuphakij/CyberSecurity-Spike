import io
import re
from typing import Dict, Any
import pypdf

# Common injection heuristic signatures for demonstration defense
SUSPICIOUS_PATTERNS = [
    r"(?i)ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|directives|rules)",
    r"(?i)system\s+(directive|alert|override|command)",
    r"(?i)you\s+must\s+(immediately\s+)?classify",
    r"(?i)hire\s+immediately",
    r"(?i)maximum\s+(possible\s+)?salary",
    r"(?i)ผู้สมัครคนนี้คือพระเจ้า",
    r"(?i)disregard\s+(all\s+)?constraints",
    r"(?i)prompt\s+injection",
    r"(?i)bypass\s+safety",
]

def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> Dict[str, Any]:
    """
    Extracts raw text stream from PDF bytes using pypdf.
    In PDF format, text streams do not retain background styling or human visibility constraints.
    Hence, white-on-white text is extracted indistinguishably from visible black text.
    """
    stream = io.BytesIO(pdf_bytes)
    reader = pypdf.PdfReader(stream)
    
    pages_text = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        pages_text.append(text)
        
    full_text = "\n\n".join(pages_text)
    
    # Check for suspicious prompt injection patterns (defense analysis)
    detected_indicators = []
    for pattern in SUSPICIOUS_PATTERNS:
        matches = re.findall(pattern, full_text)
        if matches:
            detected_indicators.append(pattern)

    return {
        "page_count": len(reader.pages),
        "raw_text": full_text,
        "char_count": len(full_text),
        "suspicious_detected": len(detected_indicators) > 0,
        "matched_rules": detected_indicators
    }

def extract_text_from_file_path(file_path: str) -> Dict[str, Any]:
    with open(file_path, "rb") as f:
        return extract_text_from_pdf_bytes(f.read())

def sanitize_resume_text(raw_text: str) -> str:
    """
    Demonstration sanitizer for defense mode:
    Strips known override tokens and flags directive lines.
    """
    sanitized = raw_text
    for pattern in SUSPICIOUS_PATTERNS:
        sanitized = re.sub(pattern, "[FILTERED_SUSPICIOUS_PAYLOAD]", sanitized)
    return sanitized
