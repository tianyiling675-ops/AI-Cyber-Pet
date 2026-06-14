export type PetState =
  | "sleeping"
  | "walking"
  | "running"
  | "drinking"
  | "active"
  | "abnormal_active"
  | "offline";

export type StatePayload = {
  pet_id: string;
  device_id: string;
  state: PetState;
  label: string;
  mood: string;
  message_hint: string;
  confidence: number;
  duration_sec: number;
  battery: number;
  source: string;
  timestamp: string;
};

export type Memory = {
  id: number;
  pet_id: string;
  memory_date: string;
  title: string;
  type: string;
  content: string;
  media_path?: string | null;
  tags: string[];
  ai_extracted: {
    scene?: string;
    emotion?: string;
    personality_clue?: string;
    key_moment?: string;
  };
  created_at: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  mode?: string;
};
