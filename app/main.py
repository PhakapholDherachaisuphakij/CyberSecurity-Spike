import os
import io
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from app.generator import create_resume_pdf, DEFAULT_INJECTION
from app.parser import extract_text_from_pdf_bytes, extract_text_from_file_path, sanitize_resume_text
from app.llm_service import screen_resume_llm

app = FastAPI(
    title="The Invisible Hijack - Indirect Prompt Injection Lab",
    description="Educational demonstration of Indirect Prompt Injection (OWASP LLM01) via white-on-white text in resumes.",
    version="1.0.0"
)

# Ensure sample files exist
SAMPLES_DIR = os.path.join(os.path.dirname(__file__), "samples")
os.makedirs(SAMPLES_DIR, exist_ok=True)

clean_pdf_path = os.path.join(SAMPLES_DIR, "resume_clean.pdf")
hijack_pdf_path = os.path.join(SAMPLES_DIR, "resume_invisible_hijack.pdf")

if not os.path.exists(clean_pdf_path):
    create_resume_pdf(clean_pdf_path, hidden_injection=None)
if not os.path.exists(hijack_pdf_path):
    create_resume_pdf(hijack_pdf_path, hidden_injection=DEFAULT_INJECTION, injection_color="white")

class ScreenRequest(BaseModel):
    resume_text: str
    mode: str = "vulnerable"       # "vulnerable" or "defended"
    provider: str = "auto"         # "auto", "gemini", "openai", "simulation"
    api_key: Optional[str] = None

class GenerateCustomRequest(BaseModel):
    candidate_name: str = "Alex Rivera"
    role_title: str = "Junior Full-Stack Developer"
    summary: str = "Passionate junior developer with 2 years of experience."
    hidden_injection: str = DEFAULT_INJECTION
    injection_color: str = "white"

@app.get("/api/samples")
def list_samples():
    return {
        "samples": [
            {
                "id": "hijack",
                "filename": "resume_invisible_hijack.pdf",
                "name": "Alex Rivera - With Invisible Hijack (White-on-White)",
                "description": "Appears completely normal to human eyes, but contains hidden prompt injection text in the PDF stream.",
                "has_injection": True
            },
            {
                "id": "clean",
                "filename": "resume_clean.pdf",
                "name": "Alex Rivera - Clean Resume (Baseline)",
                "description": "Identical visual layout without any hidden prompt injection instructions.",
                "has_injection": False
            }
        ]
    }

@app.get("/api/sample-pdf/{filename}")
def get_sample_pdf(filename: str):
    file_path = os.path.join(SAMPLES_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Sample PDF not found")
    return FileResponse(file_path, media_type="application/pdf", filename=filename)

@app.post("/api/extract-text")
async def extract_text_endpoint(
    sample_id: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    if file:
        content = await file.read()
        res = extract_text_from_pdf_bytes(content)
        res["source"] = f"Uploaded File: {file.filename}"
        return res
    elif sample_id == "clean":
        res = extract_text_from_file_path(clean_pdf_path)
        res["source"] = "Sample: resume_clean.pdf"
        return res
    else:
        # Default to hijack sample
        res = extract_text_from_file_path(hijack_pdf_path)
        res["source"] = "Sample: resume_invisible_hijack.pdf"
        return res

@app.post("/api/screen-resume")
def screen_resume_endpoint(req: ScreenRequest):
    result = screen_resume_llm(
        resume_text=req.resume_text,
        mode=req.mode,
        provider=req.provider,
        api_key=req.api_key
    )
    return result

@app.post("/api/generate-custom")
def generate_custom_pdf(req: GenerateCustomRequest):
    custom_filename = "resume_custom.pdf"
    output_path = os.path.join(SAMPLES_DIR, custom_filename)
    create_resume_pdf(
        output_path=output_path,
        candidate_name=req.candidate_name,
        role_title=req.role_title,
        summary=req.summary,
        hidden_injection=req.hidden_injection if req.hidden_injection.strip() else None,
        injection_color=req.injection_color
    )
    # Extract text from newly created custom PDF
    analysis = extract_text_from_file_path(output_path)
    return {
        "filename": custom_filename,
        "download_url": f"/api/sample-pdf/{custom_filename}",
        "raw_text": analysis["raw_text"],
        "suspicious_detected": analysis["suspicious_detected"]
    }

# Mount static frontend
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
