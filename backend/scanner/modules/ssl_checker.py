import socket
import ssl
from urllib.parse import urlparse

def analyze_ssl(url, findings, risk_score):
    parsed = urlparse(url)
    if parsed.scheme != "https":
        return risk_score
    
    hostname = parsed.hostname
    port = parsed.port or 443

    try:
        context = ssl.create_default_context()
        with socket.create_connection((hostname, port), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                # Basic check passed if no exception is thrown
    except ssl.SSLCertVerificationError as e:
        findings.append({
            "id": f"SSL-CERT-{len(findings)+1}",
            "title": "SSL Certificate Verification Failed",
            "severity": "High",
            "cwe": "CWE-295",
            "description": f"The SSL certificate could not be verified: {str(e)}. This may indicate a self-signed cert, expired cert, or MITM attack.",
            "remediation": "Ensure the server uses a valid certificate issued by a trusted Certificate Authority (CA)."
        })
        risk_score -= 20
    except Exception as e:
        findings.append({
            "id": f"SSL-ERR-{len(findings)+1}",
            "title": "SSL/TLS Connection Error",
            "severity": "Medium",
            "cwe": "CWE-319",
            "description": f"Failed to establish a secure connection: {str(e)}.",
            "remediation": "Check the server's SSL/TLS configuration."
        })
        risk_score -= 10

    return risk_score
