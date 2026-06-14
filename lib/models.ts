// OpenRouter model registry — single source of truth for both homepage and /chats
export const MODELS = [
  {
    id: "openrouter/auto",
    label: "Auto (Best)",
    value: "openrouter/auto",
    badge: "Recommended",
  },
  {
    id: "openrouter/free",
    label: "Free",
    value: "openrouter/free",
    badge: "Free",
  },
  {
    id: "kimi",
    label: "Kimi",
    value: "moonshotai/kimi-k2",
    badge: "Latest",
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    value: "deepseek/deepseek-chat",
    badge: "Latest",
  },
]

export const DEFAULT_MODEL = MODELS[0]
