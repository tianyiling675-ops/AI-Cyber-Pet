import { useEffect, useState } from "react";
import { getEvents } from "../api";
import { ChatPanel } from "../components/ChatPanel";
import { EventTimeline } from "../components/EventTimeline";
import { PetAvatar } from "../components/PetAvatar";
import { formatTime, statusVisual } from "../status";
import { usePetState } from "../usePetState";
import type { StatePayload } from "../types";

export function MobileApp() {
  const { state, connected } = usePetState();
  const [events, setEvents] = useState<StatePayload[]>([]);
  const visual = statusVisual[state?.state || "offline"];

  useEffect(() => {
    getEvents().then((data) => setEvents(data.events)).catch(() => undefined);
  }, [state?.timestamp]);

  return (
    <main className="phone-shell">
      <header className="phone-top">
        <div>
          <p>CyberPet</p>
          <h1>橘橘</h1>
        </div>
        <span className={`connection ${connected ? "online" : ""}`}>
          {connected ? "实时同步" : "重连中"}
        </span>
      </header>

      <section className="status-card" style={{ borderColor: visual.accent }}>
        <PetAvatar state={state} />
        <div className="status-copy">
          <span>{state?.label || "等待状态"}</span>
          <h2>{state?.message_hint || "正在连接脖环数据"}</h2>
          <div className="metric-row">
            <small>电量 {state?.battery ?? "--"}%</small>
            <small>持续 {state?.duration_sec ?? "--"}s</small>
            <small>{formatTime(state?.timestamp)}</small>
          </div>
        </div>
      </section>

      <EventTimeline events={events} />
      <ChatPanel />
      <nav className="mobile-tabs">
        <a href="/mobile">状态</a>
        <a href="/memories">回忆</a>
        <a href="/eval">评测</a>
      </nav>
    </main>
  );
}
