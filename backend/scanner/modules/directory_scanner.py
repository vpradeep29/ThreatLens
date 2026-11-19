import requests
import asyncio
from urllib.parse import urlparse

async def check_path(base_url, path):
    url = f"{base_url.rstrip('/')}{path}"
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 LVS/2.0"}
        response = await asyncio.to_thread(requests.get, url, headers=headers, timeout=3, verify=False, allow_redirects=False)
        if response.status_code in [200, 301, 302, 401, 403]:
            return path, response.status_code
    except:
        pass
    return path, None

async def scan_directories(url, findings, risk_score):
    sensitive_paths = [
        "/.git/config",
        "/.env",
        "/admin",
        "/wp-admin",
        "/backup.zip",
        "/api/swagger.json",
        "/actuator/env",
        "/phpinfo.php"
    ]
    
    # Get baseline response for a non-existent path to detect false positives (SPA fallback)
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) LVS/2.0"}
    baseline_path = "/nonexistent_path_lvs_test"
    baseline_url = f"{url.rstrip('/')}{baseline_path}"
    
    try:
        baseline_res = await asyncio.to_thread(requests.get, baseline_url, headers=headers, timeout=3, verify=False, allow_redirects=False)
        baseline_status = baseline_res.status_code
        baseline_content_len = len(baseline_res.content)
    except:
        baseline_status = None
        baseline_content_len = 0

    tasks = [check_path(url, path) for path in sensitive_paths]
    results = await asyncio.gather(*tasks)
    
    for path, status in results:
        if status:
            # Simple false positive detection: if status and content length match the baseline, it's likely a fallback
            # We can't easily get content length from check_path without modifying it, 
            # but we can at least check if the status code is the same as a known non-existent path.
            # If the server returns 200 for /non-existent, then a 200 for /admin is likely a false positive.
            if status == baseline_status:
                continue

            severity = "Critical" if path in ["/.env", "/.git/config"] else "High"
            risk_reduction = 30 if severity == "Critical" else 15
            
            findings.append({
                "id": f"DIR-{path.replace('/', '')}",
                "title": f"Sensitive File/Directory Discovered: {path}",
                "severity": severity,
                "cwe": "CWE-425",
                "description": f"The scanner found an exposed sensitive path at `{path}` which returned a {status} status code. This may expose configuration secrets, source code, or administrative interfaces.",
                "remediation": "Remove these files from the web root or restrict access using authentication and IP whitelisting."
            })
            risk_score -= risk_reduction
            
    return risk_score
