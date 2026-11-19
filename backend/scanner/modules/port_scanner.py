import socket
import asyncio
from urllib.parse import urlparse

async def check_port(host, port):
    conn = asyncio.open_connection(host, port)
    try:
        reader, writer = await asyncio.wait_for(conn, timeout=1.0)
        
        banner = None
        # Attempt basic Banner Grabbing for service detection
        if port in [21, 22, 23, 25, 110, 143]:
            try:
                data = await asyncio.wait_for(reader.read(1024), timeout=1.0)
                if data:
                    banner = data.decode('utf-8', errors='ignore').strip()
            except:
                pass
        elif port in [80, 8080]:
            try:
                request = f"HEAD / HTTP/1.1\r\nHost: {host}\r\n\r\n".encode()
                writer.write(request)
                await writer.drain()
                data = await asyncio.wait_for(reader.read(1024), timeout=1.0)
                if data:
                    banner_lines = data.decode('utf-8', errors='ignore').split('\n')
                    for line in banner_lines:
                        if line.lower().startswith('server:'):
                            banner = line.strip()
                            break
            except:
                pass

        writer.close()
        await writer.wait_closed()
        return True, banner
    except:
        return False, None

async def scan_ports(url, findings, risk_score):
    parsed = urlparse(url)
    host = parsed.hostname
    if not host:
        return risk_score
        
    common_ports = {
        21: "FTP",
        22: "SSH",
        23: "Telnet",
        80: "HTTP",
        443: "HTTPS",
        3306: "MySQL",
        5432: "PostgreSQL",
        8080: "HTTP-Proxy",
        27017: "MongoDB"
    }
    
    tasks = [check_port(host, port) for port in common_ports.keys()]
    results = await asyncio.gather(*tasks)
    
    for port, result in zip(common_ports.keys(), results):
        is_open, banner = result
        if is_open:
            service = common_ports[port]
            desc = f"Port {port} ({service}) is open to the public."
            if banner:
                desc += f" Service banner grabbed: '{banner}'."
                
            findings.append({
                "id": f"LVS-PORT-{port}",
                "title": f"Exposed Service: {service} (Port {port})",
                "severity": "Medium" if port in [22, 80, 443, 8080, 3306, 5432, 27017] else "High",
                "cwe": "CWE-1008",
                "endpoint": f"{host}:{port}",
                "description": desc,
                "remediation": "Restrict access to this port using a firewall or Security Group. Ensure it is bound to localhost/internal networks only if public access is not required."
            })
            risk_score -= 10
            
    return risk_score
