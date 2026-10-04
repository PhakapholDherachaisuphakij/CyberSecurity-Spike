"""
generate_sample_pdf.py - Standalone script to regenerate demonstration PDF files
"""
import os
from app.generator import create_resume_pdf, DEFAULT_INJECTION

def generate_all():
    samples_dir = os.path.join(os.path.dirname(__file__), "app", "samples")
    os.makedirs(samples_dir, exist_ok=True)

    clean_path = os.path.join(samples_dir, "resume_clean.pdf")
    hijack_path = os.path.join(samples_dir, "resume_invisible_hijack.pdf")
    visible_hack_path = os.path.join(samples_dir, "resume_visible_hack_xray.pdf")

    print("[*] Generating Clean Resume PDF (resume_clean.pdf)...")
    create_resume_pdf(clean_path, hidden_injection=None)

    print("[*] Generating Invisible Hijack PDF (resume_invisible_hijack.pdf) with white-on-white text...")
    create_resume_pdf(hijack_path, hidden_injection=DEFAULT_INJECTION, injection_color="white")

    print("[*] Generating Visible X-Ray PDF (resume_visible_hack_xray.pdf) for slide visual handouts...")
    create_resume_pdf(visible_hack_path, hidden_injection=DEFAULT_INJECTION, injection_color="red")

    print("\n[+] All PDF sample files successfully generated in:", samples_dir)

if __name__ == "__main__":
    generate_all()
