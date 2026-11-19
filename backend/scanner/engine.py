import time
import requests
import asyncio
import json
from urllib.parse import urlparse

from scanner.modules.ssl_checker import analyze_ssl
from scanner.modules.port_scanner import scan_ports
from scanner.modules.vuln_tester import test_payloads_async
from scanner.modules.directory_scanner import scan_directories
from scanner.modules.cve_mapper import map_cve_intelligence
from scanner.modules.crawler import AsyncCrawler
import aiohttp

class ScannerEngine:
    def __init__(self, target_url, scan_type="full", websocket=None):
        if not target_url.startswith("http"):
            target_url = "http://" + target_url
        self.target_url = target_url
        self.scan_type = scan_type
        self.websocket = websocket
        self.parsed_url = urlparse(target_url)
        self.findings = []
        self.risk_score = 100

    async def log(self, message):
        if self.websocket:
            try:
                await self.websocket.send_text(message)
            except:
                pass

    async def run_full_scan(self):
        start_time = time.time()
        # Input Normalization
        self.target_url = self.target_url.rstrip('/')
        
        await self.log(f"[*] Starting {self.scan_type.upper()} scan on {self.target_url}")
        if self.websocket:
            await self.websocket.send_text(json.dumps({"type": "progress", "module": "Recon & Fingerprinting", "percent": 5}))
        
        # 1. Recon & Base connectivity check
        try:
            await self.log("[*] Checking base connectivity & normalizing IP/URL...")
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 LVS/2.0"}
            response = requests.get(self.target_url, headers=headers, timeout=10, verify=False)
            self.target_url = response.url.rstrip('/') # Update target to handle redirects
            server_header = response.headers.get("Server", "Unknown")
        except requests.exceptions.RequestException as e:
            if self.target_url.startswith("https://"):
                await self.log("[-] HTTPS connection failed. Falling back to HTTP...")
                self.target_url = self.target_url.replace("https://", "http://", 1)
                try:
                    response = requests.get(self.target_url, headers=headers, timeout=10, verify=False)
                    self.target_url = response.url.rstrip('/')
                    server_header = response.headers.get("Server", "Unknown")
                except requests.exceptions.RequestException as e2:
                    await self.log(f"[-] Target unreachable: {str(e2)}")
                    return {"error": f"Target unreachable: {str(e2)}"}
            else:
                await self.log(f"[-] Target unreachable: {str(e)}")
                return {"error": f"Target unreachable: {str(e)}"}

        if self.websocket:
            await self.websocket.send_text(json.dumps({"type": "progress", "module": "Config Analysis", "percent": 20}))
            
        # Basic Level (Config & Headers)
        await self.log("[*] Analyzing HTTP Security Headers & Config...")
        self._analyze_headers(response.headers)
        
        if self.websocket:
            await self.websocket.send_text(json.dumps({"type": "progress", "module": "Network Port Scanner", "percent": 40}))
            
        # Network Scanner (Ports)
        await self.log("[*] Scanning common ports asynchronously...")
        self.risk_score = await scan_ports(self.target_url, self.findings, self.risk_score)
        
        # Full OWASP Level
        if self.scan_type in ["full", "advanced"]:
            if self.target_url.startswith("https"):
                await self.log("[*] Analyzing SSL/TLS Configuration...")
                self.risk_score = analyze_ssl(self.target_url, self.findings, self.risk_score)
                
            if self.websocket:
                await self.websocket.send_text(json.dumps({"type": "progress", "module": "Intelligent Async Crawler", "percent": 55}))
                
            await self.log("[*] Initializing Async Crawler (BFS Depth=1)...")
            crawler = AsyncCrawler(self.target_url, max_depth=1)
            crawl_results = await crawler.crawl()
            forms = crawl_results["forms"]
            await self.log(f"[*] Crawler discovered {len(crawl_results['endpoints'])} endpoints and {len(forms)} HTML forms.")
                
            if self.websocket:
                await self.websocket.send_text(json.dumps({"type": "progress", "module": "Injection & XSS Tester", "percent": 65}))
                
            await self.log("[*] Generating dynamic payloads via Test Case Engine...")
            await self.log("[*] Injecting active payloads into discovered forms...")
            self.risk_score = await test_payloads_async(forms, self.findings, self.risk_score)
        
        # Advanced Level
        if self.scan_type == "advanced":
            if self.websocket:
                await self.websocket.send_text(json.dumps({"type": "progress", "module": "Directory Fuzzing", "percent": 80}))
            await self.log("[*] Fuzzing sensitive directories...")
            self.risk_score = await scan_directories(self.target_url, self.findings, self.risk_score)
            
        # Phase 3: CVE Mapping
        if self.websocket:
            await self.websocket.send_text(json.dumps({"type": "progress", "module": "CVE Intelligence Mapping", "percent": 90}))
        await self.log("[*] Querying CVE Intelligence Module for service signatures...")
        self.risk_score = map_cve_intelligence(server_header, self.findings, self.risk_score)
        
        end_time = time.time()
        await self.log(f"[+] Intelligence Scan completed in {round(end_time - start_time, 2)} seconds.")
        
        return {
            "target": self.target_url,
            "scan_date": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "server": server_header,
            "duration_seconds": round(end_time - start_time, 2),
            "risk_score": max(0, self.risk_score),
            "findings": self.findings
        }

    def _analyze_headers(self, headers):
        """Basic header analysis MVP module"""
        security_headers = {
            "Content-Security-Policy": {"severity": "High", "cwe": "CWE-352"},
            "X-Frame-Options": {"severity": "Medium", "cwe": "CWE-1021"},
            "Strict-Transport-Security": {"severity": "High", "cwe": "CWE-319"},
            "X-Content-Type-Options": {"severity": "Low", "cwe": "CWE-693"}
        }

        for header, info in security_headers.items():
            if header not in headers:
                self.findings.append({
                    "id": f"HDR-{len(self.findings)+1}",
                    "title": f"Missing Security Header: {header}",
                    "severity": info["severity"],
                    "cwe": info["cwe"],
                    "description": f"The response does not include the {header} header, which helps protect against certain types of attacks.",
                    "remediation": f"Ensure the server is configured to include the {header} header in all responses."
                })
                # Adjust risk score roughly
                if info["severity"] == "High":
                    self.risk_score -= 15
                elif info["severity"] == "Medium":
                    self.risk_score -= 10
                else:
                    self.risk_score -= 5
