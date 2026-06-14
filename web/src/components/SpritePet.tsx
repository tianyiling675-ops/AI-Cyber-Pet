import { useEffect, useMemo, useState } from "react";
import type { PetState, StatePayload } from "../types";

type SpriteAction =
  | "idle"
  | "runningRight"
  | "runningLeft"
  | "waving"
  | "jumping"
  | "failed"
  | "waiting"
  | "review";

type ActionConfig = {
  row: number;
  frames: number;
  fps: number;
  loop: boolean;
};

const FRAME_SIZE = 96;
const SHEET_URL = "/assets/cat-spritesheet.png";

const ACTIONS: Record<SpriteAction, ActionConfig> = {
  idle: { row: 0, frames: 6, fps: 4, loop: true },
  runningRight: { row: 1, frames: 8, fps: 10, loop: true },
  runningLeft: { row: 2, frames: 8, fps: 10, loop: true },
  waving: { row: 3, frames: 4, fps: 7, loop: false },
  jumping: { row: 4, frames: 5, fps: 8, loop: true },
  failed: { row: 5, frames: 8, fps: 6, loop: true },
  waiting: { row: 6, frames: 6, fps: 4, loop: true },
  review: { row: 8, frames: 6, fps: 5, loop: true },
};

const STATE_ACTION: Record<PetState, SpriteAction> = {
  sleeping: "idle",
  walking: "runningRight",
  running: "runningRight",
  drinking: "review",
  active: "jumping",
  abnormal_active: "failed",
  offline: "waiting",
};

declare global {
  interface Window {
    cyberpet?: {
      stepWindow: (deltaX: number) => Promise<{ direction: "left" | "right" }>;
    };
  }
}

export function SpritePet({
  state,
  connected,
  waving,
}: {
  state: StatePayload | null;
  connected: boolean;
  waving: boolean;
}) {
  const [frame, setFrame] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const stateName = state?.state || "offline";

  const baseAction = useMemo<SpriteAction>(() => {
    if (!connected) return "waiting";
    const mapped = STATE_ACTION[stateName];
    if (mapped === "runningRight") {
      return direction === "right" ? "runningRight" : "runningLeft";
    }
    return mapped;
  }, [connected, direction, stateName]);

  const action = waving ? "waving" : baseAction;
  const config = ACTIONS[action];

  useEffect(() => {
    setFrame(0);
  }, [action]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setFrame((current) => {
        const next = current + 1;
        if (next < config.frames) return next;
        return config.loop ? 0 : config.frames - 1;
      });
    }, 1000 / config.fps);
    return () => window.clearInterval(interval);
  }, [config.fps, config.frames, config.loop]);

  useEffect(() => {
    const moving = connected && (stateName === "running" || stateName === "walking");
    if (!moving || !window.cyberpet?.stepWindow) return;
    const speed = stateName === "running" ? 14 : 6;
    const interval = window.setInterval(async () => {
      const delta = direction === "right" ? speed : -speed;
      const result = await window.cyberpet?.stepWindow(delta);
      if (result?.direction) setDirection(result.direction);
    }, 90);
    return () => window.clearInterval(interval);
  }, [connected, direction, stateName]);

  return (
    <div className={`sprite-pet sprite-${action}`} aria-label={state?.label || "桌面宠物"}>
      <div
        className="sprite-frame"
        style={{
          backgroundImage: `url(${SHEET_URL})`,
          backgroundPosition: `-${frame * FRAME_SIZE}px -${config.row * FRAME_SIZE}px`,
        }}
      />
      <div className="sprite-shadow" />
    </div>
  );
}
