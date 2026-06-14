import type { Memory, PetState, StatePayload } from "./types";

export const API_BASE =
  import.meta.env.VITE_API_BASE || `${window.location.protocol}//${window.location.hostname}:8000`;

export const WS_BASE =
  import.meta.env.VITE_WS_BASE ||
  `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.hostname}:8000`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: init?.body instanceof FormData ? undefined : { "Content-Type": "application/json" },
    ...init,
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
}

export function getState() {
  return request<{ state: StatePayload }>("/api/pet/state");
}

export function getEvents() {
  return request<{ events: StatePayload[] }>("/api/pet/events?limit=20");
}

export function sendState(state: PetState, source = "demo_console") {
  return request<{ current_state: StatePayload }>("/api/device/events", {
    method: "POST",
    body: JSON.stringify({
      pet_id: "orange_cat_001",
      device_id: "collar_demo_001",
      state,
      confidence: state === "offline" ? 0 : 0.92,
      duration_sec: Math.floor(Math.random() * 120) + 5,
      battery: Math.floor(Math.random() * 20) + 76,
      source,
      timestamp: new Date().toISOString(),
      raw: {
        accel_mean: Number((Math.random() * 2).toFixed(2)),
        gyro_mean: Number((Math.random() * 1.2).toFixed(2)),
      },
    }),
  });
}

export function chat(user_message: string, mode?: "zhipu" | "mock" | "cached") {
  return request<{ reply: string; used_state: string; used_memory: string | null; mode: string }>(
    "/api/chat",
    {
      method: "POST",
      body: JSON.stringify({
        pet_id: "orange_cat_001",
        user_message,
        mode,
      }),
    },
  );
}

export function getMemories() {
  return request<{ memories: Memory[] }>("/api/memories");
}

export function createMemory(payload: { title: string; content: string; memory_date?: string }) {
  return request<{ memory: Memory }>("/api/memories", {
    method: "POST",
    body: JSON.stringify({
      pet_id: "orange_cat_001",
      ...payload,
    }),
  });
}

export function analyzeUpload(form: FormData) {
  return request<{ memory: Memory }>("/api/uploads/analyze", {
    method: "POST",
    body: form,
  });
}

export function setAiMode(mode: "zhipu" | "mock" | "cached") {
  return request<{ mode: string }>("/api/demo/ai-mode", {
    method: "POST",
    body: JSON.stringify({ mode }),
  });
}

export function getEvalReport() {
  return request<Record<string, number | string>>("/api/eval/report");
}
