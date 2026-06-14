from __future__ import annotations

from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any
import shutil

from fastapi import FastAPI, File, Form, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .ai import chat as run_chat
from .config import get_settings
from .db import (
    init_db,
    insert_chat,
    insert_event,
    insert_memory,
    latest_event,
    list_memories,
    recent_events,
)
from .schemas import AiModeIn, ChatIn, DeviceEventIn, MemoryIn
from .states import enrich_state, state_options
from .ws import manager


app = FastAPI(title="CyberPet Demo API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    settings = get_settings()
    app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")
    if latest_event(settings.pet_id) is None:
        event = {
            "pet_id": settings.pet_id,
            "device_id": settings.device_id,
            "state": "sleeping",
            "confidence": 0.96,
            "duration_sec": 180,
            "battery": 88,
            "source": "startup_seed",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "raw": {"seed": True},
        }
        insert_event(event)


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {"ok": True, "time": datetime.now(timezone.utc).isoformat()}


@app.get("/api/states")
def states() -> dict[str, Any]:
    return {"states": state_options()}


@app.post("/api/device/events")
async def device_event(payload: DeviceEventIn) -> dict[str, Any]:
    event = payload.model_dump()
    event["timestamp"] = payload.normalized_timestamp()
    event_id = insert_event(event)
    current_state = enrich_state(event)
    await manager.broadcast({"type": "state_update", "payload": current_state})
    return {"ok": True, "event_id": event_id, "current_state": current_state}


@app.get("/api/pet/state")
def pet_state(pet_id: str = "orange_cat_001") -> dict[str, Any]:
    event = latest_event(pet_id)
    if event is None:
        event = {
            "pet_id": pet_id,
            "device_id": "collar_demo_001",
            "state": "offline",
            "confidence": 0,
            "duration_sec": 0,
            "battery": 0,
            "source": "none",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "raw": {},
        }
    return {"state": enrich_state(event)}


@app.get("/api/pet/events")
def pet_events(pet_id: str = "orange_cat_001", limit: int = 20) -> dict[str, Any]:
    return {"events": [enrich_state(event) for event in recent_events(pet_id, limit)]}


@app.websocket("/ws/state")
async def state_ws(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    try:
        event = latest_event()
        if event:
            await websocket.send_json({"type": "state_update", "payload": enrich_state(event)})
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.post("/api/chat")
async def chat(payload: ChatIn) -> dict[str, Any]:
    state = latest_event(payload.pet_id)
    if state is None:
        state = {
            "pet_id": payload.pet_id,
            "device_id": "collar_demo_001",
            "state": "offline",
            "confidence": 0,
            "duration_sec": 0,
            "battery": 0,
            "source": "none",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "raw": {},
        }
    current_state = enrich_state(state)
    insert_chat(payload.pet_id, "user", payload.user_message)
    result = await run_chat(payload.user_message, current_state, payload.mode)
    insert_chat(
        payload.pet_id,
        "assistant",
        result["reply"],
        result["mode"],
        result["used_state"],
        result["used_memory"],
    )
    return result


@app.get("/api/memories")
def memories(pet_id: str = "orange_cat_001") -> dict[str, Any]:
    return {"memories": list_memories(pet_id)}


@app.post("/api/memories")
def create_memory(payload: MemoryIn) -> dict[str, Any]:
    memory = insert_memory(
        payload.pet_id,
        payload.title,
        payload.content,
        kind="story",
        memory_date=payload.memory_date,
        tags=payload.tags or ["新回忆", "手动记录"],
        ai_extracted={
            "scene": "用户补充",
            "emotion": "怀念",
            "personality_clue": "这段经历会被纳入专属档案",
            "key_moment": payload.title,
        },
    )
    return {"memory": memory}


def mock_multimodal(title: str, story: str | None, filename: str | None) -> dict[str, Any]:
    text = f"{title} {story or ''} {filename or ''}"
    if "生日" in text or "cake" in text.lower():
        return {
            "tags": ["生日", "贪吃", "调皮"],
            "ai_extracted": {
                "scene": "生日桌边",
                "emotion": "兴奋",
                "personality_clue": "看到食物会立刻靠近",
                "key_moment": "盯上了桌边的蛋糕",
            },
        }
    if "窗" in text or "sun" in text.lower():
        return {
            "tags": ["窗台", "晒太阳", "傲娇"],
            "ai_extracted": {
                "scene": "窗台",
                "emotion": "放松",
                "personality_clue": "喜欢占据阳光最好的地方",
                "key_moment": "安静晒太阳时被记录下来",
            },
        }
    if "水" in text:
        return {
            "tags": ["喝水", "健康", "实时状态"],
            "ai_extracted": {
                "scene": "饮水区",
                "emotion": "满足",
                "personality_clue": "喝完水后会短暂停下来观察四周",
                "key_moment": "刚喝完水的状态被记录",
            },
        }
    return {
        "tags": ["日常", "陪伴", "专属回忆"],
        "ai_extracted": {
            "scene": "家庭日常",
            "emotion": "安心",
            "personality_clue": "熟悉环境里会露出放松的一面",
            "key_moment": title,
        },
    }


@app.post("/api/uploads/analyze")
async def analyze_upload(
    pet_id: str = Form("orange_cat_001"),
    title: str = Form(...),
    story: str = Form(""),
    memory_date: str = Form(""),
    file: UploadFile | None = File(None),
) -> dict[str, Any]:
    settings = get_settings()
    media_path: str | None = None
    kind = "story"
    filename: str | None = None
    if file and file.filename:
        suffix = Path(file.filename).suffix.lower()
        kind = "video" if suffix in {".mp4", ".mov", ".webm"} else "photo"
        filename = f"{int(datetime.now().timestamp())}_{file.filename}"
        target = settings.upload_dir / filename
        with target.open("wb") as out:
            shutil.copyfileobj(file.file, out)
        media_path = f"/uploads/{filename}"
    analysis = mock_multimodal(title, story, filename)
    memory = insert_memory(
        pet_id,
        title,
        story or f"{title} 的素材已完成 AI 归档。",
        kind=kind,
        memory_date=memory_date or date.today().isoformat(),
        media_path=media_path,
        tags=analysis["tags"],
        ai_extracted=analysis["ai_extracted"],
    )
    return {"memory": memory}


@app.get("/api/eval/report")
def eval_report() -> dict[str, Any]:
    events = recent_events(limit=100)
    memories_count = len(list_memories())
    sync_latency = 0.4 if events else 0.0
    return {
        "dialogue_quality": 4.4,
        "persona_consistency": 4.8,
        "state_reference": 4.5,
        "memory_reference": 4.1 if memories_count else 3.2,
        "behavior_accuracy": 0.86,
        "sync_latency_sec": sync_latency,
        "sample_count": max(12, len(events)),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/api/demo/ai-mode")
def set_ai_mode(payload: AiModeIn) -> dict[str, Any]:
    settings = get_settings()
    settings.ai_mode = payload.mode
    return {"mode": settings.ai_mode}
