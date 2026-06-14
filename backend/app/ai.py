from __future__ import annotations

from typing import Any

import httpx

from .config import get_settings
from .db import chat_history, get_profile, list_memories, recent_events
from .states import STATE_META


CACHED_REPLIES: list[tuple[list[str], str]] = [
    (
        ["现在", "干嘛", "在做什么"],
        "哼，本主子正在{state_label}。你终于想起来看看我了？看在你态度还算及时的份上，准你多问一句。",
    ),
    (
        ["第一次", "见面", "沙发"],
        "当然记得。那天本主子躲在沙发底下六个小时，你就在外面傻乎乎地等。别以为我没看见。",
    ),
    (
        ["生日", "蛋糕"],
        "一岁生日那次？本主子只是轻轻碰了一下盘子，蛋糕自己就翻了。你们人类总爱夸张。",
    ),
    (
        ["照片", "刚才", "上传"],
        "刚才那张我看到了。光线还行，角度一般，但勉强拍出了本主子的气质。",
    ),
]


def _pick_memory(user_message: str, memories: list[dict[str, Any]]) -> dict[str, Any] | None:
    for memory in memories:
        words = [memory["title"], memory["content"], *memory.get("tags", [])]
        if any(word and word in user_message for word in words):
            return memory
    if any(keyword in user_message for keyword in ("记得", "回忆", "照片", "生日", "第一次")):
        return memories[0] if memories else None
    return None


def _cached_reply(user_message: str, state_label: str) -> str | None:
    for keywords, template in CACHED_REPLIES:
        if any(keyword in user_message for keyword in keywords):
            return template.format(state_label=state_label)
    return None


def mock_chat(user_message: str, current_state: dict[str, Any], memories: list[dict[str, Any]]) -> tuple[str, str | None]:
    state = current_state.get("state", "offline")
    state_label = current_state.get("label") or STATE_META.get(state, STATE_META["offline"])["label"]
    hint = current_state.get("message_hint") or STATE_META.get(state, STATE_META["offline"])["message_hint"]
    memory = _pick_memory(user_message, memories)
    cached = _cached_reply(user_message, state_label)
    if cached:
        return cached, memory["title"] if memory else None
    if memory:
        extracted = memory.get("ai_extracted", {})
        key_moment = extracted.get("key_moment") or memory["content"]
        return (
            f"哼，本主子当然记得「{memory['title']}」。{key_moment}这种事，你以为只有你记得吗？",
            memory["title"],
        )
    return f"{hint}。你问「{user_message}」是想关心我，还是想打扰本主子休息？", None


def build_prompt(user_message: str, current_state: dict[str, Any]) -> str:
    profile = get_profile(current_state.get("pet_id", "orange_cat_001"))
    memories = list_memories(profile["pet_id"])[:5]
    events = recent_events(profile["pet_id"], limit=5)
    memory_lines = "\n".join(
        f"- {memory['title']}：{memory['content']}；标签：{', '.join(memory.get('tags', []))}"
        for memory in memories
    )
    event_lines = "\n".join(
        f"- {event['timestamp']} {event['state']} confidence={event['confidence']}"
        for event in events
    )
    history_lines = "\n".join(
        f"{item['role']}: {item['content']}" for item in chat_history(profile["pet_id"], limit=8)
    )
    return f"""你是{profile['name']}，一只{profile['breed']}。
你始终以猫咪第一人称说话，性格是{', '.join(profile['traits'])}。
你不会讨好人类，不会说自己是 AI，不会解释系统设置。
回复要短，尽量 80 字以内，语气傲娇、自然，可以轻微吐槽。

当前实时状态：
- state: {current_state.get('state')}
- 中文状态: {current_state.get('label')}
- 情绪: {current_state.get('mood')}
- 状态提示: {current_state.get('message_hint')}

最近行为：
{event_lines or '- 暂无'}

可引用回忆：
{memory_lines or '- 暂无'}

最近对话：
{history_lines or '- 暂无'}

用户说：{user_message}

请以{profile['name']}的第一人称直接回复。"""


async def zhipu_chat(user_message: str, current_state: dict[str, Any]) -> str:
    settings = get_settings()
    if not settings.zhipu_api_key:
        raise RuntimeError("ZHIPUAI_API_KEY is not configured")
    prompt = build_prompt(user_message, current_state)
    payload = {
        "model": "glm-4-flash",
        "messages": [
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.7,
    }
    headers = {"Authorization": f"Bearer {settings.zhipu_api_key}"}
    async with httpx.AsyncClient(timeout=12) as client:
        response = await client.post(
            "https://open.bigmodel.cn/api/paas/v4/chat/completions",
            json=payload,
            headers=headers,
        )
        response.raise_for_status()
        data = response.json()
    return data["choices"][0]["message"]["content"].strip()


async def chat(
    user_message: str,
    current_state: dict[str, Any],
    requested_mode: str | None,
) -> dict[str, Any]:
    settings = get_settings()
    mode = requested_mode or settings.ai_mode
    memories = list_memories(current_state.get("pet_id", settings.pet_id))
    used_memory: str | None = None
    if mode == "cached":
        reply, used_memory = mock_chat(user_message, current_state, memories)
        return {
            "reply": reply,
            "used_state": current_state.get("state"),
            "used_memory": used_memory,
            "mode": "cached",
        }
    if mode == "zhipu":
        try:
            reply = await zhipu_chat(user_message, current_state)
            memory = _pick_memory(user_message, memories)
            return {
                "reply": reply,
                "used_state": current_state.get("state"),
                "used_memory": memory["title"] if memory else None,
                "mode": "zhipu",
            }
        except Exception:
            reply, used_memory = mock_chat(user_message, current_state, memories)
            return {
                "reply": reply,
                "used_state": current_state.get("state"),
                "used_memory": used_memory,
                "mode": "mock",
            }
    reply, used_memory = mock_chat(user_message, current_state, memories)
    return {
        "reply": reply,
        "used_state": current_state.get("state"),
        "used_memory": used_memory,
        "mode": "mock",
    }
