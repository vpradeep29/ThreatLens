#!/bin/bash
# Quick deployment setup script

echo "🚀 LVS-Advanced-Scanner Deployment Setup"
echo "========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "1️⃣ Installing dependencies..."
npm install
cd frontend && npm install && cd ..
cd backend && pip install -r requirements.txt && cd ..
echo "✅ Dependencies installed"
echo ""

echo "2️⃣ Setting up environment files..."
if [ ! -f "frontend/.env.local" ]; then
    cp frontend/.env.example frontend/.env.local
    echo "✅ Created frontend/.env.local"
else
    echo "⚠️  frontend/.env.local already exists"
fi

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
else
    echo "⚠️  backend/.env already exists"
fi
echo ""

echo "3️⃣ Verifying configuration..."
if [ -f "vercel.json" ]; then
    echo "✅ vercel.json found"
else
    echo "❌ vercel.json not found"
fi

if [ -f "DEPLOYMENT.md" ]; then
    echo "✅ DEPLOYMENT.md found"
else
    echo "❌ DEPLOYMENT.md not found"
fi
echo ""

echo "📋 Next Steps:"
echo "1. Update environment variables:"
echo "   - frontend/.env.local: Set VITE_API_BASE_URL"
echo "   - backend/.env: Set ALLOWED_ORIGINS and other settings"
echo ""
echo "2. For local development:"
echo "   npm run backend:dev  (in one terminal)"
echo "   npm run dev          (in another terminal)"
echo ""
echo "3. For deployment:"
echo "   - Read DEPLOYMENT.md for detailed instructions"
echo "   - Choose Architecture 1 (Recommended) or Architecture 2"
echo ""
echo "✅ Setup complete!"
