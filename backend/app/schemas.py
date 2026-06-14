from datetime import datetime, timezone
from typing import Any, Literal

from pydantic import BaseModel, Field


PetState = Literal[
    "sleeping",
    "walking",
    "running",
    "drinking",
    "active",
    "abnormal_active",
    "offline",
]


class DeviceEventIn(BaseModel):
    pet_id: str = "orange_cat_001"
    device_id: str = "collar_demo_001"
    state: PetState
    confidence: float = Field(default=0.9, ge=0, le=1)
    duration_sec: int = Field(default=0, ge=0)
    battery: int = Field(default=100, ge=0, le=100)
    source: str = "simulator"
    timestamp: datetime | None = None
    raw: dict[str, Any] = Field(default_factory=dict)

    def normalized_timestamp(self) -> str:
        value = self.timestamp or datetime.now(timezone.utc)
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.isoformat()


class ChatIn(BaseModel):
    pet_id: str = "orange_cat_001"
    user_message: str
    mode: Literal["zhipu", "mock", "cached"] | None = None


class MemoryIn(BaseModel):
    pet_id: str = "orange_cat_001"
    title: str
    content: str
    memory_date: str | None = None
    tags: list[str] = Field(default_factory=list)


class AiModeIn(BaseModel):
    mode: Literal["zhipu", "mock", "cached"]
