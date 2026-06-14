# CyberPet API Contract

本文档是硬件、后端、前端、AI 的统一协议。无论数据来自模拟器、BLE bridge、导演控制台，都必须转换成同一个事件结构。

## 状态枚举

```text
sleeping          睡觉中
walking           散步中
running           跑酷中
drinking          喝水中
active            活动中
abnormal_active   异常活跃
offline           脖环离线
```

## 设备事件

`POST /api/device/events`

```json
{
  "pet_id": "orange_cat_001",
  "device_id": "collar_demo_001",
  "state": "running",
  "confidence": 0.87,
  "duration_sec": 12,
  "battery": 76,
  "source": "simulator",
  "timestamp": "2026-06-13T20:30:00Z",
  "raw": {
    "accel_mean": 1.8,
    "gyro_mean": 0.6
  }
}
```

字段要求：

```text
pet_id        默认 orange_cat_001
device_id     默认 collar_demo_001
state         必须是状态枚举之一
confidence    0-1，模拟器可固定 0.9
duration_sec  当前状态持续时间
battery       0-100
source        simulator / demo_console / ble_bridge
timestamp     ISO 8601；缺省时后端自动补当前时间
raw           可选，传感器特征或调试数据
```

响应：

```json
{
  "ok": true,
  "event_id": 18,
  "current_state": {
    "state": "running",
    "label": "跑酷中",
    "mood": "excited",
    "message_hint": "刚跑了好几圈，现在尾巴都精神了"
  }
}
```

## WebSocket 广播

`WS /ws/state`

状态更新：

```json
{
  "type": "state_update",
  "payload": {
    "pet_id": "orange_cat_001",
    "device_id": "collar_demo_001",
    "state": "drinking",
    "label": "喝水中",
    "mood": "satisfied",
    "message_hint": "刚喝完水，嘴巴还是湿的",
    "confidence": 0.92,
    "duration_sec": 8,
    "battery": 76,
    "source": "ble_bridge",
    "timestamp": "2026-06-13T20:30:00Z"
  }
}
```

## AI 对话

`POST /api/chat`

请求：

```json
{
  "pet_id": "orange_cat_001",
  "user_message": "你现在在干嘛？",
  "mode": "zhipu"
}
```

`mode` 可选：

```text
zhipu
mock
cached
```

响应：

```json
{
  "reply": "哼，本主子刚喝完水，嘴巴还是湿的。你这时候找我，是不是又想我了？",
  "used_state": "drinking",
  "used_memory": null,
  "mode": "zhipu"
}
```

## 回忆上传与演示型多模态分析

`POST /api/uploads/analyze`

表单字段：

```text
pet_id        orange_cat_001
title         回忆标题
story         可选文字描述
memory_date   YYYY-MM-DD，可选
file          可选图片/视频
```

响应：

```json
{
  "memory": {
    "id": 4,
    "date": "2026-06-13",
    "title": "窗台晒太阳",
    "type": "photo",
    "content": "橘橘趴在窗台上晒太阳。",
    "tags": ["窗台", "放松", "傲娇"],
    "ai_extracted": {
      "scene": "窗台",
      "emotion": "放松",
      "personality_clue": "喜欢占据阳光最好的地方",
      "key_moment": "晒太阳时被拍下"
    }
  }
}
```

MVP 中多模态分析采用 mock 结果，保证演示链路稳定。

## Eval 展示报告

`GET /api/eval/report`

```json
{
  "dialogue_quality": 4.4,
  "persona_consistency": 4.8,
  "state_reference": 4.5,
  "memory_reference": 4.1,
  "behavior_accuracy": 0.86,
  "sync_latency_sec": 0.4
}
```
