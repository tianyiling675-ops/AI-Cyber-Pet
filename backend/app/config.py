from functools import lru_cache
from pathlib import Path
import os

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


class Settings:
    pet_id: str = os.getenv("PET_ID", "orange_cat_001")
    device_id: str = os.getenv("DEVICE_ID", "collar_demo_001")
    ai_mode: str = os.getenv("AI_MODE", "mock")
    zhipu_api_key: str = os.getenv("ZHIPUAI_API_KEY", "")
    database_path: Path = BASE_DIR / "cyberpet.db"
    upload_dir: Path = BASE_DIR / "uploads"


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    return settings
