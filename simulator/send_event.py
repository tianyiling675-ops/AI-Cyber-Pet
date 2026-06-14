from __future__ import annotations

from datetime import datetime, timezone
import argparse
import random
import time
import urllib.request
import json


STATES = [
    "sleeping",
    "walking",
    "running",
    "drinking",
    "active",
    "abnormal_active",
    "offline",
]


def post_event(api_base: str, state: str) -> None:
    payload = {
        "pet_id": "orange_cat_001",
        "device_id": "collar_demo_001",
        "state": state,
        "confidence": 0 if state == "offline" else round(random.uniform(0.82, 0.98), 2),
        "duration_sec": random.randint(5, 180),
        "battery": random.randint(72, 96),
        "source": "simulator",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "raw": {
            "accel_mean": round(random.uniform(0.05, 2.4), 2),
            "gyro_mean": round(random.uniform(0.03, 1.1), 2),
        },
    }
    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        f"{api_base}/api/device/events",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=5) as response:
        print(response.read().decode("utf-8"))


def main() -> None:
    parser = argparse.ArgumentParser(description="CyberPet state simulator")
    parser.add_argument("--api", default="http://localhost:8000", help="Backend API base URL")
    parser.add_argument("--state", choices=STATES, help="Send a single state")
    parser.add_argument("--loop", action="store_true", help="Loop through states")
    parser.add_argument("--interval", type=float, default=4, help="Loop interval seconds")
    args = parser.parse_args()

    if args.state:
        post_event(args.api, args.state)
        return

    if args.loop:
        sequence = ["sleeping", "drinking", "walking", "running", "active", "abnormal_active"]
        index = 0
        while True:
            post_event(args.api, sequence[index % len(sequence)])
            index += 1
            time.sleep(args.interval)
        return

    parser.print_help()


if __name__ == "__main__":
    main()
