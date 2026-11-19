#!/usr/bin/env python3
"""
Deployment Configuration Validator
Checks if your project is properly configured for Vercel deployment
"""

import os
import json
import sys
from pathlib import Path

class Color:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def check(condition, message):
    """Print check result"""
    status = f"{Color.GREEN}✓{Color.END}" if condition else f"{Color.RED}✗{Color.END}"
    print(f"{status} {message}")
    return condition

def section(title):
    """Print section header"""
    print(f"\n{Color.BLUE}{'='*60}{Color.END}")
    print(f"{Color.BLUE}{title}{Color.END}")
    print(f"{Color.BLUE}{'='*60}{Color.END}")

def validate():
    """Run validation checks"""
    
    project_root = Path.cwd()
    all_pass = True
    
    # Check project structure
    section("📁 Project Structure")
    
    files_to_check = {
        "package.json": "Root package.json",
        "vercel.json": "Vercel configuration",
        "DEPLOYMENT.md": "Deployment guide",
        "QUICKSTART.md": "Quick start guide",
        ".gitignore": "Git ignore file",
        ".vercelignore": "Vercel ignore file",
        "frontend/package.json": "Frontend package.json",
        "frontend/vite.config.js": "Vite configuration",
        "frontend/.env.example": "Frontend env example",
        "backend/requirements.txt": "Backend dependencies",
        "backend/config.py": "Backend configuration",
        "backend/.env.example": "Backend env example",
        "backend/main.py": "Backend main app",
    }
    
    for file_path, description in files_to_check.items():
        exists = (project_root / file_path).exists()
        all_pass &= check(exists, f"{description}: {file_path}")
    
    # Check environment files
    section("🔐 Environment Files")
    
    frontend_env = (project_root / "frontend/.env.local").exists()
    all_pass &= check(frontend_env, "frontend/.env.local configured")
    
    backend_env = (project_root / "backend/.env").exists()
    all_pass &= check(backend_env, "backend/.env configured")
    
    # Check package.json content
    section("📦 Package.json Content")
    
    try:
        with open(project_root / "package.json") as f:
            pkg = json.load(f)
            
        has_scripts = "scripts" in pkg
        all_pass &= check(has_scripts, "Root package.json has scripts")
        
        if has_scripts:
            scripts = pkg["scripts"]
            all_pass &= check("build" in scripts, "  - build script exists")
            all_pass &= check("dev" in scripts, "  - dev script exists")
            all_pass &= check("backend:dev" in scripts, "  - backend:dev script exists")
    except Exception as e:
        all_pass &= check(False, f"Error reading package.json: {e}")
    
    try:
        with open(project_root / "frontend/package.json") as f:
            pkg = json.load(f)
            
        has_react = "react" in pkg.get("dependencies", {})
        all_pass &= check(has_react, "Frontend has React dependency")
        
        has_vite = "vite" in pkg.get("devDependencies", {})
        all_pass &= check(has_vite, "Frontend has Vite dev dependency")
    except Exception as e:
        all_pass &= check(False, f"Error reading frontend package.json: {e}")
    
    # Check vercel.json
    section("⚙️ Vercel Configuration")
    
    try:
        with open(project_root / "vercel.json") as f:
            vercel = json.load(f)
            
        all_pass &= check("version" in vercel, "vercel.json has version field")
        all_pass &= check("buildCommand" in vercel, "vercel.json has buildCommand")
        all_pass &= check("outputDirectory" in vercel, "vercel.json has outputDirectory")
        
        if "outputDirectory" in vercel:
            check(vercel["outputDirectory"] == "frontend/dist", 
                  f"  - outputDirectory points to frontend/dist (found: {vercel['outputDirectory']})")
    except Exception as e:
        all_pass &= check(False, f"Error reading vercel.json: {e}")
    
    # Check configuration files
    section("🔧 Configuration Files")
    
    try:
        with open(project_root / "backend/config.py") as f:
            content = f.read()
            has_settings = "class Settings" in content
            has_cors = "cors_origins" in content
            all_pass &= check(has_settings, "config.py has Settings class")
            all_pass &= check(has_cors, "config.py has CORS configuration")
    except Exception as e:
        all_pass &= check(False, f"Error reading backend/config.py: {e}")
    
    # Check frontend vite config
    try:
        with open(project_root / "frontend/vite.config.js") as f:
            content = f.read()
            has_proxy = "proxy" in content
            all_pass &= check(has_proxy, "vite.config.js has proxy configuration")
    except Exception as e:
        all_pass &= check(False, f"Error reading frontend/vite.config.js: {e}")
    
    # Check backend requirements
    section("📋 Backend Dependencies")
    
    try:
        with open(project_root / "backend/requirements.txt") as f:
            reqs = f.read().lower()
            
        dependencies = {
            "fastapi": "FastAPI",
            "uvicorn": "Uvicorn",
            "pydantic": "Pydantic",
            "sqlalchemy": "SQLAlchemy",
            "python-dotenv": "Python-dotenv",
            "gunicorn": "Gunicorn",
        }
        
        for dep, name in dependencies.items():
            has_dep = dep in reqs
            all_pass &= check(has_dep, f"{name} in requirements.txt")
    except Exception as e:
        all_pass &= check(False, f"Error reading requirements.txt: {e}")
    
    # Check documentation
    section("📚 Documentation")
    
    docs = {
        "DEPLOYMENT.md": "Deployment guide",
        "QUICKSTART.md": "Quick start guide",
        "API_INTEGRATION.md": "API integration guide",
    }
    
    for doc_file, description in docs.items():
        exists = (project_root / doc_file).exists()
        all_pass &= check(exists, f"{description}: {doc_file}")
    
    # Check frontend services
    section("🔌 Frontend Services")
    
    try:
        api_utils = (project_root / "frontend/src/utils/api.js").exists()
        all_pass &= check(api_utils, "frontend/src/utils/api.js exists")
        
        scan_service = (project_root / "frontend/src/services/scanService.js").exists()
        all_pass &= check(scan_service, "frontend/src/services/scanService.js exists")
    except Exception as e:
        all_pass &= check(False, f"Error checking frontend services: {e}")
    
    # Final summary
    section("📊 Validation Summary")
    
    if all_pass:
        print(f"\n{Color.GREEN}✓ All checks passed!{Color.END}")
        print(f"\n{Color.BLUE}Your project is ready for deployment.{Color.END}")
        print("\nNext steps:")
        print("1. Update environment variables in frontend/.env.local and backend/.env")
        print("2. Review DEPLOYMENT.md for detailed deployment instructions")
        print("3. Push to GitHub and deploy to Vercel")
        print("4. Deploy backend to Render or Railway")
        return 0
    else:
        print(f"\n{Color.RED}✗ Some checks failed.{Color.END}")
        print("\nPlease fix the issues above before deploying.")
        print("Refer to DEPLOYMENT.md for more information.")
        return 1

if __name__ == "__main__":
    try:
        exit_code = validate()
        sys.exit(exit_code)
    except Exception as e:
        print(f"{Color.RED}Validation error: {e}{Color.END}")
        sys.exit(1)
