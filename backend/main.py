from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import json
import requests
import logging

from scanner.engine import ScannerEngine
from database import SessionLocal, ScanHistory
from config import settings

# Setup logging
logging.basicConfig(level=logging.DEBUG if settings.debug else logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app with configuration
app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description=settings.api_description,
)

# Configure CORS with environment settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https:; connect-src 'self';"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

class ScanRequest(BaseModel):
    target: str
    scan_type: str = "full"

class TestConnectionRequest(BaseModel):
    target: str

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "LVS-Scanner-Backend", "version": settings.api_version}

@app.get("/")
def read_root():
    return {
        "status": "VulnScan Pro Backend Running",
        "version": settings.api_version,
        "api_docs": "/docs",
        "health": "/health",
    }

@app.post("/api/test-connection")
def test_connection(req: TestConnectionRequest):
    target = req.target
    if not target.startswith("http"):
        target = "http://" + target
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 LVS/2.0"}
        response = requests.get(target, headers=headers, timeout=5, verify=False)
        return {"status": "success", "message": f"Successfully connected! HTTP {response.status_code}", "server": response.headers.get("Server", "Unknown")}
    except requests.exceptions.RequestException as e:
        if target.startswith("https://"):
            target = target.replace("https://", "http://", 1)
            try:
                response = requests.get(target, headers=headers, timeout=5, verify=False)
                return {"status": "success", "message": f"Successfully connected via HTTP! HTTP {response.status_code}", "server": response.headers.get("Server", "Unknown")}
            except requests.exceptions.RequestException as e2:
                return {"status": "error", "message": f"Target unreachable: {str(e2)}"}
        return {"status": "error", "message": f"Target unreachable: {str(e)}"}

@app.get("/api/history")
def get_history():
    db = SessionLocal()
    try:
        history = db.query(ScanHistory).order_by(ScanHistory.scan_date.desc()).all()
        result = []
        for h in history:
            result.append({
                "id": h.id,
                "target": h.target,
                "scan_type": h.scan_type,
                "scan_date": h.scan_date.isoformat(),
                "risk_score": h.risk_score,
                "duration": h.duration_seconds,
                "findings_count": len(json.loads(h.findings_json)) if h.findings_json else 0
            })
        return {"status": "success", "data": result}
    finally:
        db.close()

@app.websocket("/ws/scan")
async def websocket_scan(websocket: WebSocket):
    await websocket.accept()
    db = SessionLocal()
    try:
        data = await websocket.receive_text()
        req = json.loads(data)
        target = req.get("target")
        scan_type = req.get("scan_type", "full")
        
        engine = ScannerEngine(target, scan_type, websocket)
        results = await engine.run_full_scan()
        
        if "error" in results:
            await websocket.send_text(json.dumps({"type": "error", "message": results["error"]}))
            return
            
        # Save to history
        db_history = ScanHistory(
            target=target,
            scan_type=scan_type,
            risk_score=results["risk_score"],
            duration_seconds=str(results["duration_seconds"]),
            findings_json=json.dumps(results["findings"])
        )
        db.add(db_history)
        db.commit()
        
        await websocket.send_text(json.dumps({"type": "results", "data": results}))
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        try:
            await websocket.send_text(json.dumps({"type": "error", "message": str(e)}))
        except:
            pass
    finally:
        db.close()

