import asyncio
import aiohttp
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

class AsyncCrawler:
    """
    Intelligent Async Crawler (Phase 1)
    Performs a Breadth-First Search (BFS) crawl to a specified depth.
    Extracts URLs, forms, and classifies parameters.
    """
    def __init__(self, start_url, max_depth=1, max_concurrency=10):
        self.start_url = start_url
        self.max_depth = max_depth
        self.semaphore = asyncio.Semaphore(max_concurrency)
        
        self.visited = set()
        self.discovered_endpoints = set()
        self.discovered_forms = []
        
        parsed = urlparse(start_url)
        self.domain = parsed.netloc
        
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 LVS/2.0"
        }

    async def fetch(self, session, url):
        async with self.semaphore:
            try:
                async with session.get(url, headers=self.headers, timeout=5, ssl=False) as response:
                    if response.status == 200:
                        content = await response.text()
                        return url, content
            except Exception:
                pass
        return url, None

    def parse_forms(self, html, base_url):
        soup = BeautifulSoup(html, 'html.parser')
        forms = soup.find_all('form')
        for form in forms:
            action = form.get('action', '')
            method = form.get('method', 'get').lower()
            target_url = urljoin(base_url, action)
            
            inputs = []
            for input_tag in form.find_all(['input', 'textarea', 'select']):
                name = input_tag.get('name')
                if not name:
                    continue
                    
                input_type = input_tag.get('type', 'text').lower()
                
                # Smart Parameter Intelligence
                param_class = "reflection"
                name_lower = name.lower()
                if "user" in name_lower or "log" in name_lower or "mail" in name_lower:
                    param_class = "auth"
                elif "pass" in name_lower or "pwd" in name_lower:
                    param_class = "auth_secret"
                elif "search" in name_lower or "q" == name_lower:
                    param_class = "search"
                elif "url" in name_lower or "link" in name_lower or "redirect" in name_lower:
                    param_class = "ssrf_candidate"
                elif input_type == "file":
                    param_class = "upload"
                
                inputs.append({
                    "name": name,
                    "type": input_type,
                    "class": param_class,
                    "default_value": input_tag.get('value', '')
                })
                
            if inputs:
                self.discovered_forms.append({
                    "url": target_url,
                    "method": method,
                    "inputs": inputs
                })

    def parse_links(self, html, base_url):
        soup = BeautifulSoup(html, 'html.parser')
        links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            full_url = urljoin(base_url, href)
            parsed_full = urlparse(full_url)
            
            # Normalize and keep in scope
            if parsed_full.netloc == self.domain:
                clean_url = full_url.split('#')[0]
                if clean_url not in self.visited:
                    links.append(clean_url)
                    self.discovered_endpoints.add(clean_url)
        return links

    async def crawl(self):
        queue = [(self.start_url, 0)]
        
        async with aiohttp.ClientSession() as session:
            while queue:
                current_batch = []
                # Process queue level by level (BFS)
                while queue and queue[0][1] <= self.max_depth:
                    url, depth = queue.pop(0)
                    if url not in self.visited:
                        self.visited.add(url)
                        current_batch.append((url, depth))
                
                if not current_batch:
                    break
                    
                tasks = [self.fetch(session, u) for u, d in current_batch]
                results = await asyncio.gather(*tasks)
                
                for i, (url, html) in enumerate(results):
                    if not html:
                        continue
                        
                    depth = current_batch[i][1]
                    self.parse_forms(html, url)
                    
                    if depth < self.max_depth:
                        new_links = self.parse_links(html, url)
                        for link in new_links:
                            queue.append((link, depth + 1))
                            
        return {
            "endpoints": list(self.discovered_endpoints),
            "forms": self.discovered_forms
        }
