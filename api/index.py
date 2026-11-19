"""
Alternative WSGI app for Vercel deployment.
Use this only if deploying backend to Vercel (not recommended).
For production, deploy backend to Render/Railway instead.

To use with Vercel:
1. Deploy from the api/ directory
2. Vercel will automatically detect this as the entry point
3. Set environment variables in Vercel dashboard
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import json
import requests
from typing import Optional

from scanner.engine import ScannerEngine
from database import SessionLocal, ScanHistory
from config import settings

# Create FastAPI app
app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description=settings.api_description,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request models
class ScanRequest(BaseModel):
    target: str
    scan_type: str = "full"

class TestConnectionRequest(BaseModel):
    target: str

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "LVS-Scanner-Backend"}

@app.get("/")
def read_root():
    return {
        "status": "VulnScan Pro Backend Running",
        "version": settings.api_version,
        "api_docs": "/docs",
    }

# Test connection endpoint
@app.post("/api/test-connection")
def test_connection(req: TestConnectionRequest):
    target = req.target
    if not target.startswith("http"):
        target = "http://" + target
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 LVS/2.0"}
        response = requests.get(target, headers=headers, timeout=5, verify=False)
        return {
            "status": "success",
            "message": f"Successfully connected! HTTP {response.status_code}",
            "server": response.headers.get("Server", "Unknown")
        }
    except requests.exceptions.RequestException as e:
        if target.startswith("https://"):
            target = target.replace("https://", "http://", 1)
            try:
                response = requests.get(target, headers=headers, timeout=5, verify=False)
                return {
                    "status": "success",
                    "message": f"Successfully connected via HTTP! HTTP {response.status_code}",
                    "server": response.headers.get("Server", "Unknown")
                }
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

# WebSocket endpoint (may have limitations on Vercel)
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
        pass
    except Exception as e:
        try:
            await websocket.send_text(json.dumps({"type": "error", "message": str(e)}))
        except:
            pass
    finally:
        db.close()

# Export ASGI app for Vercel
asgi_app = app
