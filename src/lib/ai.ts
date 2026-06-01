import { OpenRouter } from "@openrouter/sdk"

export async function generate(prompt: string): Promise<string> {
  const client = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
    serverURL: "https://ai.hackclub.com/proxy/v1"
  })

  const response = await client.chat.send({
    chatRequest: {
      model: "qwen/qwen3-32b",
      messages: [
        { role: "user", content: prompt }
      ],
      stream: false,
    },
  })

  return response.choices[0].message.content
}