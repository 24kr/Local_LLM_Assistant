export const FILE_TONES = {
  red: { accent: "#DC2626", background: "#FEE2E2", text: "#7F1D1D" },
  blue: { accent: "#2563EB", background: "#DBEAFE", text: "#1E3A8A" },
  cyan: { accent: "#0891B2", background: "#CFFAFE", text: "#164E63" },
  green: { accent: "#059669", background: "#D1FAE5", text: "#065F46" },
  emerald: { accent: "#10B981", background: "#D1FAE5", text: "#065F46" },
  amber: { accent: "#D97706", background: "#FEF3C7", text: "#78350F" },
  orange: { accent: "#EA580C", background: "#FED7AA", text: "#7C2D12" },
  purple: { accent: "#7C3AED", background: "#EDE9FE", text: "#4C1D95" },
  pink: { accent: "#DB2777", background: "#FCE7F3", text: "#831843" },
  indigo: { accent: "#4F46E5", background: "#E0E7FF", text: "#312E81" },
  slate: { accent: "#475569", background: "#E2E8F0", text: "#1E293B" },
  yellow: { accent: "#CA8A04", background: "#FEF9C3", text: "#713F12" },
  teal: { accent: "#0F766E", background: "#CCFBF1", text: "#134E4A" },
  rose: { accent: "#E11D48", background: "#FFE4E6", text: "#881337" },
};

export function getCapabilityMeta(capability, iconMap) {
  const normalized = capability?.toLowerCase?.() || "";

  switch (normalized) {
    case "vision":
      return { label: "Vision", color: "purple", Icon: iconMap.VisionIcon };
    case "coding":
      return { label: "Coding", color: "blue", Icon: iconMap.CodeIcon };
    case "chat":
      return { label: "Chat", color: "green", Icon: iconMap.ChatBubbleIcon };
    case "embedding":
      return { label: "Embedding", color: "orange", Icon: iconMap.EmbeddingIcon };
    default:
      return { label: capability || "General", color: "gray", Icon: iconMap.BotIcon };
  }
}
