Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  THE INVISIBLE HIJACK - Indirect Prompt Injection Lab" -ForegroundColor Yellow
Write-Host "  Slide 4 Demo: White-on-White Text Exploitation in AI" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "`nStarting FastAPI Web Server at http://localhost:8000 ...`n" -ForegroundColor White

python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
