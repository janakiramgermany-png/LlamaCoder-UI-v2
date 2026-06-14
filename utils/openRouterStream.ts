import { streamText } from "ai";

export const MODEL_REGISTRY = {
  "openrouter/auto": {
    name: "Auto (Best Available)",
    description: "Automatically selects the best available model",
  },
  "openrouter/free": {
    name: "Free Model",
    description: "A free model for code generation",
  },
  "01-preview": {
    name: "01 Preview",
    description: "OpenAI's latest preview model",
  },
  "deepseek-chat": {
    name: "DeepSeek Chat",
    description: "DeepSeek's latest chat model",
  },
};

export async function* openRouterStream(
  prompt: string,
  model: string,
  temperature: number = 0.7
) {
  try {
    const result = await streamText({
      model: `openrouter/${model}`,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature,
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    for await (const chunk of result.textStream) {
      yield chunk;
    }
  } catch (error) {
    console.error("[v0] OpenRouter streaming error:", error);
    throw error;
  }
}

