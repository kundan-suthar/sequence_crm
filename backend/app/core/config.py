from pydantic_settings import BaseSettings,SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    OPENAI_API_KEY: str = ""
    REDIS_URL: str = ""
    FRONTEND_URL: str = ""

    model_config = SettingsConfigDict(
        env_file=".env"
    )
    @property
    def cors_origins(self) -> List[str]:
        return [url.strip() for url in self.FRONTEND_URL.split(",") if url.strip()]


settings = Settings()