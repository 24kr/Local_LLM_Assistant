@echo off
echo Starting Local RAG System...
echo.

echo Activating virtual environment...
call .venv\Scripts\activate

echo Starting FastAPI backend...
start cmd /k "cd backend && uvicorn main:app --reload"

timeout /t 3 >nul

echo Starting React frontend...
start cmd /k "cd frontend && npm run dev"

echo.
echo Local RAG System is running:
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173
pause
