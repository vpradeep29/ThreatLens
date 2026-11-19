# Lightweight local CVE mapping database for the Intelligence Engine
# Maps common server headers to known High/Critical CVEs.

CVE_DATABASE = {
    "apache/2.4.49": {
        "cve": "CVE-2021-41773",
        "title": "Apache 2.4.49 Path Traversal & RCE",
        "severity": "Critical",
        "description": "A flaw was found in a change made to path normalization in Apache HTTP Server 2.4.49. An attacker could use a path traversal attack to map URLs to files outside the expected document root.",
        "remediation": "Upgrade to Apache 2.4.51 or later."
    },
    "nginx/1.20.0": {
        "cve": "CVE-2021-23017",
        "title": "NGINX 1-Bit Memory Overwrite",
        "severity": "High",
        "description": "A 1-Bit Memory Overwrite vulnerability in NGINX DNS resolver allows an attacker to cause a worker process crash or potentially execute arbitrary code.",
        "remediation": "Upgrade to NGINX 1.20.1 or later."
    },
    "php/8.1.0-dev": {
        "cve": "CVE-2021-3156",
        "title": "PHP 8.1.0-dev Backdoor",
        "severity": "Critical",
        "description": "A malicious backdoor was introduced into the PHP source code which allows unauthenticated Remote Code Execution (RCE) via the User-Agentt header.",
        "remediation": "Upgrade to a stable, official release of PHP."
    }
}

def map_cve_intelligence(server_header, findings, risk_score):
    if not server_header or server_header == "Unknown":
        return risk_score
        
    server_lower = server_header.lower()
    for sig, cve_data in CVE_DATABASE.items():
        if sig in server_lower:
            findings.append({
                "id": f"LVS-CVE-{cve_data['cve']}",
                "title": cve_data["title"],
                "severity": cve_data["severity"],
                "cwe": "CWE-937", # Using components with known vulnerabilities
                "endpoint": "Server Environment",
                "payload": f"Detected Signature: {server_header}",
                "description": cve_data["description"],
                "remediation": cve_data["remediation"]
            })
            
            risk_reduction = 40 if cve_data["severity"] == "Critical" else 20
            risk_score -= risk_reduction
            
    return risk_score
