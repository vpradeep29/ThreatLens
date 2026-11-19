@echo off
REM Quick deployment setup script for Windows

echo 🚀 LVS-Advanced-Scanner Deployment Setup
echo =========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    exit /b 1
)

echo 1️⃣ Installing dependencies...
call npm install
cd frontend
call npm install
cd ..
cd backend
call pip install -r requirements.txt
cd ..
echo ✅ Dependencies installed
echo.

echo 2️⃣ Setting up environment files...
if not exist "frontend\.env.local" (
    copy frontend\.env.example frontend\.env.local
    echo ✅ Created frontend\.env.local
) else (
    echo ⚠️  frontend\.env.local already exists
)

if not exist "backend\.env" (
    copy backend\.env.example backend\.env
    echo ✅ Created backend\.env
) else (
    echo ⚠️  backend\.env already exists
)
echo.

echo 3️⃣ Verifying configuration...
if exist "vercel.json" (
    echo ✅ vercel.json found
) else (
    echo ❌ vercel.json not found
)

if exist "DEPLOYMENT.md" (
    echo ✅ DEPLOYMENT.md found
) else (
    echo ❌ DEPLOYMENT.md not found
)
echo.

echo 📋 Next Steps:
echo 1. Update environment variables:
echo    - frontend\.env.local: Set VITE_API_BASE_URL
echo    - backend\.env: Set ALLOWED_ORIGINS and other settings
echo.
echo 2. For local development:
echo    npm run backend:dev  (in one terminal)
echo    npm run dev          (in another terminal)
echo.
echo 3. For deployment:
echo    - Read DEPLOYMENT.md for detailed instructions
echo    - Choose Architecture 1 (Recommended) or Architecture 2
echo.
echo ✅ Setup complete!
