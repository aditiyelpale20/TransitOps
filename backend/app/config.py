import os
from typing import List
from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "TransitOps-API"
    DEBUG: bool = True

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=480)

    DATABASE_URL: str | None = None
    DB_USER: str | None = None
    DB_PASSWORD: str | None = None
    DB_HOST: str | None = None
    DB_PORT: str | None = None
    DB_NAME: str | None = None
    DATABASE_FALLBACK_SQLITE: bool = Field(default=True)

    ALLOWED_ORIGINS: str = Field(default="http://localhost:5173,http://localhost:3000")
    SEED_ON_STARTUP: bool = Field(default=True)

    @property
    def SECRET_KEY(self) -> str:
        return self.JWT_SECRET_KEY

    @property
    def ALGORITHM(self) -> str:
        return self.JWT_ALGORITHM

    @property
    def ALLOWED_ORIGINS_LIST(self) -> List[str]:
        return [item.strip() for item in self.ALLOWED_ORIGINS.split(",") if item.strip()]

    @model_validator(mode="after")
    def validate_environment(self):
        if not self.JWT_SECRET_KEY or not self.JWT_SECRET_KEY.strip():
            raise ValueError("JWT_SECRET_KEY is required. Set it in backend/.env or your environment.")

        if self.DATABASE_URL:
            return self

        if not self.DB_HOST or not self.DB_NAME:
            raise ValueError(
                "Database configuration is incomplete. Set DATABASE_URL or DB_HOST/DB_NAME in backend/.env."
            )

        if not self.DB_USER or not self.DB_PASSWORD:
            raise ValueError("DB_USER and DB_PASSWORD are required when DATABASE_URL is not provided.")

        return self

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
