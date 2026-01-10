"""
Enhanced startup script for RAG Chatbot
Checks dependencies and starts both backend and frontend
"""

import subprocess
import sys
import os
from pathlib import Path
import time

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro}")
    return True

def check_ollama():
    """Check if Ollama is running"""
    try:
        result = subprocess.run(
            ["ollama", "list"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            print("✅ Ollama is running")
            return True
        else:
            print("❌ Ollama is not responding")
            return False
    except FileNotFoundError:
        print("❌ Ollama is not installed")
        print("   Install from: https://ollama.ai")
        return False
    except subprocess.TimeoutExpired:
        print("❌ Ollama is not responding (timeout)")
        return False
    except Exception as e:
        print(f"❌ Error checking Ollama: {e}")
        return False

def check_node():
    """Check if Node.js is installed"""
    try:
        result = subprocess.run(
            ["node", "--version"],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            version = result.stdout.strip()
            print(f"✅ Node.js {version}")
            return True
        else:
            print("❌ Node.js is not installed")
            return False
    except FileNotFoundError:
        print("❌ Node.js is not installed")
        print("   Install from: https://nodejs.org")
        return False

def install_python_dependencies():
    """Install Python dependencies"""
    print("\n📦 Installing Python dependencies...")
    try:
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "-r", "requirements.txt"],
            check=True
        )
        print("✅ Python dependencies installed")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to install Python dependencies")
        return False

def install_node_dependencies():
    """Install Node.js dependencies"""
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return False
    
    print("\n📦 Installing Node.js dependencies...")
    try:
        subprocess.run(
            ["npm", "install"],
            cwd=frontend_dir,
            check=True
        )
        print("✅ Node.js dependencies installed")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to install Node.js dependencies")
        return False

def start_backend():
    """Start FastAPI backend"""
    print("\n🚀 Starting backend server...")
    try:
        backend_process = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
            cwd=Path("backend")
        )
        print("✅ Backend started on http://localhost:8000")
        return backend_process
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        return None

def start_frontend():
    """Start React frontend"""
    print("\n🚀 Starting frontend server...")
    frontend_dir = Path("frontend")
    try:
        frontend_process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=frontend_dir
        )
        print("✅ Frontend started on http://localhost:5173")
        return frontend_process
    except Exception as e:
        print(f"❌ Failed to start frontend: {e}")
        return None

def main():
    """Main startup routine"""
    print("=" * 50)
    print("🤖 RAG Chatbot Startup")
    print("=" * 50)
    
    # Check requirements
    print("\n🔍 Checking requirements...")
    
    if not check_python_version():
        return
    
    if not check_ollama():
        print("\n⚠️  Please start Ollama first:")
        print("   ollama serve")
        return
    
    if not check_node():
        return
    
    # Change to backend directory
    backend_dir = Path(__file__).parent / "backend"
    if backend_dir.exists():
        os.chdir(backend_dir)
    
    # Install dependencies
    if not Path("venv").exists():
        print("\n📦 Virtual environment not found. Installing dependencies...")
        if not install_python_dependencies():
            return
    
    # Install frontend dependencies
    os.chdir(Path(__file__).parent)
    frontend_dir = Path("frontend")
    if frontend_dir.exists():
        node_modules = frontend_dir / "node_modules"
        if not node_modules.exists():
            if not install_node_dependencies():
                return
    
    # Start services
    print("\n" + "=" * 50)
    print("🚀 Starting services...")
    print("=" * 50)
    
    backend_process = start_backend()
    if not backend_process:
        return
    
    time.sleep(3)  # Wait for backend to start
    
    frontend_process = start_frontend()
    if not frontend_process:
        backend_process.terminate()
        return
    
    print("\n" + "=" * 50)
    print("✅ All services started successfully!")
    print("=" * 50)
    print("\n📍 Access points:")
    print("   Frontend: http://localhost:5173")
    print("   Backend:  http://localhost:8000")
    print("   API Docs: http://localhost:8000/docs")
    print("\n⚠️  Press Ctrl+C to stop all services\n")
    
    try:
        # Keep script running
        backend_process.wait()
    except KeyboardInterrupt:
        print("\n\n🛑 Stopping services...")
        backend_process.terminate()
        frontend_process.terminate()
        print("✅ All services stopped")

if __name__ == "__main__":
    main()