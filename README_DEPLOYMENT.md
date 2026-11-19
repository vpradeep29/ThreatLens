# LVS-Advanced-Scanner - Vercel Deployment Configuration

Complete production-ready deployment configuration for React + Vite frontend and FastAPI backend.

## 📋 What's Included

### ✅ Deployment Configurations
- **vercel.json** - Frontend-only Vercel config (recommended)
- **vercel-full-stack.json** - Alternative full-stack Vercel config
- **backend/render.yaml** - Render deployment config
- **backend/railway.toml** - Railway deployment config
- **.vercelignore** - Files to exclude from Vercel builds

### ✅ Configuration Files
- **backend/config.py** - Centralized configuration management
- **frontend/vite.config.js** - Optimized Vite build config with API proxy
- **frontend/package.json** - Frontend dependencies and scripts
- **backend/requirements.txt** - Updated with production dependencies
- **package.json** - Root package with utility scripts

### ✅ Environment Templates
- **frontend/.env.example** - Frontend environment variables template
- **backend/.env.example** - Backend environment variables template
- **.gitignore** - Proper ignore patterns for Node, Python, and IDE files

### ✅ Frontend Integration
- **frontend/src/utils/api.js** - Axios API client with interceptors
- **frontend/src/services/scanService.js** - Scan service layer

### ✅ Backend Deployment
- **backend/main.py** - Updated with configuration management
- **api/index.py** - WSGI app entry point for Vercel (optional)

### ✅ Documentation
- **DEPLOYMENT.md** - Comprehensive deployment guide
- **QUICKSTART.md** - 5-minute quick start guide
- **API_INTEGRATION.md** - API integration and routing guide
- **validate_deployment.py** - Configuration validation script

### ✅ Setup Scripts
- **setup.sh** - Bash setup script for macOS/Linux
- **setup.bat** - Batch setup script for Windows

---

## 🚀 Quick Start

### 1. Run Setup Script
```bash
# Windows
setup.bat

# macOS/Linux
bash setup.sh
```

### 2. Configure Environment
```bash
# Frontend
echo "VITE_API_BASE_URL=http://localhost:8000" > frontend/.env.local

# Backend
cp backend/.env.example backend/.env
```

### 3. Run Locally
```bash
# Terminal 1
npm run backend:dev

# Terminal 2
npm run dev
```

Access: http://localhost:5173

### 4. Validate Configuration
```bash
python validate_deployment.py
```

---

## 📦 Deployment Architecture

### Recommended: Frontend on Vercel + Backend on Render
```
┌─────────────────────────────────────────┐
│  Your Domain                            │
├─────────────────────────────────────────┤
│  Vercel (Frontend)                      │
│  - React + Vite App                     │
│  - Static Assets                        │
│  - Automatic Deployments                │
└──────────────────┬──────────────────────┘
                   │ HTTPS API Calls
                   ▼
         ┌─────────────────────┐
         │ Render (Backend)    │
         │ - FastAPI App       │
         │ - WebSocket Support │
         │ - Database          │
         └─────────────────────┘
```

### Alternative: Everything on Vercel
```
┌────────────────────────────────────────┐
│  Vercel (Full Stack)                   │
├────────────────────────────────────────┤
│  Frontend (React + Vite)               │
├────────────────────────────────────────┤
│  Backend (/api routes)                 │
│  ⚠️  60-second timeout limit           │
│  ⚠️  No persistent WebSocket           │
└────────────────────────────────────────┘
```

---

## 📊 Project Structure

```
LVS-Advanced-Scanner/
├── frontend/                    # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/            # NEW: API Services
│   │   ├── utils/               # NEW: API Client
│   │   ├── context/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json             # ✅ UPDATED
│   ├── vite.config.js           # ✅ UPDATED
│   ├── .env.example             # ✅ NEW
│   └── .env.local               # (your local config)
│
├── backend/                     # FastAPI Backend
│   ├── main.py                  # ✅ UPDATED
│   ├── config.py                # ✅ NEW: Configuration
│   ├── database.py
│   ├── scanner/
│   ├── requirements.txt          # ✅ UPDATED
│   ├── .env.example             # ✅ NEW
│   ├── .env                      # (your local config)
│   ├── render.yaml              # ✅ NEW: Render Config
│   └── railway.toml             # ✅ NEW: Railway Config
│
├── api/                         # Vercel Functions (optional)
│   └── index.py                 # ✅ NEW: WSGI App
│
├── package.json                 # ✅ NEW: Root Package
├── vercel.json                  # ✅ NEW: Vercel Config
├── vercel-full-stack.json       # ✅ NEW: Alternative Config
├── .vercelignore                # ✅ NEW: Vercel Ignore
├── .gitignore                   # ✅ UPDATED
│
├── DEPLOYMENT.md                # ✅ NEW: Detailed Guide
├── QUICKSTART.md                # ✅ NEW: Quick Start
├── API_INTEGRATION.md           # ✅ NEW: API Guide
│
├── setup.sh                      # ✅ NEW: Unix Setup
├── setup.bat                     # ✅ NEW: Windows Setup
├── validate_deployment.py        # ✅ NEW: Validator
│
└── README.md                    # (your project README)
```

---

## 🔧 Configuration Changes

### Backend Changes
1. ✅ Added `config.py` for environment-based configuration
2. ✅ Updated `main.py` to use configuration
3. ✅ Updated `requirements.txt` with production dependencies
4. ✅ Added `.env.example` template
5. ✅ Created `api/index.py` for Vercel deployment

### Frontend Changes
1. ✅ Created `package.json` with proper dependencies
2. ✅ Updated `vite.config.js` with:
   - API proxy configuration
   - Production optimizations
   - Environment variables
   - Chunk optimization
3. ✅ Added `.env.example` template
4. ✅ Created `src/utils/api.js` for API client
5. ✅ Created `src/services/scanService.js` for scan operations

### Project Changes
1. ✅ Created `package.json` with utility scripts
2. ✅ Created `vercel.json` for Vercel deployment
3. ✅ Created `vercel-full-stack.json` alternative config
4. ✅ Created `.vercelignore` for build optimization
5. ✅ Updated `.gitignore` with proper patterns

---

## 📚 Documentation

### [DEPLOYMENT.md](./DEPLOYMENT.md)
Comprehensive deployment guide covering:
- Architecture 1: Recommended (Vercel + Render)
- Architecture 2: Full-Stack Vercel
- Prerequisites and setup
- Step-by-step deployment instructions
- Environment variables
- Security considerations
- Troubleshooting

### [QUICKSTART.md](./QUICKSTART.md)
Fast start guide with:
- 5-minute local setup
- Development workflow
- Deployment options
- Configuration reference
- Troubleshooting

### [API_INTEGRATION.md](./API_INTEGRATION.md)
API integration details:
- Endpoint documentation
- Frontend integration patterns
- Environment configuration
- URL routing for different environments
- Error handling
- Testing commands

---

## 🔐 Environment Variables

### Frontend (frontend/.env.local)
```env
VITE_API_BASE_URL=http://localhost:8000  # Development
# VITE_API_BASE_URL=https://your-backend.onrender.com  # Production
```

### Backend (backend/.env)
```env
DATABASE_URL=sqlite:///./scan_history.db
DEBUG=false
ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend.vercel.app
API_PORT=8000
API_HOST=0.0.0.0
MAX_TIMEOUT=300
MAX_CONCURRENT_SCANS=5
```

---

## ✅ Deployment Checklist

- [ ] Run `python validate_deployment.py` - verify configuration
- [ ] Run setup script - install dependencies
- [ ] Configure frontend/.env.local - set API base URL
- [ ] Configure backend/.env - set environment variables
- [ ] Test locally - `npm run dev` and `npm run backend:dev`
- [ ] Push to GitHub
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Render/Railway
- [ ] Update frontend API URL with backend URL
- [ ] Test API integration
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring (optional)

---

## 🆘 Troubleshooting

### Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules frontend/node_modules
npm install
cd frontend && npm install
```

### Environment Variables
```bash
# Make sure files exist
ls frontend/.env.local
ls backend/.env

# Check they're not empty
cat frontend/.env.local
cat backend/.env
```

### API Connection
```bash
# Test backend health
curl http://localhost:8000/health

# Check CORS is configured
curl -H "Origin: http://localhost:5173" http://localhost:8000/health
```

### Validation
```bash
python validate_deployment.py
```

---

## 📞 Support Resources

- [Vite Documentation](https://vitejs.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app/)

---

## 🎯 Next Steps

1. **Immediate**: Run setup script and validate configuration
2. **Development**: Test locally with `npm run dev`
3. **Deployment**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md) for your chosen architecture
4. **Production**: Monitor logs and set up error tracking

---

**Happy Deploying! 🚀**

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
