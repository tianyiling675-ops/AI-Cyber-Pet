from __future__ import annotations

from contextlib import contextmanager
from datetime import date, datetime, timezone
import json
import sqlite3
from typing import Any, Iterator

from .config import get_settings


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(get_settings().database_path)
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def get_conn() -> Iterator[sqlite3.Connection]:
    conn = _connect()
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with get_conn() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS pet_profiles (
              pet_id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              breed TEXT NOT NULL,
              traits TEXT NOT NULL,
              catchphrases TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS device_events (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              pet_id TEXT NOT NULL,
              device_id TEXT NOT NULL,
              state TEXT NOT NULL,
              confidence REAL NOT NULL,
              duration_sec INTEGER NOT NULL,
              battery INTEGER NOT NULL,
              source TEXT NOT NULL,
              timestamp TEXT NOT NULL,
              raw TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS memories (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              pet_id TEXT NOT NULL,
              memory_date TEXT NOT NULL,
              title TEXT NOT NULL,
              type TEXT NOT NULL,
              content TEXT NOT NULL,
              media_path TEXT,
              tags TEXT NOT NULL,
              ai_extracted TEXT NOT NULL,
              created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS chat_messages (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              pet_id TEXT NOT NULL,
              role TEXT NOT NULL,
              content TEXT NOT NULL,
              mode TEXT,
              used_state TEXT,
              used_memory TEXT,
              created_at TEXT NOT NULL
            );
            """
        )
    seed_defaults()


def seed_defaults() -> None:
    now = datetime.now(timezone.utc).isoformat()
    with get_conn() as conn:
        profile = conn.execute(
            "SELECT pet_id FROM pet_profiles WHERE pet_id = ?",
            ("orange_cat_001",),
        ).fetchone()
        if profile is None:
            conn.execute(
                """
                INSERT INTO pet_profiles (pet_id, name, breed, traits, catchphrases)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    "orange_cat_001",
                    "橘橘",
                    "橘猫",
                    json.dumps(["傲娇", "贪吃", "爱睡", "偶尔粘人"], ensure_ascii=False),
                    json.dumps(["本主子", "哼", "看在小鱼干的份上"], ensure_ascii=False),
                ),
            )

        count = conn.execute("SELECT COUNT(*) AS c FROM memories").fetchone()["c"]
        if count == 0:
            rows = [
                (
                    "2023-03-15",
                    "第一次见面",
                    "story",
                    "橘橘第一次来家里时，躲在沙发底下六个小时，只露出一小截尾巴。",
                    ["第一次见面", "胆小", "沙发"],
                    {
                        "scene": "客厅沙发",
                        "emotion": "紧张又好奇",
                        "personality_clue": "刚到新环境会先观察很久",
                        "key_moment": "躲在沙发底下六小时",
                    },
                ),
                (
                    "2024-01-20",
                    "一岁生日",
                    "photo",
                    "一岁生日那天，橘橘为了抢蛋糕把纸盘推翻了，最后只舔到了奶油边。",
                    ["生日", "贪吃", "调皮"],
                    {
                        "scene": "生日桌边",
                        "emotion": "兴奋",
                        "personality_clue": "对食物非常执着",
                        "key_moment": "打翻蛋糕纸盘",
                    },
                ),
                (
                    "2024-06-02",
                    "窗台晒太阳",
                    "photo",
                    "下午阳光正好的时候，橘橘霸占了整个窗台，谁靠近都要被它瞥一眼。",
                    ["窗台", "晒太阳", "傲娇"],
                    {
                        "scene": "窗台",
                        "emotion": "放松",
                        "personality_clue": "喜欢占据阳光最好的地方",
                        "key_moment": "窗台晒太阳",
                    },
                ),
            ]
            for memory_date, title, kind, content, tags, extracted in rows:
                conn.execute(
                    """
                    INSERT INTO memories
                      (pet_id, memory_date, title, type, content, media_path, tags, ai_extracted, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        "orange_cat_001",
                        memory_date,
                        title,
                        kind,
                        content,
                        None,
                        json.dumps(tags, ensure_ascii=False),
                        json.dumps(extracted, ensure_ascii=False),
                        now,
                    ),
                )


def row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    value = dict(row)
    for key in ("raw", "tags", "ai_extracted", "traits", "catchphrases"):
        if key in value and isinstance(value[key], str):
            value[key] = json.loads(value[key])
    return value


def insert_event(event: dict[str, Any]) -> int:
    with get_conn() as conn:
        cursor = conn.execute(
            """
            INSERT INTO device_events
              (pet_id, device_id, state, confidence, duration_sec, battery, source, timestamp, raw)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                event["pet_id"],
                event["device_id"],
                event["state"],
                event["confidence"],
                event["duration_sec"],
                event["battery"],
                event["source"],
                event["timestamp"],
                json.dumps(event.get("raw", {}), ensure_ascii=False),
            ),
        )
        return int(cursor.lastrowid)


def latest_event(pet_id: str = "orange_cat_001") -> dict[str, Any] | None:
    with get_conn() as conn:
        row = conn.execute(
            """
            SELECT * FROM device_events
            WHERE pet_id = ?
            ORDER BY timestamp DESC, id DESC
            LIMIT 1
            """,
            (pet_id,),
        ).fetchone()
    return row_to_dict(row) if row else None


def recent_events(pet_id: str = "orange_cat_001", limit: int = 12) -> list[dict[str, Any]]:
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT * FROM device_events
            WHERE pet_id = ?
            ORDER BY timestamp DESC, id DESC
            LIMIT ?
            """,
            (pet_id, limit),
        ).fetchall()
    return [row_to_dict(row) for row in rows]


def list_memories(pet_id: str = "orange_cat_001") -> list[dict[str, Any]]:
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT * FROM memories
            WHERE pet_id = ?
            ORDER BY memory_date DESC, id DESC
            """,
            (pet_id,),
        ).fetchall()
    return [row_to_dict(row) for row in rows]


def insert_memory(
    pet_id: str,
    title: str,
    content: str,
    kind: str = "story",
    memory_date: str | None = None,
    media_path: str | None = None,
    tags: list[str] | None = None,
    ai_extracted: dict[str, Any] | None = None,
) -> dict[str, Any]:
    today = date.today().isoformat()
    created_at = datetime.now(timezone.utc).isoformat()
    tags = tags or []
    ai_extracted = ai_extracted or {}
    with get_conn() as conn:
        cursor = conn.execute(
            """
            INSERT INTO memories
              (pet_id, memory_date, title, type, content, media_path, tags, ai_extracted, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                pet_id,
                memory_date or today,
                title,
                kind,
                content,
                media_path,
                json.dumps(tags, ensure_ascii=False),
                json.dumps(ai_extracted, ensure_ascii=False),
                created_at,
            ),
        )
        row = conn.execute("SELECT * FROM memories WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return row_to_dict(row)


def get_profile(pet_id: str = "orange_cat_001") -> dict[str, Any]:
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM pet_profiles WHERE pet_id = ?", (pet_id,)).fetchone()
    if row:
        return row_to_dict(row)
    return {
        "pet_id": pet_id,
        "name": "橘橘",
        "breed": "橘猫",
        "traits": ["傲娇", "贪吃", "爱睡", "偶尔粘人"],
        "catchphrases": ["本主子", "哼", "看在小鱼干的份上"],
    }


def insert_chat(
    pet_id: str,
    role: str,
    content: str,
    mode: str | None = None,
    used_state: str | None = None,
    used_memory: str | None = None,
) -> None:
    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO chat_messages
              (pet_id, role, content, mode, used_state, used_memory, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                pet_id,
                role,
                content,
                mode,
                used_state,
                used_memory,
                datetime.now(timezone.utc).isoformat(),
            ),
        )


def chat_history(pet_id: str = "orange_cat_001", limit: int = 12) -> list[dict[str, Any]]:
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT * FROM chat_messages
            WHERE pet_id = ?
            ORDER BY id DESC
            LIMIT ?
            """,
            (pet_id, limit),
        ).fetchall()
    return list(reversed([row_to_dict(row) for row in rows]))
