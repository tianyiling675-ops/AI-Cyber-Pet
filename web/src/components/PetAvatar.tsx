import type { StatePayload } from "../types";
import { statusVisual } from "../status";

export function PetAvatar({ state, compact = false }: { state: StatePayload | null; compact?: boolean }) {
  const visual = statusVisual[state?.state || "offline"];
  return (
    <div className={`pet-avatar ${visual.className} ${compact ? "compact" : ""}`}>
      <div className="cat-head">
        <span className="ear left" />
        <span className="ear right" />
        <span className="eye left" />
        <span className="eye right" />
        <span className="nose" />
        <span className="whisker left top" />
        <span className="whisker left bottom" />
        <span className="whisker right top" />
        <span className="whisker right bottom" />
      </div>
      <div className="cat-body" />
      <div className="cat-tail" />
      <div className="state-chip" style={{ borderColor: visual.accent }}>
        {state?.label || "等待连接"}
      </div>
    </div>
  );
}
