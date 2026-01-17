"""
API Testing Script for RAG Chatbot
Test all endpoints and functionality
"""

import requests
import json
from pathlib import Path
from datetime import datetime

BASE_URL = "http://localhost:8000"

def print_section(title):
    """Print a section header"""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)

def test_health():
    """Test health endpoint"""
    print_section("Testing Health Endpoint")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_root():
    """Test root endpoint"""
    print_section("Testing Root Endpoint")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_upload(file_path):
    """Test file upload"""
    print_section("Testing File Upload")
    
    if not Path(file_path).exists():
        print(f"❌ File not found: {file_path}")
        return False
    
    try:
        with open(file_path, 'rb') as f:
            files = {'file': (Path(file_path).name, f)}
            response = requests.post(f"{BASE_URL}/upload", files=files)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_list_documents():
    """Test list documents"""
    print_section("Testing List Documents")
    try:
        response = requests.get(f"{BASE_URL}/documents")
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Total Documents: {data.get('total_documents', 0)}")
        print(f"Total Chunks: {data.get('total_chunks', 0)}")
        print(f"\nDocuments:")
        for doc in data.get('documents', []):
            print(f"  - {doc['filename']} ({doc['chunks']} chunks)")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_chat(message, use_rag=True, top_k=3):
    """Test chat endpoint"""
    print_section(f"Testing Chat: '{message[:50]}...'")
    try:
        payload = {
            "message": message,
            "use_rag": use_rag,
            "top_k": top_k
        }
        response = requests.post(f"{BASE_URL}/chat", json=payload)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n💬 Answer:\n{data['answer']}\n")
            if data.get('sources'):
                print(f"📚 Sources: {', '.join(data['sources'])}")
            print(f"🔍 Context Used: {data.get('context_used', False)}")
        else:
            print(f"Response: {response.text}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_kb_stats():
    """Test knowledge base stats"""
    print_section("Testing KB Stats")
    try:
        response = requests.get(f"{BASE_URL}/kb/stats")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_delete_document(filename):
    """Test delete document"""
    print_section(f"Testing Delete Document: {filename}")
    try:
        payload = {"filename": filename}
        response = requests.delete(f"{BASE_URL}/documents/delete", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_save_kb():
    """Test save knowledge base"""
    print_section("Testing Save Knowledge Base")
    try:
        response = requests.post(f"{BASE_URL}/kb/save")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def run_all_tests(test_file=None):
    """Run all API tests"""
    print("\n" + "=" * 60)
    print("  🧪 RAG Chatbot API Test Suite")
    print("  " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("=" * 60)
    
    results = {
        "passed": 0,
        "failed": 0,
        "total": 0
    }
    
    tests = [
        ("Health Check", lambda: test_health()),
        ("Root Endpoint", lambda: test_root()),
        ("KB Stats", lambda: test_kb_stats()),
        ("List Documents", lambda: test_list_documents()),
    ]
    
    # Add upload test if file provided
    if test_file and Path(test_file).exists():
        tests.append(("Upload Document", lambda: test_upload(test_file)))
        tests.append(("List After Upload", lambda: test_list_documents()))
        tests.append(("Chat with RAG", lambda: test_chat("What is this document about?", use_rag=True)))
        tests.append(("Chat without RAG", lambda: test_chat("Hello, how are you?", use_rag=False)))
    else:
        tests.append(("Chat without RAG", lambda: test_chat("Hello, tell me a joke", use_rag=False)))
    
    tests.append(("Save KB", lambda: test_save_kb()))
    
    # Run all tests
    for test_name, test_func in tests:
        results["total"] += 1
        try:
            if test_func():
                results["passed"] += 1
                status = "✅ PASSED"
            else:
                results["failed"] += 1
                status = "❌ FAILED"
        except Exception as e:
            results["failed"] += 1
            status = f"❌ ERROR: {e}"
        
        print(f"\n{status}: {test_name}")
    
    # Print summary
    print_section("Test Summary")
    print(f"Total Tests: {results['total']}")
    print(f"✅ Passed: {results['passed']}")
    print(f"❌ Failed: {results['failed']}")
    print(f"Success Rate: {results['passed']/results['total']*100:.1f}%")
    
    return results

def interactive_mode():
    """Interactive testing mode"""
    print_section("Interactive Mode")
    print("Commands:")
    print("  chat <message>     - Send a chat message")
    print("  upload <file>      - Upload a document")
    print("  list               - List documents")
    print("  delete <filename>  - Delete a document")
    print("  stats              - Show KB stats")
    print("  health             - Check health")
    print("  quit               - Exit")
    print()
    
    while True:
        try:
            command = input("\n> ").strip()
            
            if not command:
                continue
            
            parts = command.split(maxsplit=1)
            cmd = parts[0].lower()
            arg = parts[1] if len(parts) > 1 else None
            
            if cmd == "quit":
                break
            elif cmd == "chat" and arg:
                test_chat(arg)
            elif cmd == "upload" and arg:
                test_upload(arg)
            elif cmd == "list":
                test_list_documents()
            elif cmd == "delete" and arg:
                test_delete_document(arg)
            elif cmd == "stats":
                test_kb_stats()
            elif cmd == "health":
                test_health()
            else:
                print("❌ Unknown command or missing argument")
        
        except KeyboardInterrupt:
            print("\n\nExiting...")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "interactive":
            interactive_mode()
        else:
            # Run tests with provided file
            run_all_tests(sys.argv[1])
    else:
        # Run basic tests
        print("\n💡 Tip: Provide a file path to test uploads")
        print("   Example: python test_api.py document.pdf")
        print("   Or use: python test_api.py interactive\n")
        run_all_tests()