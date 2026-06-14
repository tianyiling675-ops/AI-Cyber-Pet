import { useState } from "react";
import { sendState, setAiMode } from "../api";
import { PetAvatar } from "../components/PetAvatar";
import { usePetState } from "../usePetState";
import type { PetState } from "../types";

const controls: { state: PetState; label: string }[] = [
  { state: "sleeping", label: "睡觉" },
  { state: "walking", label: "散步" },
  { state: "running", label: "跑步" },
  { state: "drinking", label: "喝水" },
  { state: "active", label: "活动" },
  { state: "abnormal_active", label: "异常活跃" },
  { state: "offline", label: "离线" },
];

export function DemoConsole() {
  const { state, connected } = usePetState();
  const [busy, setBusy] = useState<string | null>(null);
  const [mode, setMode] = useState<"zhipu" | "mock" | "cached">("mock");

  async function trigger(next: PetState) {
    setBusy(next);
    await sendState(next);
    setBusy(null);
  }

  async function changeMode(next: typeof mode) {
    setMode(next);
    await setAiMode(next);
  }

  return (
    <main className="page-shell demo-grid">
      <section className="demo-stage">
        <header className="page-head">
          <div>
            <p>导演控制台</p>
            <h1>演示状态编排</h1>
          </div>
          <span className={`connection ${connected ? "online" : ""}`}>
            {connected ? "WebSocket 已连接" : "等待连接"}
          </span>
        </header>
        <PetAvatar state={state} />
        <div className="live-json">
          <strong>{state?.label || "无状态"}</strong>
          <span>{state?.message_hint}</span>
          <code>{JSON.stringify(state, null, 2)}</code>
        </div>
      </section>

      <section className="control-panel">
        <h2>状态切换</h2>
        <div className="control-grid">
          {controls.map((item) => (
            <button key={item.state} onClick={() => trigger(item.state)} disabled={busy === item.state}>
              {busy === item.state ? "发送中" : item.label}
            </button>
          ))}
        </div>
        <h2>AI 模式</h2>
        <div className="segmented">
          {(["mock", "cached", "zhipu"] as const).map((item) => (
            <button className={mode === item ? "active" : ""} key={item} onClick={() => changeMode(item)}>
              {item}
            </button>
          ))}
        </div>
        <h2>演示入口</h2>
        <div className="link-stack">
          <a href="/mobile">手机 H5</a>
          <a href="/desktop">桌宠视图</a>
          <a href="/memories">回忆时间线</a>
          <a href="/eval">评测报告</a>
        </div>
      </section>
    </main>
  );
}
