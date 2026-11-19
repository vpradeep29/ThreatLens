# API Integration Guide

## Overview

This document explains how the frontend integrates with the backend API and how to properly configure URLs for different deployment environments.

## API Endpoints

### Health & Info
- `GET /` - Backend status
- `GET /health` - Health check
- `GET /docs` - Interactive API documentation (Swagger UI)

### Scan Operations
- `POST /api/test-connection` - Test connection to target
  ```json
  {
    "target": "https://example.com"
  }
  ```

- `GET /api/history` - Get previous scan history
  
- `WS /ws/scan` - WebSocket endpoint for live scanning
  ```json
  {
    "target": "https://example.com",
    "scan_type": "full"
  }
  ```

## Frontend Integration

### Setup API Client

Create `frontend/src/utils/api.js`:
```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptors for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
```

### Use in Components

```javascript
import { apiClient } from '@/utils/api';

// Test connection
const testConnection = async (target) => {
  const response = await apiClient.post('/api/test-connection', { target });
  return response.data;
};

// Get history
const getHistory = async () => {
  const response = await apiClient.get('/api/history');
  return response.data;
};

// WebSocket scan
const startScan = (target) => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${wsProtocol}//${window.location.host}/ws/scan`;
  
  const ws = new WebSocket(wsUrl);
  ws.send(JSON.stringify({ target, scan_type: 'full' }));
  
  return ws;
};
```

## Environment Configuration

### Development (localhost)
```
Frontend:  http://localhost:5173
Backend:   http://localhost:8000
VITE_API_BASE_URL=http://localhost:8000
```

### Production (Vercel Frontend + Render Backend)
```
Frontend:  https://app.yourdomain.com (vercel)
Backend:   https://api.yourdomain.com (render)
VITE_API_BASE_URL=https://api.yourdomain.com
```

### Full-Stack Vercel
```
Frontend:  https://app.vercel.app
Backend:   https://app.vercel.app/api
VITE_API_BASE_URL=/api
```

## URL Routing

### Development
Frontend proxy in `vite.config.js`:
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
    '/ws': {
      target: 'ws://localhost:8000',
      ws: true,
    }
  }
}
```

### Production (Separate Services)
Frontend calls direct URLs:
```javascript
const API_BASE_URL = 'https://api.yourdomain.com';
```

### Production (Vercel Full-Stack)
Frontend calls local paths:
```javascript
const API_BASE_URL = '/api';  // Vercel rewrites to functions
```

## CORS Configuration

Backend CORS is configured in `backend/config.py`:
```python
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://your-frontend.vercel.app",
]
```

Update in `backend/.env`:
```
ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend.vercel.app
```

## Error Handling

### Common Issues

**CORS Error**: "No 'Access-Control-Allow-Origin' header"
- Solution: Add frontend URL to `ALLOWED_ORIGINS`

**Connection Refused**: "Failed to connect to API"
- Solution: Check backend is running, verify URL in environment variables

**WebSocket timeout**: "WebSocket closed"
- Vercel Full-Stack: 60-second limit
- Solution: Use Render/Railway backend

**API returns 404**: "Endpoint not found"
- Solution: Check endpoint path, verify API is running

## Testing API Endpoints

### Using cURL

```bash
# Health check
curl http://localhost:8000/health

# Test connection
curl -X POST http://localhost:8000/api/test-connection \
  -H "Content-Type: application/json" \
  -d '{"target":"https://example.com"}'

# Get history
curl http://localhost:8000/api/history
```

### Using Swagger UI
Visit: http://localhost:8000/docs

### Using JavaScript
```javascript
// In browser console
fetch('http://localhost:8000/api/history')
  .then(r => r.json())
  .then(console.log)
```

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| VITE_API_BASE_URL | Frontend API endpoint | http://localhost:8000 |
| DATABASE_URL | Backend database | sqlite:///./scan_history.db |
| ALLOWED_ORIGINS | CORS allowed origins | http://localhost:5173 |
| DEBUG | Enable debug mode | false |
| MAX_TIMEOUT | Scan timeout (seconds) | 300 |
| MAX_CONCURRENT_SCANS | Parallel scans | 5 |

## Production Deployment

### Step 1: Configure Endpoints
**Frontend (.env.production):**
```
VITE_API_BASE_URL=https://your-backend.onrender.com
```

**Backend (.env):**
```
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### Step 2: Deploy Services
1. Push to GitHub
2. Deploy frontend to Vercel
3. Deploy backend to Render
4. Test endpoints

### Step 3: Verify Integration
1. Check browser console for API errors
2. Test connection in Scanner page
3. Verify WebSocket connection
4. Check scan history loads

## Monitoring & Debugging

### Frontend Debugging
```javascript
// Log API requests
apiClient.interceptors.request.use(config => {
  console.log('API Request:', config);
  return config;
});

// Check environment
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
```

### Backend Debugging
```python
# Enable debug mode in .env
DEBUG=true

# Check logs
python -m uvicorn main:app --reload --log-level debug
```

### Network Debugging
- Open browser DevTools (F12)
- Go to Network tab
- Check API requests/responses
- Verify CORS headers

---

For more information, see [DEPLOYMENT.md](./DEPLOYMENT.md) and [QUICKSTART.md](./QUICKSTART.md)
