import { formatTime } from "../status";
import type { StatePayload } from "../types";

export function EventTimeline({ events }: { events: StatePayload[] }) {
  return (
    <section className="timeline-panel">
      <div className="section-title">
        <span>今日行为</span>
        <small>{events.length} 条</small>
      </div>
      <div className="event-list">
        {events.slice(0, 8).map((event, index) => (
          <div className="event-row" key={`${event.timestamp}-${index}`}>
            <time>{formatTime(event.timestamp)}</time>
            <strong>{event.label}</strong>
            <span>{Math.round(event.confidence * 100)}%</span>
          </div>
        ))}
      </div>
    </section>
  );
}
