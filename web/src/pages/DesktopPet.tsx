import { useEffect, useState } from "react";
import { ChatPanel } from "../components/ChatPanel";
import { SpritePet } from "../components/SpritePet";
import { usePetState } from "../usePetState";

export function DesktopPet() {
  const { state, connected } = usePetState();
  const [open, setOpen] = useState(false);
  const [waving, setWaving] = useState(false);

  function interact() {
    setWaving(true);
    setOpen((value) => !value);
  }

  useEffect(() => {
    if (!waving) return;
    const timer = window.setTimeout(() => setWaving(false), 850);
    return () => window.clearTimeout(timer);
  }, [waving]);

  return (
    <main className="desktop-surface sprite-desktop">
      <button className="desktop-pet-button sprite-pet-button" onClick={interact} aria-label="和橘橘互动">
        <SpritePet state={state} connected={connected} waving={waving} />
      </button>
      <div className="desktop-status-bubble">
        <strong>{connected ? state?.label || "同步中" : "重连中"}</strong>
        <span>{connected ? state?.message_hint || "本主子在线" : "等待脖环信号"}</span>
      </div>
      <div className={`desktop-chat sprite-chat ${open ? "open" : ""}`}>
        <div className="desktop-chat-head">
          <strong>橘橘</strong>
          <span>{connected ? state?.label : "重连中"}</span>
        </div>
        <ChatPanel compact />
      </div>
    </main>
  );
}
