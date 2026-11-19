# LVS-Advanced-Scanner Deployment Guide

## 📋 Overview

This project has been configured for production deployment on Vercel. Two deployment architectures are provided:

### **Architecture 1: Recommended (Frontend on Vercel + Backend on Render/Railway)**
- ✅ Best for WebSocket support, long-running scans
- ✅ Unlimited execution time
- ✅ Better performance and reliability
- ✅ Production-ready for intensive scanning operations

### **Architecture 2: Vercel Full-Stack (Everything on Vercel)**
- ⚠️ Limited to 60-second function execution
- ⚠️ No persistent WebSocket connections
- ⚠️ Limited for long-running security scans
- ✅ Simple single-platform deployment

---

## 🚀 Architecture 1: Recommended Setup (RECOMMENDED)

### Prerequisites
- Vercel account (vercel.com)
- Render or Railway account
- GitHub repository

### Part 1: Deploy Frontend to Vercel

1. **Create `.env.local` in `frontend/` directory:**
   ```
   VITE_API_BASE_URL=https://your-backend-url.onrender.com
   ```

2. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add Vercel configuration"
   git push
   ```

3. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   vercel deploy --cwd frontend
   ```

4. **Or use Vercel Dashboard:**
   - Go to vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Select `frontend` as root directory
   - Add environment variable: `VITE_API_BASE_URL=https://your-backend-url.onrender.com`
   - Deploy

### Part 2: Deploy Backend to Render

1. **Update `backend/.env`:**
   ```
   DATABASE_URL=sqlite:///./scan_history.db
   DEBUG=false
   ALLOWED_ORIGINS=https://your-frontend-vercel.vercel.app,http://localhost:3000
   API_PORT=8000
   API_HOST=0.0.0.0
   MAX_TIMEOUT=300
   MAX_CONCURRENT_SCANS=5
   ```

2. **Create `backend/render.yaml`:**
   ```yaml
   services:
     - type: web
       name: lvs-scanner-backend
       env: python
       plan: free
       buildCommand: "pip install -r requirements.txt"
       startCommand: "uvicorn main:app --host 0.0.0.0 --port $PORT"
       envVars:
         - key: PYTHONUNBUFFERED
           value: true
         - key: DEBUG
           value: false
   ```

3. **Deploy to Render:**
   - Go to render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository
   - Configure:
     - **Name:** lvs-scanner-backend
     - **Environment:** Python 3
     - **Build Command:** `pip install -r requirements.txt`
     - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
     - **Plan:** Free (or paid for better performance)
   - Add Environment Variables (see backend/.env.example)
   - Deploy

4. **Update Frontend Environment Variable:**
   - Go to Vercel Dashboard → your project
   - Settings → Environment Variables
   - Update `VITE_API_BASE_URL` with your Render backend URL
   - Redeploy

---

## 🐋 Architecture 2: Full-Stack Vercel Deployment

### Deploy Everything to Vercel

1. **Prepare environment:**
   ```bash
   # Create .env.production.local in frontend/
   echo "VITE_API_BASE_URL=/api" > frontend/.env.production.local
   ```

2. **Update `vercel.json`:**
   Replace the content with `vercel-full-stack.json`:
   ```bash
   cp vercel-full-stack.json vercel.json
   ```

3. **Update environment variables in Vercel:**
   - `VITE_API_BASE_URL=/api` (routes to Vercel functions)
   - Any other required environment variables

4. **Deploy:**
   ```bash
   vercel --prod
   ```

### ⚠️ Limitations
- ❌ WebSocket connections: Limited to 60 seconds
- ❌ Long-running scans: May timeout
- ❌ Concurrent scans: Limited to 3 per free tier
- ✅ Simple URLs: `/api` routes automatically proxy to functions

---

## 📦 Local Development

### Setup

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Create environment files:**
   ```bash
   cp frontend/.env.example frontend/.env.local
   cp backend/.env.example backend/.env
   ```

3. **Update backend/.env:**
   ```
   DATABASE_URL=sqlite:///./scan_history.db
   DEBUG=true
   API_PORT=8000
   ```

### Run Locally

**Terminal 1 - Backend:**
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Access at: http://localhost:5173

---

## 🔧 Configuration Files

### `vercel.json` (Frontend Only - Recommended)
- Points API requests to external backend
- Optimal for Render/Railway backend deployment
- **Use this for Architecture 1**

### `vercel-full-stack.json` (Full Stack)
- Includes both frontend and API routes
- Routes `/api/*` to Vercel functions
- **Use this for Architecture 2**

### `.vercelignore`
- Excludes unnecessary files from deployment
- Reduces build time and size

### `frontend/.env.example` & `backend/.env.example`
- Environment variable templates
- Copy and customize before deployment

---

## 📚 Project Structure After Setup

```
LVS-Advanced-Scanner/
├── api/                    # Vercel Python functions (full-stack only)
│   └── index.py           # ASGI app entry point
├── backend/               # FastAPI backend
│   ├── main.py            # Main application
│   ├── config.py          # Configuration management
│   ├── requirements.txt    # Python dependencies
│   ├── .env               # Environment variables
│   ├── .env.example       # Example env file
│   ├── database.py        # Database setup
│   └── scanner/           # Scanning modules
├── frontend/              # React + Vite frontend
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.js     # Vite configuration
│   ├── .env.local         # Frontend env variables
│   ├── .env.example       # Example env file
│   ├── src/
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   └── pages/         # React pages
│   └── dist/              # Build output
├── package.json           # Root package.json
├── vercel.json            # Vercel config (use this)
├── vercel-full-stack.json # Alternative full-stack config
└── .vercelignore          # Files to ignore in deployment
```

---

## 🔐 Security Considerations

### CORS Configuration
- Frontend URL is whitelisted in backend CORS settings
- Update `ALLOWED_ORIGINS` in backend/.env before deployment

### Environment Variables
- Never commit `.env` files to git
- Use `.env.example` as template
- Add sensitive data through deployment platform dashboard

### Database
- SQLite database persists on backend server
- For production, consider PostgreSQL on Render

### API Security
- All API calls go through CORS middleware
- WebSocket connections authenticated per request
- Timeout limits prevent long-running processes from consuming resources

---

## 🧪 Testing Deployment

### Test Frontend
```bash
# Build frontend locally
cd frontend
npm run build

# Preview production build
npm run preview
```

### Test Backend
```bash
# Run backend in production mode
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### Test API Integration
```bash
# Test connection endpoint
curl -X POST http://localhost:8000/api/test-connection \
  -H "Content-Type: application/json" \
  -d '{"target": "https://example.com"}'

# Get scan history
curl http://localhost:8000/api/history
```

---

## 📊 Deployment Checklist

- [ ] Frontend environment variables configured
- [ ] Backend environment variables configured
- [ ] CORS origins updated for production URLs
- [ ] GitHub repository connected to Vercel
- [ ] Backend deployed to Render/Railway
- [ ] Frontend-to-backend URLs verified
- [ ] SSL certificates configured
- [ ] Database backups enabled
- [ ] Error logging configured
- [ ] Performance monitoring enabled
- [ ] Domain configured
- [ ] DNS records updated

---

## 🆘 Troubleshooting

### "CORS Error" when frontend calls backend
**Solution:** Update `ALLOWED_ORIGINS` in backend/.env with your frontend URL

### "Connection Refused" to backend
**Solution:** Verify backend is deployed and running, check URL in frontend .env.local

### WebSocket connection fails
**Render/Railway:** Should work fine
**Vercel Full-Stack:** Check 60-second limit

### "Module not found" error
**Solution:** Run `pip install -r requirements.txt` in backend directory

### Environment variables not loading
**Solution:** Restart deployment after updating environment variables in dashboard

---

## 📞 Support

For issues:
1. Check deployment logs in Vercel/Render dashboard
2. Review environment variables configuration
3. Verify GitHub repository is up to date
4. Check firewall/network settings

---

## 📝 Next Steps

1. Choose deployment architecture (recommended: Architecture 1)
2. Set up environment variables
3. Push to GitHub
4. Deploy frontend to Vercel
5. Deploy backend to Render/Railway
6. Test API integration
7. Configure domain names
8. Monitor logs and performance

Good luck with your deployment! 🚀
