import type { PetState } from "./types";

export const statusVisual: Record<
  PetState,
  { icon: string; className: string; accent: string; description: string }
> = {
  sleeping: {
    icon: "Zzz",
    className: "pet-sleeping",
    accent: "#6c7bd9",
    description: "尾巴卷起来，呼吸很轻",
  },
  walking: {
    icon: "Walk",
    className: "pet-walking",
    accent: "#4a9f7b",
    description: "慢慢巡视地盘",
  },
  running: {
    icon: "Run",
    className: "pet-running",
    accent: "#f05a4f",
    description: "进入跑酷模式",
  },
  drinking: {
    icon: "Sip",
    className: "pet-drinking",
    accent: "#2f9fda",
    description: "刚补充完水分",
  },
  active: {
    icon: "Play",
    className: "pet-active",
    accent: "#d58a20",
    description: "正在忙猫生大事",
  },
  abnormal_active: {
    icon: "Alert",
    className: "pet-alert",
    accent: "#d5385c",
    description: "活动强度偏高",
  },
  offline: {
    icon: "Off",
    className: "pet-offline",
    accent: "#7a7d86",
    description: "等待脖环重新连接",
  },
};

export function formatTime(value?: string) {
  if (!value) return "--";
  return new Date(value).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
