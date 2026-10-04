@echo off
title The Invisible Hijack - Indirect Prompt Injection Lab (Slide 4)
echo ========================================================
echo   THE INVISIBLE HIJACK - Indirect Prompt Injection Lab
echo   Slide 4 Demo: White-on-White Text Exploitation in AI
echo ========================================================
echo.
echo Starting FastAPI Web Server at http://localhost:8000 ...
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
