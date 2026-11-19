import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # API Configuration
    api_title: str = "LVS-Advanced-Scanner v2.0 API"
    api_version: str = "2.0.0"
    api_description: str = "Advanced vulnerability scanner with WebSocket support"
    
    # Server Configuration
    api_port: int = int(os.getenv("API_PORT", 8000))
    api_host: str = os.getenv("API_HOST", "0.0.0.0")
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Database Configuration
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./scan_history.db")
    
    # CORS Configuration
    allowed_origins: str = "http://localhost:3000,http://localhost:5173,http://localhost:8000,http://127.0.0.1:3000,http://127.0.0.1:5173,http://127.0.0.1:8000"
    
    @property
    def cors_origins(self) -> List[str]:
        """Get CORS origins from environment or use defaults"""
        if self.allowed_origins:
            return [origin.strip() for origin in self.allowed_origins.split(",")]
        return []
    
    # Scanning Configuration
    max_timeout: int = 300
    max_concurrent_scans: int = 5
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"

# Create settings instance
settings = Settings()
