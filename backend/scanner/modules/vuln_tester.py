import urllib.parse
import aiohttp
import asyncio
import time
from .payload_generator import generator

async def test_form_payload(session, url, method, data, headers):
    start_time = time.time()
    try:
        if method == "post":
            async with session.post(url, data=data, headers=headers, timeout=5, ssl=False) as resp:
                text = await resp.text()
                return resp.status, text, time.time() - start_time
        else:
            async with session.get(url, params=data, headers=headers, timeout=5, ssl=False) as resp:
                text = await resp.text()
                return resp.status, text, time.time() - start_time
    except Exception:
        return 0, "", 0

async def test_payloads_async(forms, findings, risk_score):
    """
    Advanced async payload tester with Diffing and Timing detection.
    Tests payloads against the forms discovered by the AsyncCrawler.
    """
    payloads = generator.get_all_payloads()
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 LVS/2.0"}
    
    sqli_errors = ["syntax error", "mysql_fetch", "sqlite3.OperationalError", "ORA-", "PostgreSQL query failed"]
    
    # We use a semaphore to prevent overloading the target
    semaphore = asyncio.Semaphore(10)

    async def execute_test(session, form, p_type, payload, target_input):
        async with semaphore:
            test_data = {}
            for inp in form["inputs"]:
                if inp["name"] == target_input["name"]:
                    test_data[inp["name"]] = payload
                else:
                    test_data[inp["name"]] = inp.get("default_value", "test")
            
            status, text, latency = await test_form_payload(session, form["url"], form["method"], test_data, headers)
            return form, p_type, payload, target_input, status, text, latency

    tasks = []
    async with aiohttp.ClientSession() as session:
        for form in forms:
            for inp in form["inputs"]:
                # Smart Payload Mapping based on parameter classification
                tests_to_run = []
                
                if inp["class"] in ["auth", "auth_secret", "search", "reflection"]:
                    tests_to_run.extend([("sqli", p) for p in payloads["sqli"][:10]]) # Limit to 10 per input for speed
                    tests_to_run.extend([("xss", p) for p in payloads["xss"][:5]])
                elif inp["class"] == "ssrf_candidate":
                    tests_to_run.extend([("ssrf", p) for p in payloads["ssrf"]])
                else:
                    # Default spray
                    tests_to_run.extend([("sqli", p) for p in payloads["sqli"][:3]])
                    tests_to_run.extend([("xss", p) for p in payloads["xss"][:2]])
                
                for p_type, payload in tests_to_run:
                    tasks.append(execute_test(session, form, p_type, payload, inp))
        
        # Execute all tests concurrently
        if tasks:
            results = await asyncio.gather(*tasks)
            
            for form, p_type, payload, target_input, status, text, latency in results:
                if status == 0: continue
                
                # 1. SQLi Error-based Detection
                if p_type == "sqli":
                    for sig in sqli_errors:
                        if sig.lower() in text.lower():
                            findings.append({
                                "id": f"LVS-SQLI-{len(findings)+1}",
                                "title": "SQL Injection Detected (Error-Based)",
                                "severity": "Critical",
                                "cwe": "CWE-89",
                                "endpoint": f"{form['method'].upper()} {form['url']}",
                                "payload": f"{target_input['name']}={payload}",
                                "description": f"The payload injected into '{target_input['name']}' triggered a database error ({sig}).",
                                "remediation": "Use parameterized queries or prepared statements."
                            })
                            risk_score -= 30
                            break
                            
                # 2. XSS Reflection Detection
                elif p_type == "xss":
                    if payload in text:
                        findings.append({
                            "id": f"LVS-XSS-{len(findings)+1}",
                            "title": "Reflected XSS",
                            "severity": "High",
                            "cwe": "CWE-79",
                            "endpoint": f"{form['method'].upper()} {form['url']}",
                            "payload": f"{target_input['name']}={payload}",
                            "description": f"The XSS payload in '{target_input['name']}' was reflected unmodified.",
                            "remediation": "Context-encode all user input before rendering."
                        })
                        risk_score -= 25
                        
                # 3. SSRF Detection
                elif p_type == "ssrf":
                    if "root:x:0:0" in text or "EC2_INSTANCE_ID" in text:
                        findings.append({
                            "id": f"LVS-SSRF-{len(findings)+1}",
                            "title": "Server-Side Request Forgery",
                            "severity": "Critical",
                            "cwe": "CWE-918",
                            "endpoint": f"{form['method'].upper()} {form['url']}",
                            "payload": f"{target_input['name']}={payload}",
                            "description": f"The payload in '{target_input['name']}' caused internal resource reflection.",
                            "remediation": "Whitelist URLs and block internal network access from application logic."
                        })
                        risk_score -= 35

    return max(0, risk_score)
