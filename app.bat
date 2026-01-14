@echo off
title RAG Assistant Launcher
color 0A

echo ========================================
echo     RAG Assistant - Startup Script
echo ========================================
echo.

:: Check if virtual environment exists
if not exist ".venv\Scripts\activate.bat" (
    echo [ERROR] Virtual environment not found!
    echo Please create it first:
    echo   python -m venv .venv
    echo   .venv\Scripts\activate
    echo   pip install -r backend\requirements.txt
    echo.
    pause
    exit /b 1
)

:: Check if Ollama is running
echo [1/5] Checking Ollama...
powershell -Command "$result = Test-NetConnection -ComputerName 127.0.0.1 -Port 11434 -InformationLevel Quiet; if ($result) { exit 0 } else { exit 1 }" >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Ollama is not running!
    echo.
    echo Please start Ollama first:
    echo   1. Run: ollama serve
    echo   2. Or start Ollama desktop app
    echo.
    echo Press any key to continue anyway, or Ctrl+C to cancel...
    pause >nul
) else (
    echo [OK] Ollama is running
)
echo.

:: Activate virtual environment
echo [2/5] Activating virtual environment...
call .venv\Scripts\activate
if %errorlevel% neq 0 (
    echo [ERROR] Failed to activate virtual environment
    pause
    exit /b 1
)
echo [OK] Virtual environment activated
echo.

:: Check if backend dependencies are installed
echo [3/5] Checking backend dependencies...
python -c "import fastapi" >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Backend dependencies not found
    echo Installing dependencies...
    cd backend
    pip install -r requirements.txt
    cd ..
) else (
    echo [OK] Backend dependencies installed
)
echo.

:: Check if frontend dependencies are installed
echo [4/5] Checking frontend dependencies...
if not exist "frontend\node_modules" (
    echo [WARNING] Frontend dependencies not found
    echo Installing dependencies...
    cd frontend
    call npm install
    cd ..
) else (
    echo [OK] Frontend dependencies installed
)
echo.

:: Start Backend
echo [5/5] Starting services...
echo.
echo Starting Backend Server...
start "RAG Backend - FastAPI" cmd /k "cd backend && echo Backend Server && echo ================== && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

:: Wait for backend to start
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

:: Start Frontend
echo Starting Frontend Server...
start "RAG Frontend - React" cmd /k "cd frontend && echo Frontend Server && echo ================== && npm run dev"

:: Wait a bit
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo     RAG Assistant is Starting!
echo ========================================
echo.
echo Services:
echo   [Backend]  http://127.0.0.1:8000
echo   [Frontend] http://localhost:5173
echo   [API Docs] http://127.0.0.1:8000/docs
echo.
echo Status:
echo   - Backend server started in new window
echo   - Frontend server started in new window
echo   - Opening browser in 3 seconds...
echo.

:: Wait before opening browser
timeout /t 3 /nobreak >nul

:: Open browser
echo Opening application in browser...
start http://localhost:5173

echo.
echo ========================================
echo Application is running!
echo.
echo To stop the application:
echo   1. Close the Backend window (FastAPI)
echo   2. Close the Frontend window (React)
echo   3. Or press Ctrl+C in each window
echo.
echo Logs are shown in separate windows.
echo ========================================
echo.
echo Press any key to close this launcher...
pause >nul