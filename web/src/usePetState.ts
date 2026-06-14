import { useEffect, useState } from "react";
import { getState, WS_BASE } from "./api";
import type { StatePayload } from "./types";

export function usePetState() {
  const [state, setState] = useState<StatePayload | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    getState().then((data) => setState(data.state)).catch(() => undefined);
    let closed = false;
    let ws: WebSocket | null = null;

    function connect() {
      if (closed) return;
      ws = new WebSocket(`${WS_BASE}/ws/state`);
      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        if (!closed) window.setTimeout(connect, 1000);
      };
      ws.onerror = () => setConnected(false);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "state_update") {
          setState(data.payload);
        }
      };
    }

    connect();
    return () => {
      closed = true;
      ws?.close();
    };
  }, []);

  return { state, connected };
}
