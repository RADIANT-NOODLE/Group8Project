import os
from functools import lru_cache

from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic import AliasChoices, Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


# AWS sets this on every Lambda function; it is never set on a laptop.
RUNNING_ON_LAMBDA = bool(os.environ.get("AWS_LAMBDA_FUNCTION_NAME"))


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DATABASE_URL: str
    # .env.example historically used JWT_SECRET, so accept both names.
    SECRET_KEY: str = Field(validation_alias=AliasChoices("SECRET_KEY", "JWT_SECRET"))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # --- Password reset -------------------------------------------------
    # Base URL of the web app; the reset link in the e-mail points here.
    FRONTEND_URL: str = "http://localhost:4173"
    PASSWORD_RESET_EXPIRE_MINUTES: int = 30
    # Local-development convenience ONLY: return the reset link in the API
    # response (and log it) when no SMTP server is configured. Never enable
    # this in production - it would let anyone reset any account.
    EXPOSE_RESET_LINK: bool = False
    # TLS to the database: off for a local PostgreSQL, on for hosted databases.
    DATABASE_SSL: bool = False

    # Optional SMTP settings. When SMTP_HOST is empty no e-mail is sent and the
    # reset link is written to the server log instead.
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "no-reply@valora.local"
    SMTP_USE_TLS: bool = True

    @model_validator(mode="after")
    def _clean_database_url(self) -> "Settings":
        """Accept a connection string pasted straight from Neon.

        Neon gives ``...?sslmode=require&channel_binding=require``; asyncpg does not
        understand those query options, so they are removed and TLS is switched on
        instead (also switched on for any ``neon.tech`` host).
        """
        parts = urlsplit(self.DATABASE_URL)
        query = parse_qsl(parts.query, keep_blank_values=True)
        keep = [(k, v) for k, v in query if k not in ("sslmode", "channel_binding", "ssl")]

        if len(keep) != len(query) or (parts.hostname or "").endswith("neon.tech"):
            self.DATABASE_SSL = True

        self.DATABASE_URL = urlunsplit(parts._replace(query=urlencode(keep)))
        return self

    @model_validator(mode="after")
    def _refuse_unsafe_production(self) -> "Settings":
        """Stop at start-up rather than run a public site with development settings."""
        if self.is_production:
            if self.EXPOSE_RESET_LINK:
                raise ValueError("EXPOSE_RESET_LINK must be false in production: it lets anyone reset any account.")
            if len(self.SECRET_KEY) < 32 or "change" in self.SECRET_KEY.lower():
                raise ValueError("SECRET_KEY must be a long random value in production.")
        return self

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.strip().lower() == "production"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
