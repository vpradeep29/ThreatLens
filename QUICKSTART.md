# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- Git

### Step 1: Clone and Setup
```bash
# Clone your repository
git clone https://github.com/your-username/LVS-Advanced-Scanner.git
cd LVS-Advanced-Scanner

# Unified Setup (Recommended)
npm run install:all

# OR Manual Setup
# Windows
setup.bat
# macOS/Linux
bash setup.sh
```

### Step 2: Configure Environment
Edit `frontend/.env.local`:
```env
VITE_API_BASE_URL=http://localhost:8000
```

Edit `backend/.env`:
```env
DATABASE_URL=sqlite:///./scan_history.db
DEBUG=true
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Step 3: Run Locally (Unified Commands)
```bash
# Terminal 1: Start Backend
npm run backend:dev

# Terminal 2: Start Frontend
npm run dev
```

### Step 3 (Alternative): Run Manually
```bash
# Terminal 1: Start Backend
cd backend
python -m uvicorn main:app --reload

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

Access: http://localhost:5173

---

## 📦 Deployment Options

### Option A: Recommended (Vercel + Render)

**Frontend to Vercel:**
```bash
vercel deploy --cwd frontend --prod
```

**Backend to Render:**
1. Go to render.com
2. New Web Service
3. Connect GitHub
4. Set buildCommand: `pip install -r requirements.txt`
5. Set startCommand: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add env vars from backend/.env
7. Deploy

### Option B: Everything on Vercel

```bash
# Use the full-stack configuration
cp vercel-full-stack.json vercel.json

# Deploy
vercel deploy --prod
```

⚠️ Note: WebSocket and long-running scans have 60-second timeout limit on Vercel

---

## 🔧 Configuration Files

### Frontend
- `frontend/.env.local` - Frontend environment variables
- `frontend/vite.config.js` - Vite build configuration
- `frontend/package.json` - Dependencies and scripts

### Backend
- `backend/.env` - Backend environment variables
- `backend/config.py` - Application configuration
- `backend/requirements.txt` - Python dependencies
- `backend/main.py` - FastAPI application

### Deployment
- `vercel.json` - Vercel config (frontend + external backend)
- `vercel-full-stack.json` - Vercel full-stack config
- `backend/render.yaml` - Render deployment config
- `backend/railway.toml` - Railway deployment config
- `.vercelignore` - Files to exclude from Vercel builds
- `.gitignore` - Files to exclude from git

---

## 📊 Project Structure

```
LVS-Advanced-Scanner/
├── frontend/              # React + Vite application
│   ├── public/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── utils/        # Utility functions
│   │   ├── context/      # React context
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── backend/               # FastAPI application
│   ├── main.py           # Main app entry point
│   ├── config.py         # Configuration management
│   ├── database.py       # Database setup
│   ├── scanner/          # Scanning modules
│   ├── requirements.txt
│   ├── .env.example
│   └── render.yaml       # Render deployment
│
├── api/                   # Vercel Python functions (optional)
│   └── index.py
│
├── package.json          # Root package
├── vercel.json           # Vercel config
├── .gitignore
├── DEPLOYMENT.md         # Detailed deployment guide
├── QUICKSTART.md         # This file
└── setup.sh/setup.bat    # Setup script
```

---

## 🔒 Environment Variables

### Frontend (frontend/.env.local)
```env
# API endpoint - update for production
VITE_API_BASE_URL=http://localhost:8000
```

### Backend (backend/.env)
```env
# Database
DATABASE_URL=sqlite:///./scan_history.db

# Debug mode
DEBUG=false

# CORS - comma-separated origins
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://your-frontend.vercel.app

# Server
API_PORT=8000
API_HOST=0.0.0.0

# Scanning
MAX_TIMEOUT=300
MAX_CONCURRENT_SCANS=5
```

---

## ✅ Verification

### Test Backend
```bash
# Health check
curl http://localhost:8000/health

# API documentation
curl http://localhost:8000/docs

# Test connection endpoint
curl -X POST http://localhost:8000/api/test-connection \
  -H "Content-Type: application/json" \
  -d '{"target":"https://example.com"}'
```

### Test Frontend
```bash
# Frontend runs at http://localhost:5173
# Check console for API errors
# Test WebSocket connection in Scanner page
```

---

## 🆘 Troubleshooting

| Error | Solution |
|-------|----------|
| CORS error | Update `ALLOWED_ORIGINS` in backend/.env |
| API not found | Check `VITE_API_BASE_URL` in frontend/.env.local |
| Module not found | Run `pip install -r requirements.txt` |
| Port already in use | Change port in vite.config.js or use different terminal |
| WebSocket won't connect | Check backend is running and WebSocket URL is correct |

---

## 📚 Additional Resources

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide
- [Vite Documentation](https://vitejs.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)

---

## 🎯 Next Steps

1. ✅ Run setup script
2. ✅ Configure environment variables
3. ✅ Test locally
4. ✅ Deploy frontend
5. ✅ Deploy backend
6. ✅ Update frontend with backend URL
7. ✅ Test production deployment

Good luck! 🚀
