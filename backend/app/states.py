from typing import Any


STATE_META: dict[str, dict[str, str]] = {
    "sleeping": {
        "label": "睡觉中",
        "mood": "sleepy",
        "message_hint": "刚睡着没多久，尾巴还卷着",
    },
    "walking": {
        "label": "散步中",
        "mood": "curious",
        "message_hint": "正在慢慢巡视地盘",
    },
    "running": {
        "label": "跑酷中",
        "mood": "excited",
        "message_hint": "刚跑了好几圈，现在尾巴都精神了",
    },
    "drinking": {
        "label": "喝水中",
        "mood": "satisfied",
        "message_hint": "刚喝完水，嘴巴还是湿的",
    },
    "active": {
        "label": "活动中",
        "mood": "playful",
        "message_hint": "正在忙着处理本主子的猫生大事",
    },
    "abnormal_active": {
        "label": "异常活跃",
        "mood": "alert",
        "message_hint": "今天动静有点大，可能又发现新玩具了",
    },
    "offline": {
        "label": "脖环离线",
        "mood": "unknown",
        "message_hint": "脖环暂时没信号，但本主子的存在感不会掉线",
    },
}


def enrich_state(event: dict[str, Any]) -> dict[str, Any]:
    meta = STATE_META.get(event.get("state", "offline"), STATE_META["offline"])
    return {
        **event,
        "label": meta["label"],
        "mood": meta["mood"],
        "message_hint": meta["message_hint"],
    }


def state_options() -> list[dict[str, str]]:
    return [{"state": key, **value} for key, value in STATE_META.items()]
